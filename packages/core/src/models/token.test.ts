import { faker } from "@faker-js/faker";
import { describe, expect, it } from "vitest";
import { SupportedChain } from "../chains.js";
import { ERC20Token } from "./token.js";
import { MultiTokenCategory } from '../models/asset.js'

// tests for constructor parameters
describe("Token", () => {

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
    it("should create NFT with symbol, without name", () => {
        const nft = new ERC20Token(
            SupportedChain.Ethereum,
            faker.finance.ethereumAddress(),
            18,
            undefined,
            "TST"
        );
        expect(nft.symbol).toBe("TST");
        expect(nft.name).toBeUndefined();
    });

    it("should return right category", () => {
        const token = new ERC20Token(
            SupportedChain.Ethereum,
            faker.finance.ethereumAddress(),
            18
        );
        expect(token.category).toBe(MultiTokenCategory.ERC20);
    });
});
