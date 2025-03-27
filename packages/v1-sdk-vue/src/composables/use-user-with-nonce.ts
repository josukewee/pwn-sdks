import { type SupportedChain, User } from "@pwndao/sdk-core";
import { API, getUserWithNonce } from "@pwndao/v1-core";
import { useQuery } from "@tanstack/vue-query";
import { useAccount } from "@wagmi/vue";
import { computed, type MaybeRefOrGetter, toValue } from "vue";

export const useUserWithNonce = (chainIds: MaybeRefOrGetter<SupportedChain[]>) => {
	const { address, isConnected } = useAccount();
	const _chainIds = computed(() => toValue(chainIds));
	const user = computed(() => {
		if (!toValue(address) || !toValue(isConnected)) return null;
		return new User(toValue(address) as `0x${string}`);
	});

	const { data, isLoading, error } = useQuery({
		queryKey: ["user-with-nonce", user.value, _chainIds.value],
		queryFn: ({ queryKey }) =>
			getUserWithNonce(
				queryKey[1] as User,
				API,
				queryKey[2] as SupportedChain[],
			),
		enabled: computed(() => !!user.value && !!_chainIds.value),
	});

	return {
		userWithNonce: data,
		isLoading,
		error,
	};
};
