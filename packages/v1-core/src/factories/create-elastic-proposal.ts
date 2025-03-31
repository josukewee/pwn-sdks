import type { AddressString, UserWithNonceManager } from "@pwndao/sdk-core";
import type { Hex } from "@pwndao/sdk-core";
import { getLoanContractAddress } from "@pwndao/sdk-core";
import { ElasticProposal } from "../models/proposals/elastic-proposal.js";
import type { IElasticProposalBase } from "../models/proposals/proposal-base.js";
import type {
	IProposalStrategy,
	Strategy,
	StrategyTerm,
} from "../models/strategies/types.js";
import { calculateCreditPerCollateralUnit } from "../utils/calculations.js";
import {
	getLendingCommonProposalFields,
	type ILoanContract,
} from "./helpers.js";
import type { BaseTerm, IServerAPI } from "./types.js";
import type { IProposalElasticContract } from "../contracts/elastic-proposal-contract.js";
import { LTV_DENOMINATOR } from "./constants.js";
import { API } from "../api.js";
import type { ProposalParamWithDeps, ImplementedProposalTypes } from "../actions/types.js";
import { ProposalType } from "../models/proposals/proposal-base.js";
import { ElasticProposalContract } from "../contracts/elastic-proposal-contract.js";
import { SimpleLoanContract } from "../contracts/simple-loan-contract.js";
import { createUtilizedCreditId } from "../utils/shared-credit.js";
import type { Config } from "@wagmi/core";

export type CreateElasticProposalParams = BaseTerm & {
	minCreditAmountPercentage: number;
};

export interface IProposalElasticAPIDeps {
	persistProposal: IServerAPI["post"]["persistProposal"];
	getAssetUsdUnitPrice: IServerAPI["get"]["getAssetUsdUnitPrice"];
	persistProposals: IServerAPI["post"]["persistProposals"];
	updateNonces: IServerAPI["post"]["updateNonce"];
}

export class ElasticProposalStrategy
	implements IProposalStrategy<IElasticProposalBase>
{
	constructor(
		public term: StrategyTerm,
		public api: IProposalElasticAPIDeps,
		public contract: IProposalElasticContract,
		public loanContract: ILoanContract,
	) {}

	async implementElasticProposal(
		params: CreateElasticProposalParams,
		api: IProposalElasticAPIDeps,
		contract: IProposalElasticContract,
	): Promise<ElasticProposal> {
		// Calculate expiration timestamp
		const expiration =
			Math.floor(Date.now() / 1000) + params.expirationDays * 24 * 60 * 60;

		// Get duration in seconds or timestamp
		let durationOrDate: number;
		if (params.duration.days !== undefined) {
			durationOrDate = params.duration.days * 24 * 60 * 60;
		} else {
			durationOrDate = Math.floor(params.duration.date.getTime() / 1000);
		}

		// Get collateral amount based on credit amount, LTV, and prices
		const creditUsdPrice = await api.getAssetUsdUnitPrice(params.credit);
		const collateralUsdPrice = await api.getAssetUsdUnitPrice(
			params.collateral,
		);

		const creditAmountUsd =
			(params.creditAmount * creditUsdPrice) /
			BigInt(10 ** params.credit.decimals);
		const minCreditAmountUsd =
			(BigInt(params.minCreditAmountPercentage) * params.creditAmount) / BigInt(100);

		const ltv =
			typeof params.ltv === 'object' 
				? params.ltv[
					`${params.collateral.address}/${params.collateral.chainId}-${params.credit.address}/${params.credit.chainId}`
				] ?? 0
				: params.ltv;

		// Apply LTV ratio
		const collateralAmountUsd = (creditAmountUsd * BigInt(LTV_DENOMINATOR)) / BigInt(ltv);

		// Convert back to collateral tokens
		const collateralAmount =
			(collateralAmountUsd * BigInt(10 ** params.collateral.decimals)) /
			collateralUsdPrice;

		// Get common proposal fields
		const commonFields = await getLendingCommonProposalFields(
			{
				user: params.user,
				collateral: params.collateral,
				credit: params.credit,
				creditAmount: params.creditAmount,
				utilizedCreditId: params.utilizedCreditId,
				durationOrDate,
				apr: params.apr,
				expiration,
				loanContract: getLoanContractAddress(params.collateral.chainId),
				relatedStrategyId: this.term.relatedStrategyId,
			},
			{
				contract: contract,
				loanContract: this.loanContract,
			},
		);

		const creditPerCollateralUnit = calculateCreditPerCollateralUnit(
			params.creditAmount,
			collateralAmount,
		);

		// Create and return the Elastic proposal
		return new ElasticProposal(
			{
				...commonFields,
				creditPerCollateralUnit: BigInt(creditPerCollateralUnit),
				minCreditAmount: minCreditAmountUsd,
				availableCreditLimit: params.creditAmount,
				chainId: params.collateral.chainId,
				isOffer: params.isOffer
			},
			params.collateral.chainId,
		);
	}

	/**
	 * Get the proposals parameters to be later be consumed by the createElasticProposal
	 *
	 * @param user - The user creating the proposal
	 * @param creditAmount - The credit amount for the proposal
	 * @param utilizedCreditId - if provided, all credits with share the same utilized credit ID
	 * @param isOffer - if true, the proposal is an offer
	 * @returns The proposals parameters
	 */
	getProposalsParams(
		user: UserWithNonceManager,
		creditAmount: bigint,
		utilizedCreditId: Hex,
		isOffer: boolean,
	): CreateElasticProposalParams[] {
		const result: CreateElasticProposalParams[] = [];
		for (const credit of this.term.creditAssets) {
			for (const collateral of this.term.collateralAssets) {
				result.push({
					collateral,
					credit,
					user,
					creditAmount,
					utilizedCreditId,

					apr: this.term.apr,
					duration: {
						days: this.term.durationDays,
						date: undefined,
					},
					ltv: this.term.ltv,
					expirationDays: this.term.expirationDays,
					minCreditAmountPercentage: this.term.minCreditAmountPercentage,
					relatedStrategyId: this.term.relatedStrategyId,
					isOffer
				});
			}
		}

		return result;
	}

	/**
	 * Get the lending proposals
	 *
	 * @param user - The user creating the proposal
	 * @param creditAmount - The credit amount for the proposal
	 * @param utilizedCreditId - if provided, all credits with share the same utilized credit ID
	 * @returns The lending proposals
	 */
	async createLendingProposals(
		user: UserWithNonceManager,
		creditAmount: bigint,
		utilizedCreditId: Hex,
		isOffer: boolean,
	): Promise<ElasticProposal[]> {
		const paramsArray = this.getProposalsParams(
			user,
			creditAmount,
			utilizedCreditId,
			isOffer,
		);
		const result: ElasticProposal[] = [];

		const proposals = await Promise.allSettled(
			paramsArray.map(async (params) => {
				try {
					// Use the shared implementation directly
					return await this.implementElasticProposal(
						params,
						this.api,
						this.contract,
					);
				} catch (error) {
					console.error("Error creating Elastic proposal:", error);
					throw error;
				}
			}),
		);

		for (const proposal of proposals) {
			if (proposal.status === "fulfilled") {
				result.push(proposal.value);
			} else {
				throw new Error("Error creating Elastic proposal:", proposal.reason);
			}
		}

		return result;
	}
}

