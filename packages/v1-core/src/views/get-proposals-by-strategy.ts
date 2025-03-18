import type { ProposalWithSignature } from "src/models/strategies/types.js";
import { API } from "../api.js";

export const getProposalsByStrategy = async (
	strategyId: string,
): Promise<ProposalWithSignature[]> => {
	const proposals = await API.get.proposalsByStrategy(strategyId);

	return proposals;
};
