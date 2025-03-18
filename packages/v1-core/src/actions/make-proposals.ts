import type { SupportedChain } from "@pwndao/sdk-core";
import type { ProposalWithHash } from "src/models/strategies/types.js";
import invariant from "ts-invariant";
import {
	type ElasticProposalDeps,
	createElasticProposalBatch,
} from "../factories/create-elastic-proposal.js";
import { ProposalType } from "../models/proposals/proposal-base.js";

const proposalTypes = {
	[ProposalType.Elastic]: createElasticProposalBatch,
	[ProposalType.ChainLink]: () => {
		throw new Error("Not implemented");
	},
	[ProposalType.DutchAuction]: () => {
		throw new Error("Not implemented");
	},
	[ProposalType.Simple]: () => {
		throw new Error("Not implemented");
	},
};

export const makeProposals = async <T extends ProposalType>(
	proposalType: T,
	proposalParams: Parameters<(typeof proposalTypes)[T]>[0],
	deps: Parameters<(typeof proposalTypes)[T]>[1],
) => {
	invariant(
		proposalTypes[proposalType],
		`Proposal type ${proposalType} not found`,
	);
	invariant(proposalParams, "Proposal params are required");
	invariant(deps, "Deps are required");

	const proposals = await proposalTypes[proposalType](
		proposalParams,
		deps as unknown as ElasticProposalDeps,
	);

	const proposalHashes = await Promise.all(
		proposals.map((proposal) => deps.contract.getProposalHash(proposal)),
	);

	const proposalWithHash = proposals.map((proposal, index) => ({
		...proposal,
		hash: proposalHashes[index],
	})) as ProposalWithHash[];

	const proposalsWithSignature =
		await deps.contract.createMultiProposal(proposalWithHash);

	const usedNonces = proposalParams.terms.user.getUsedNonces();

	for (const chain in usedNonces) {
		const _chain = Number(chain) as SupportedChain;
		if (!usedNonces[_chain]) continue;

		await deps.api.updateNonces(
			proposalParams.terms.user.address,
			_chain,
			usedNonces[_chain],
		);
	}

	await deps.api.persistProposals(proposalsWithSignature);

	return proposalsWithSignature;
};
