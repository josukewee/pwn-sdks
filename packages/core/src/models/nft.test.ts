import { NFT, FungibleNFT } from "./nft.js";
import { describe, expect, it } from "vitest";
import { SupportedChain } from "../chains.js";
import { generateAddress } from "../test-utils/index.js";


// decimal is negative(ot 0 or 1) to test nft doesnt have it.
// chain id is supported. some tools to figure that out 
// one test for more case scinarios
// // erc
// invb
describe("NFT", () => {
    it("should create NFT with name", () => {
        const nft = new NFT(
            SupportedChain.Ethereum,
            generateAddress(),
            18,
            "PWN"
        );
        expect(nft.name).toBe("PWN");
    });

    it("should create NFT with symbol", () => {
        const nft = new NFT(
            SupportedChain.Ethereum,
            generateAddress(),
            18,
            "PWN",
            "TST"
        );
        expect(nft.symbol).toBe("TST");
    });
    it("should create NFT with symbol, without name", () => {
        const nft = new NFT(
            SupportedChain.Ethereum,
            generateAddress(),
            18,
            undefined,
            "TST"
        );
        expect(nft.symbol).toBe("TST");
        expect(nft.name).toBeUndefined();
    });

    it("should create NFT with decimals 0", () => {
        const nft = new NFT(
            SupportedChain.Ethereum,
            generateAddress(),
            0,
            "PWN"
        );
        expect(nft.decimals).toBe(0);
    });

    it("should throw error when creating NFT with negative decimals", () => {
        expect(() => {
            new NFT(
                SupportedChain.Ethereum,
                generateAddress(),
                -1,
                "PWN"
            );
        }).toThrow();
    });
});

describe("FungibleNFT", () => {
    it("should create FungibleNFT with name", () => {
        const nft = new FungibleNFT(
            SupportedChain.Ethereum,
            generateAddress(),
            18,
            "PWN"
        );
        expect(nft.name).toBe("PWN");
    });

    it("should create FungibleNFT with symbol", () => {
        const nft = new FungibleNFT(
            SupportedChain.Ethereum,
            generateAddress(),
            18,
            "PWN",
            "TST"
        );
        expect(nft.symbol).toBe("TST");
    });
    it("should create FungibleNFT with symbol, without name", () => {
        const nft = new FungibleNFT(
            SupportedChain.Ethereum,
            generateAddress(),
            18,
            undefined,
            "TST"
        );
        expect(nft.symbol).toBe("TST");
        expect(nft.name).toBe(undefined);
    });

    it("should create FungibleNFT with decimals 0", () => {
        const nft = new FungibleNFT(
            SupportedChain.Ethereum,
            generateAddress(),
            0,
            "PWN"
        );
        expect(nft.decimals).toBe(0);
    });

    it("should throw error when creating FungibleNFT with negative decimals", () => {
        expect(() => {
            new FungibleNFT(
                SupportedChain.Ethereum,
                generateAddress(),
                -1,
                "PWN"
            );
        }).toThrow();
    });
});
