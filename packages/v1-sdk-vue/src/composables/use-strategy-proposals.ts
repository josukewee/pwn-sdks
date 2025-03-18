import { getProposalsByStrategy } from "@pwndao/v1-core";
import { useQuery } from "@tanstack/vue-query";

export const useStrategyProposals = (strategyId: string) => {
	return useQuery({
		queryKey: ["strategy-proposals", strategyId],
		queryFn: ({ queryKey: [, _strategyId] }) =>
			getProposalsByStrategy(_strategyId),
		enabled: !!strategyId,
	});
};
