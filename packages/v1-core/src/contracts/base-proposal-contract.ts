import { SimpleMerkleTree } from "@openzeppelin/merkle-tree";
import type { Config } from "@wagmi/core";
import type {
	IProposalContract,
	IServerAPI,
	Proposal,
	ProposalWithHash,
} from "src/index.js";
import type { ProposalWithSignature } from "src/models/strategies/types.js";
import type { Hex } from "viem";

export abstract class BaseProposalContract<TProposal extends Proposal>
	implements IProposalContract<TProposal>
{
	constructor(protected readonly config: Config) {}

	abstract getProposalHash(proposal: TProposal): Promise<Hex>;
	abstract createProposal(
		params: TProposal,
		deps: { persistProposal: IServerAPI["post"]["persistProposal"] },
	): Promise<ProposalWithSignature>;
	abstract createOnChainProposal(
		params: TProposal,
	): Promise<ProposalWithSignature>;
	abstract createMultiProposal(
		proposals: ProposalWithHash[],
	): Promise<ProposalWithSignature[]>;

	getMerkleTreeForSigning(
		proposals: ProposalWithHash[],
	) {
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

		return {
			domain: multiproposalDomain,
			types,
			primaryType: "Multiproposal",
			message: { multiproposalMerkleRoot },
		} as const
	}
}
