import { signTypedData } from "@wagmi/core";
import type { ProposalWithHash } from "src/models/strategies/types.js";
import { SimpleMerkleTree } from "@openzeppelin/merkle-tree";
import type { Config } from "@wagmi/core";
import type { ProposalWithSignature } from "src/models/strategies/types.js";
import type { IProposalContract, IServerAPI, Proposal } from "src/index.js";
import type { Hex } from "viem";

export abstract class BaseProposalContract<TProposal extends Proposal> implements IProposalContract<TProposal> {
	constructor(protected readonly config: Config) {}

    abstract getProposalHash(proposal: TProposal): Promise<Hex>;
    abstract createProposal(params: TProposal, deps: { persistProposal: IServerAPI["post"]["persistProposal"]; }): Promise<ProposalWithSignature>;
    abstract createOnChainProposal(params: TProposal): Promise<ProposalWithSignature>;

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
}