export type ElasticProposalDeps = {
	api: IProposalElasticAPIDeps;
	contract: IProposalElasticContract;
	loanContract: ILoanContract;
};

/**
 * Creates an elastic proposal
 *
 * @param params - The parameters for the proposal
 * @param deps - RPC interface and contract
 * @returns The created proposal
 */
export const createElasticProposal = async (
	params: CreateElasticProposalParams,
	deps: ElasticProposalDeps,
): Promise<ElasticProposal> => {
	const dummyTerm: StrategyTerm = {
		creditAssets: [params.credit],
		collateralAssets: [params.collateral],
		apr: params.apr,
		durationDays: params.duration.days || 0,
		ltv: params.ltv,
		expirationDays: params.expirationDays,
		minCreditAmountPercentage: params.minCreditAmountPercentage,
		relatedStrategyId: params.relatedStrategyId,
	};

	const strategy = new ElasticProposalStrategy(
		dummyTerm,
		deps.api,
		deps.contract,
		deps.loanContract,
	);
	const proposals = await strategy.createLendingProposals(
		params.user,
		params.creditAmount,
		params.utilizedCreditId,
		params.isOffer,
	);
	return proposals[0];
};

/**
 * Parameters for creating a batch of elastic proposals
 */
export type CreateElasticProposalBatchParams = CreateElasticProposalParams[];

export const createElasticProposals = (
	strategy: Strategy,
	user: UserWithNonceManager,
	address: AddressString,
	creditAmount: string,
	config: Config
): ProposalParamWithDeps<ImplementedProposalTypes>[] => {
	const proposals: ProposalParamWithDeps<ImplementedProposalTypes>[] = [];
	
	const apiDeps = {
		persistProposal: API.post.persistProposal,
		getAssetUsdUnitPrice: API.get.getAssetUsdUnitPrice,
		persistProposals: API.post.persistProposals,
		updateNonces: API.post.updateNonce,
	} as IProposalElasticAPIDeps;
	
	for (const creditAsset of strategy.terms.creditAssets) {
		const utilizedCreditId = createUtilizedCreditId({
			proposer: address,
			availableCreditLimit: BigInt(creditAmount),
		});
		
		for (const collateralAsset of strategy.terms.collateralAssets) {
			proposals.push({
				type: ProposalType.Elastic,
				deps: {
					api: apiDeps,
					contract: new ElasticProposalContract(config),
					loanContract: new SimpleLoanContract(config),
				},
				params: {
					user: user,
					creditAmount: BigInt(creditAmount),
					ltv: strategy.terms.ltv,
					apr: strategy.terms.apr,
					duration: {
						days: strategy.terms.durationDays,
					},
					expirationDays: strategy.terms.expirationDays,
					utilizedCreditId: utilizedCreditId,
					minCreditAmountPercentage: strategy.terms.minCreditAmountPercentage,
					isOffer: true,
					relatedStrategyId: strategy.id,
					collateral: collateralAsset,
					credit: creditAsset,
				}
			});
		}
	}
	
	return proposals;
};