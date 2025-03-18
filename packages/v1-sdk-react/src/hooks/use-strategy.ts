import { type Strategy, getStrategy } from "@pwndao/v1-core";
import {
	type UseQueryOptions,
	type UseQueryResult,
	useQuery,
} from "@tanstack/react-query";

export const useStrategy = (
	strategyId: string,
	queryOptions?: UseQueryOptions<Strategy, Error>,
): UseQueryResult<Strategy, Error> => {
	return useQuery({
		queryKey: ["strategy", strategyId],
		queryFn: () => getStrategy(strategyId),
		enabled: !!strategyId,
		...queryOptions,
	});
};
