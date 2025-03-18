import type { AddressString, Hex } from "@pwndao/sdk-core";
import { concat, keccak256, toHex } from "viem";

export const createUtilizedCreditId = ({
	proposer,
	availableCreditLimit,
}: {
	proposer: AddressString;
	availableCreditLimit: bigint;
}): Hex => {
	const randomSeed =
		BigInt(Date.now()) ^ BigInt(Math.floor(Math.random() * 1e24));

	const concatenated = concat([
		toHex(proposer),
		toHex(availableCreditLimit),
		toHex(randomSeed),
	]);
	const encoded = keccak256(concatenated);

	return keccak256(encoded); // encoding twice
};
