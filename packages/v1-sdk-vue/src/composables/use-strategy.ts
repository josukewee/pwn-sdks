import { getStrategy } from "@pwndao/v1-core";
import type { Strategy } from "@pwndao/v1-core";
import { useQuery } from "@tanstack/vue-query";
import { computed, toValue } from "vue";
import type { MaybeRefOrGetter } from "vue";

export const useStrategy = (strategyId: MaybeRefOrGetter<string>) => {
	const _strategyId = computed(() => toValue(strategyId));
	return useQuery<Strategy, Error>({
		queryKey: ["strategy", _strategyId.value],
		queryFn: ({ queryKey }) => getStrategy(queryKey[1] as string),
		enabled: !!_strategyId.value,
	});
};
