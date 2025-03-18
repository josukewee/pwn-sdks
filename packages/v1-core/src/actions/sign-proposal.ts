import type { SupportedChain } from "@pwndao/sdk-core";
import type { Proposal } from "../models/strategies/types.js";

import { signTypedData } from "@wagmi/core";
import { useConfig } from "wagmi";

export const getProposalSignData = (
	proposal: Proposal,
	chainId: SupportedChain,
) => {
	// todo: move domain to proposal model?
	const domain = {
		name: "PWNSimpleLoanSimpleProposal",
		version: "1.3",
		chainId,
		verifyingContract: proposal.proposalContract,
	} as const;

	return {
		domain,
		types: proposal.ERC712_TYPES,
		primaryType: "Proposal",
		message: proposal.createProposalStruct(),
	} as const;
};

export const signProposal = async (
	proposal: Proposal,
	chainId: SupportedChain,
) => {
	const config = useConfig();

	const signTypedData_ = getProposalSignData(proposal, chainId);
	const signature = await signTypedData(config, signTypedData_);
	return signature;
};
