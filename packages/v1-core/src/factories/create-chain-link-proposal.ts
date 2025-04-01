import type { BaseTerm, IServerAPI } from './types.js';
import { ProposalType, type IOracleProposalBase } from '../models/proposals/proposal-base.js';
import type {
  IProposalStrategy,
  Strategy,
  StrategyTerm,
} from '../models/strategies/types.js';
import {
  getLendingCommonProposalFields,
  type ILoanContract,
} from './helpers.js';
import type {
  AddressString,
  Hex,
  UserWithNonceManager,
} from '@pwndao/sdk-core';
import { ChainLinkProposal } from '../models/proposals/chainlink-proposal.js';
import { getLoanContractAddress, getUniqueCreditCollateralKey } from '@pwndao/sdk-core';
import { ChainLinkProposalContract, type IProposalChainLinkContract } from '../contracts/chain-link-proposal-contract.js';
import { type ChainsWithChainLinkFeedSupport, getFeedData } from '../utils/chainlink-feeds.js';
import invariant from 'ts-invariant';
import type { Config } from '@wagmi/core';
import { SimpleLoanContract } from '../contracts/simple-loan-contract.js';
import { createUtilizedCreditId } from '../utils/shared-credit.js';
import type { ImplementedProposalTypes, ProposalParamWithDeps } from '../actions/types.js';
import { API } from '../api.js';
import { LTV_DENOMINATOR_MULTIPLIER } from './constants.js';

export type CreateChainLinkElasticProposalParams = BaseTerm & {
	minCreditAmountPercentage: number;
};

export class ChainLinkProposalStrategy
  implements IProposalStrategy<IOracleProposalBase>
{
  constructor(
    public term: StrategyTerm ,
    public contract: IProposalChainLinkContract,
    public loanContract: ILoanContract,
  ) {}

  async implementChainLinkProposal(
    params: CreateChainLinkElasticProposalParams,
    contract: IProposalChainLinkContract
  ): Promise<ChainLinkProposal | undefined> {
    // Calculate expiration timestamp
    const expiration = Math.floor(Date.now() / 1000) + params.expirationDays * 24 * 60 * 60;

    // Get duration in seconds or timestamp
    let durationOrDate: number;
    if (params.duration.days !== undefined) {
      durationOrDate = params.duration.days * 24 * 60 * 60;
    } else {
      durationOrDate = Math.floor(params.duration.date.getTime() / 1000);
    }

    const ltv =
      typeof params.ltv === 'object' 
        ? params.ltv?.[
          getUniqueCreditCollateralKey(params.credit, params.collateral)
        ]
        : params.ltv;
    
    invariant(ltv, "LTV is undefined");

    const feedData = getFeedData(params.collateral.chainId as ChainsWithChainLinkFeedSupport, params.collateral.address, params.credit.address)
    invariant(feedData, "We did not find a suitable price feed. Create classic elastic proposal instead.")

		const minCreditAmount =
			(BigInt(params.minCreditAmountPercentage) * params.creditAmount) / BigInt(100);

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
      }
    );

    // Create and return the ChainLink proposal
    return new ChainLinkProposal(
      {
        ...commonFields,
        feedIntermediaryDenominations: feedData.feedIntermediaryDenominations,
        feedInvertFlags: feedData.feedInvertFlags,
        loanToValue: BigInt(ltv * LTV_DENOMINATOR_MULTIPLIER),
        minCreditAmount,
        chainId: params.collateral.chainId,
      },
      params.collateral.chainId
    );
  }

  getProposalsParams(
    user: UserWithNonceManager,
    creditAmount: bigint,
    utilizedCreditId: Hex,
    isOffer: boolean
  ): CreateChainLinkElasticProposalParams[] {
    const result: CreateChainLinkElasticProposalParams[] = [];
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
					relatedStrategyId: this.term.id,
					isOffer,
				});
			}
		}

    return result;
  }

  async createLendingProposals(
    user: UserWithNonceManager,
    creditAmount: bigint,
    utilizedCreditId: Hex,
    isOffer: boolean,
  ): Promise<ChainLinkProposal[]> {
    const paramsArray = this.getProposalsParams(
      user,
      creditAmount,
      utilizedCreditId,
      isOffer,
    );
    const result: ChainLinkProposal[] = [];

    const proposals = await Promise.allSettled(
      paramsArray.map(async (params) => {
        try {
          // Use the shared implementation directly
          return await this.implementChainLinkProposal(
            params,
            this.contract,
          );
        } catch (error) {
          console.error('Error creating ChainLink proposal:', error);
          throw error;
        }
      })
    );

    for (const proposal of proposals) {
      if (proposal.status === 'fulfilled' && proposal.value) {
        result.push(proposal.value);
      }
    }

    return result;
  }
}

// TODO create some base interface that contains all the necessary 
//  API deps for e.g. makeProposal / makeProposals functions (and some other shared functions?)?
export interface IProposalChainLinkAPIDeps {
	persistProposal: IServerAPI["post"]["persistProposal"];
	persistProposals: IServerAPI["post"]["persistProposals"];
	updateNonces: IServerAPI["post"]["updateNonce"];
}

export type ChainLinkElasticProposalDeps = {
  api: IProposalChainLinkAPIDeps
  contract: IProposalChainLinkContract;
  loanContract: ILoanContract;
}

export const createChainLinkElasticProposal = async (
  params: CreateChainLinkElasticProposalParams,
  deps: ChainLinkElasticProposalDeps
): Promise<ChainLinkProposal> => {
	// Create a dummy StrategyTerm with just enough data for the strategy to work
	const dummyTerm: StrategyTerm = {
		creditAssets: [params.credit],
		collateralAssets: [params.collateral],
		apr: params.apr,
		durationDays: params.duration.days || 0,
		ltv: params.ltv,
		expirationDays: params.expirationDays,
		minCreditAmountPercentage: params.minCreditAmountPercentage,
		relatedStrategyId: params.relatedStrategyId
	};

  const strategy = new ChainLinkProposalStrategy(
    dummyTerm,
    deps.contract as IProposalChainLinkContract,
    deps.loanContract,
  );
  const proposals = await strategy.createLendingProposals(
    params.user,
    params.creditAmount,
    params.utilizedCreditId,
    params.isOffer
  );
  return proposals[0];
};

/**
 * Parameters for creating a batch of elastic proposals
 */
export type CreateChainLinkElasticProposalBatchParams = CreateChainLinkElasticProposalParams[];

export const createChainLinkProposals = (
  strategy: Strategy,
  user: UserWithNonceManager,
  address: AddressString,
  creditAmount: string,
  config: Config
) => {
	const proposals: ProposalParamWithDeps<ImplementedProposalTypes>[] = [];

  const apiDeps = {
    persistProposal: API.post.persistProposal,
    persistProposals: API.post.persistProposals,
    updateNonces: API.post.updateNonce,
  } as IProposalChainLinkAPIDeps;

	for (const creditAsset of strategy.terms.creditAssets) {
		const utilizedCreditId = createUtilizedCreditId({
			proposer: address,
			availableCreditLimit: BigInt(creditAmount),
		});
		
		for (const collateralAsset of strategy.terms.collateralAssets) {
			proposals.push({
				type: ProposalType.ChainLink,
				deps: {
					api: apiDeps,
					contract: new ChainLinkProposalContract(config),
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
}