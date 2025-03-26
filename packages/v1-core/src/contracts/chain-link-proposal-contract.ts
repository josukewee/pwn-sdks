import { SimpleMerkleTree } from "@openzeppelin/merkle-tree";
import {
	ZERO_ADDRESS,
	getChainLinkProposalContractAddress,
} from "@pwndao/sdk-core";
import { type Config, signTypedData } from "@wagmi/core";
import type { Hex } from "viem";
import {
	ChainLinkProposal,
	type IProposalContract,
	type ProposalWithHash,
	type ProposalWithSignature,
	readPwnSimpleLoanElasticChainlinkProposalGetCollateralAmount,
	readPwnSimpleLoanElasticChainlinkProposalGetProposalHash,
} from "../index.js";
import type { IServerAPI } from "../factories/types.js";

export interface IProposalChainLinkContract extends IProposalContract {
	getProposalHash(proposal: ChainLinkProposal): Promise<Hex>;
	getCollateralAmount(proposal: ChainLinkProposal): Promise<bigint>;
	createProposal(proposal: ChainLinkProposal, deps: { persistProposal: IServerAPI["post"]["persistProposal"] }): Promise<ProposalWithSignature>;
	createMultiProposal(proposals: ProposalWithHash[]): Promise<ProposalWithSignature[]>;
  }

export class ChainLinkProposalContract implements IProposalChainLinkContract {
	constructor(private readonly config: Config) {}

	async getProposalHash(proposal: ChainLinkProposal): Promise<Hex> {
		// on-chain call is not required here. We can just use hashTypedData from wagmi
		const data = await readPwnSimpleLoanElasticChainlinkProposalGetProposalHash(
			this.config,
			{
				address: getChainLinkProposalContractAddress(proposal.chainId),
				chainId: proposal.chainId,
				args: [proposal.createProposalStruct()],
			},
		);
		return data as Hex;
	}

	async signProposal(proposal: ChainLinkProposal): Promise<ProposalWithSignature> {
		const domain = {
			name: 'PWNSimpleLoanElasticChainlinkProposal',
			version: '1.0',
			chainId: proposal.chainId,
			verifyingContract: getChainLinkProposalContractAddress(proposal.chainId),
		  }

		const signature = await signTypedData(this.config, {
      		domain,
			types: ChainLinkProposal.ERC712_TYPES,
      		primaryType: 'Proposal',
      		message: proposal.createProposalStruct(),
		})

		// TODO is this correct?
		return Object.assign(proposal, {
			signature,
			// TODO do we need hash?
			hash: ZERO_ADDRESS, // todo: compute hash here
			isOnChain: false,
		}) as ProposalWithSignature;
	}

	async createProposal(
		proposal: ChainLinkProposal,
		deps: {
			persistProposal: IServerAPI["post"]["persistProposal"];
		}
	): Promise<ProposalWithSignature> {
		// const data = await writePwnSimpleLoanElasticChainlinkProposalMakeProposal(
		// 	this.config,
		// 	{
		// 		address: getChainLinkProposalContractAddress(proposal.chainId),
		// 		chainId: proposal.chainId,
		// 		args: [proposal.createProposalStruct()],
		// 	},
		// );

		// return Object.assign(proposal, {
		// 	signature: data,
		// 	hash: ZERO_ADDRESS, // todo: compute hash here
		// 	isOnChain: true,
		// }) as ProposalWithSignature;

		const signedProposal = await this.signProposal(proposal);
		await deps.persistProposal(signedProposal);
		return signedProposal
	}

	// TODO: this is exactly same function as in elastic-proposal-contract
	//  should we move the code to some common base?
	async createMultiProposal(
		proposals: ProposalWithHash[],
	): Promise<ProposalWithSignature[]> {
		// todo: take this from func args
		const merkleTree = SimpleMerkleTree.of(
			proposals.map((proposal) => proposal.hash),
		);
		const multiproposalMerkleRoot = merkleTree.root;

		const multiproposalDomain = {
			name: "PWNMultiproposal",
		};

		const types = {
			Multiproposal: [{ name: "multiproposalMerkleRoot", type: "bytes32" }],
		};

		const signature = await signTypedData(this.config, {
			domain: multiproposalDomain,
			types,
			primaryType: "Multiproposal",
			message: {
				multiproposalMerkleRoot,
			},
		});

		return proposals.map(
			(proposal) =>
				({
					...proposal,
					hash: proposal.hash,
					multiproposalMerkleRoot,
					signature,
				}) as ProposalWithSignature,
		);
	}

	async getCollateralAmount(proposal: ChainLinkProposal): Promise<bigint> {
		const data = await readPwnSimpleLoanElasticChainlinkProposalGetCollateralAmount(
			this.config,
			{
				address: getChainLinkProposalContractAddress(proposal.chainId),
				chainId: proposal.chainId,
				args: [
					proposal.creditAddress,
					proposal.availableCreditLimit,
					proposal.collateralAddress,
					proposal.feedIntermediaryDenominations,
					proposal.feedInvertFlags,
					proposal.loanToValue
				],
			},
		);
		return data;
	}
}
