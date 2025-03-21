import { SimpleMerkleTree } from "@openzeppelin/merkle-tree";
import {
	ZERO_ADDRESS,
	getElasticProposalContractAddress,
} from "@pwndao/sdk-core";
import { type Config, signTypedData } from "@wagmi/core";
import type { Hex } from "viem";
import {
	type IProposalContract,
	type IServerAPI,
	type ProposalWithHash,
	type ProposalWithSignature,
	readPwnSimpleLoanElasticProposalGetProposalHash,
} from "../index.js";
import { readPwnSimpleLoanElasticProposalGetCollateralAmount } from "../index.js";
import { ElasticProposal } from "../models/proposals/elastic-proposal.js";

export interface IProposalElasticContract extends IProposalContract {
	getCollateralAmount(proposal: ElasticProposal): Promise<bigint>;
	getProposalHash(proposal: ElasticProposal): Promise<Hex>;
	createProposal(proposal: ElasticProposal, deps: { persistProposal: IServerAPI["post"]["persistProposal"] }): Promise<ProposalWithSignature>;
	createMultiProposal(proposals: ProposalWithHash[]): Promise<ProposalWithSignature[]>;
}

export class ElasticProposalContract implements IProposalElasticContract {
	constructor(private readonly config: Config) {}

	async getProposalHash(proposal: ElasticProposal): Promise<Hex> {
		// on-chain call is not required here. We can just use hashTypedData from wagmi
		const data = await readPwnSimpleLoanElasticProposalGetProposalHash(
			this.config,
			{
				address: getElasticProposalContractAddress(proposal.chainId),
				chainId: proposal.chainId,
				args: [proposal.createProposalStruct()],
			},
		);
		return data as Hex;
	}

	async signProposal(proposal: ElasticProposal): Promise<ProposalWithSignature> {
		const domain = {
			name: 'PWNSimpleLoanElasticProposal',
			version: '1.1',
			chainId: proposal.chainId,
			verifyingContract: getElasticProposalContractAddress(proposal.chainId),
		  }

		const signature = await signTypedData(this.config, {
      		domain,
			types: ElasticProposal.ERC712_TYPES,
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

	// TODO also create function that creates the proposal on chain?
	//  or we can also possibly add some flag like "createOnChain"?
	async createProposal(
		proposal: ElasticProposal,
		deps: {
			persistProposal: IServerAPI["post"]["persistProposal"];
		}
	): Promise<ProposalWithSignature> {
		// const data = await writePwnSimpleLoanElasticProposalMakeProposal(
		// 	this.config,
		// 	{
		// 		address: getElasticProposalContractAddress(proposal.chainId),
		// 		chainId: proposal.chainId,
		// 		args: [proposal.createProposalStruct()],
		// 	},
		// );

		// return Object.assign(proposal, {
		// 	signature: data,
		// 	hash: ZERO_ADDRESS, // todo: compute hash here
		// 	isOnChain: true,
		// }) as ProposalWithSignature;

		// TODO do we need hash?
		const signedProposal = await this.signProposal(proposal);
		await deps.persistProposal(signedProposal);
		return signedProposal
	}

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

	async getCollateralAmount(proposal: ElasticProposal): Promise<bigint> {
		const data = await readPwnSimpleLoanElasticProposalGetCollateralAmount(
			this.config,
			{
				address: getElasticProposalContractAddress(proposal.chainId),
				chainId: proposal.chainId,
				args: [proposal.availableCreditLimit, proposal.creditPerCollateralUnit],
			},
		);
		return data;
	}
}
