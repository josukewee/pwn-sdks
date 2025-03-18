import { type SupportedChain, User } from "@pwndao/sdk-core";
import { API, getUserWithNonce } from "@pwndao/v1-core";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useAccount } from "wagmi";

export const useUserWithNonce = (chainIds: SupportedChain[]) => {
	const { address, isConnected } = useAccount();

	const user = useMemo(() => {
		if (!address || !isConnected) return null;
		return new User(address);
	}, [address, isConnected]);

	const { data, isLoading, error } = useQuery({
		queryKey: ["user-with-nonce", user, chainIds],
		queryFn: ({ queryKey }) =>
			getUserWithNonce(
				queryKey[1] as User,
				API,
				queryKey[2] as SupportedChain[],
			),
		enabled: !!user && !!chainIds,
	});

	return {
		userWithNonce: data,
		isLoading,
		error,
	};
};
