import {
	type SupportedChain,
	type User,
	UserWithNonceManager,
} from "@pwndao/sdk-core";
import type { IServerAPI } from "../factories/types.js";

export const getUserWithNonce = async (
	user: User,
	api: IServerAPI,
	chainIds: SupportedChain[],
): Promise<UserWithNonceManager> => {
	const nonces = await Promise.allSettled(
		chainIds.map((chainId) => api.get.recentNonce(user.address, chainId)),
	);

	const successfulNonces = nonces
		.filter((nonce) => nonce.status === "fulfilled")
		.map((nonce) => nonce.value);

	const noncesRecord = chainIds.reduce(
		(acc, chainId, index) => {
			acc[chainId] = [
				BigInt(successfulNonces[index][0]),
				BigInt(successfulNonces[index][1]),
			];
			return acc;
		},
		{} as Record<SupportedChain, [bigint, bigint]>,
	);

	return new UserWithNonceManager(user, noncesRecord);
};
