import { SupportedChain } from "@pwndao/sdk-core";
import type { Config } from "@wagmi/core";
import { vi } from "vitest";
import { RevokedNonceContract } from "./revoked-nonce-contract.js";
import { writePwnRevokedNonceRevokeNonces } from "../generated.js";

vi.mock("../generated.js", () => {
	return {
		writePwnRevokedNonceRevokeNonces: vi.fn().mockResolvedValue("0x0"),
	};
});

describe("RevokedNonceContract", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should revoke nonces", async () => {
		const mockConfig = vi.fn();
		const contract = new RevokedNonceContract(mockConfig as unknown as Config);

		const txHash = await contract.revokeNonces([1n, 2n], SupportedChain.Ethereum);
		expect(txHash).toEqual("0x0");
		expect(writePwnRevokedNonceRevokeNonces).toHaveBeenCalledWith(mockConfig, {
			address: "0x972204fF33348ee6889B2d0A3967dB67d7b08e4c",
			chainId: SupportedChain.Ethereum,
			args: [[1n, 2n]],
		});
		expect(writePwnRevokedNonceRevokeNonces).toHaveBeenCalledTimes(1);
	});
});
