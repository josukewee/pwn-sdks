import { type SupportedChain, UserWithNonceManager } from "@pwndao/sdk-core";
import { generateAddress, getMockUser } from "@pwndao/sdk-core";
import { beforeEach, describe, expect, test, vi } from "vitest";
import type { IServerAPI } from "../factories/types.js";
import { getUserWithNonce } from "./get-user-with-nonce.js";

// Mock dependencies
vi.mock("@pwndao/sdk-core", async (importOriginal) => {
	const actual = await importOriginal();
	return {
		...actual,
		UserWithNonceManager: vi.fn().mockImplementation((user, nonces) => ({
			user,
			nonces,
		})),
	};
});

describe("useGetUserWithNonce", () => {
	// Setup mocks
	const mockUser = getMockUser(generateAddress());
	const mockChainIds: SupportedChain[] = [1, 137]; // Example chain IDs (e.g., Ethereum and Polygon)

	// Mock API
	const mockApi: IServerAPI = {
		get: {
			recentNonce: vi.fn(),
		},
	} as unknown as IServerAPI;

	beforeEach(() => {
		vi.clearAllMocks();
	});

	test("should fetch nonces for all chains and create UserWithNonceManager", async () => {
		// Setup successful responses
		mockApi.get.recentNonce.mockImplementation((address, chainId) => {
			if (chainId === 1) return Promise.resolve(["100", "101"]);
			if (chainId === 137) return Promise.resolve(["200", "201"]);
			return Promise.reject(new Error("Unsupported chain"));
		});

		const result = await getUserWithNonce(mockUser, mockApi, mockChainIds);

		// Verify API calls
		expect(mockApi.get.recentNonce).toHaveBeenCalledTimes(2);
		expect(mockApi.get.recentNonce).toHaveBeenCalledWith(mockUser.address, 1);
		expect(mockApi.get.recentNonce).toHaveBeenCalledWith(mockUser.address, 137);

		// Verify UserWithNonceManager creation
		expect(UserWithNonceManager).toHaveBeenCalledWith(mockUser, {
			1: [BigInt(100), BigInt(101)],
			137: [BigInt(200), BigInt(201)],
		});

		// Verify the returned object
		expect(result).toEqual({
			user: mockUser,
			nonces: {
				1: [BigInt(100), BigInt(101)],
				137: [BigInt(200), BigInt(201)],
			},
		});
	});

	test("should handle failed nonce requests gracefully", async () => {
		// Setup mixed responses - one successful, one failed
		mockApi.get.recentNonce.mockImplementation((address, chainId) => {
			if (chainId === 1) return Promise.resolve(["100", "101"]);
			return Promise.reject(new Error("Failed to fetch nonce"));
		});

		await expect(
			getUserWithNonce(mockUser, mockApi, mockChainIds),
		).rejects.toThrow();
	});

	test("should handle empty chain IDs array", async () => {
		const result = await getUserWithNonce(mockUser, mockApi, []);

		expect(mockApi.get.recentNonce).not.toHaveBeenCalled();
		expect(UserWithNonceManager).toHaveBeenCalledWith(mockUser, {});
		expect(result).toEqual({
			user: mockUser,
			nonces: {},
		});
	});
});
