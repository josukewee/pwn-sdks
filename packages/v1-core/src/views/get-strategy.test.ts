import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";
import { API } from "../api.js";
import { getStrategy } from "./get-strategy.js";

vi.mock("../api.js", () => ({
	API: {
		get: {
			getStrategyDetail: vi.fn(),
		},
	},
}));

describe("getStrategy", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should call API.get.getStrategyDetail with the correct strategyId", async () => {
		const mockStrategyId = "123";
		const mockStrategy = {
			id: mockStrategyId,
			name: "Test Strategy",
		};

		(API.get.getStrategyDetail as Mock).mockResolvedValue(mockStrategy);

		const result = await getStrategy(mockStrategyId);

		expect(API.get.getStrategyDetail).toHaveBeenCalledTimes(1);
		expect(API.get.getStrategyDetail).toHaveBeenCalledWith(mockStrategyId);
		expect(result).toEqual(mockStrategy);
	});

	it("should propagate API errors", async () => {
		const mockStrategyId = "123";
		const mockError = new Error("API Error");

		(API.get.getStrategyDetail as Mock).mockRejectedValue(mockError);

		await expect(getStrategy(mockStrategyId)).rejects.toThrow(mockError);
	});
});
