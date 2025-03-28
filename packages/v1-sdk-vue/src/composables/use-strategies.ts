import type { SupportedChain } from "@pwndao/sdk-core";
import { getStrategies } from "@pwndao/v1-core";
import { useQuery } from "@tanstack/vue-query";
import { type MaybeRefOrGetter, computed, toValue } from "vue";

export const useStrategies = (chainId: MaybeRefOrGetter<SupportedChain>) => {
	const _chainId = computed(() => toValue(chainId));
	const queryIsEnabled = computed(() => !!_chainId.value);
	return useQuery({
		queryKey: ["strategies", _chainId],
		queryFn: ({ queryKey }) => getStrategies(queryKey[1] as SupportedChain),
		enabled: queryIsEnabled,
	});
};
