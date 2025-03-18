import { getStrategy } from "@pwndao/v1-core";
import { useQuery } from "@tanstack/vue-query";

export const useStrategy = (strategyId: string) => {
	return useQuery({
		queryKey: ["strategy", strategyId],
		queryFn: ({ queryKey }) => getStrategy(queryKey[1]),
		enabled: !!strategyId,
	});
};
