import { faker } from "@faker-js/faker";
import { describe, expect, it } from "vitest";
import { SupportedChain } from "../chains.js";
import { ERC20Token } from "./token.js";

describe("Token", () => {
	it("should create a token", () => {
		const token = new ERC20Token(
			SupportedChain.Ethereum,
			faker.finance.ethereumAddress(),
			18,
		);
		expect(token).toBeDefined();
	});

	it("should create a token with a name", () => {
		const token = new ERC20Token(
			SupportedChain.Ethereum,
			faker.finance.ethereumAddress(),
			18,
			"Test Token",
		);
		expect(token.name).toBe("Test Token");
	});

	it("should create a token with a symbol", () => {
		const token = new ERC20Token(
			SupportedChain.Ethereum,
			faker.finance.ethereumAddress(),
			18,
			"Test Token",
			"TST",
		);
		expect(token.symbol).toBe("TST");
	});

	// tests for constructor parameters
});
