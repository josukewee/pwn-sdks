import { getStrategy } from "@pwndao/v1-core";
import type { Strategy } from "@pwndao/v1-core";
import { useQuery } from "@tanstack/vue-query";

export const useStrategy = (strategyId: string) => {
	return useQuery<Strategy, Error>({
		queryKey: ["strategy", strategyId],
		queryFn: ({ queryKey }) => getStrategy(queryKey[1] as string),
		enabled: !!strategyId,
	});
};
