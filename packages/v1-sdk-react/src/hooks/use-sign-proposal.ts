import type { SupportedChain } from "@pwndao/sdk-core";
import { type Proposal, signProposal } from "@pwndao/v1-core";
import { useMutation } from "@tanstack/react-query";

export const useSignProposal = (
	proposal: Proposal,
	chainId: SupportedChain,
) => {
	return useMutation({
		mutationFn: () => signProposal(proposal, chainId),
	});
};
