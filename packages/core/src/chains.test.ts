// ALL_SUPPORTED_CHAINS contains only numeric values and has SupportedChain values

import { describe, expect, it, expectTypeOf, test } from "vitest";
import {
    SupportedChain,
    ALL_SUPPORTED_CHAINS,
    V1_3_SUPPORTED_CHAINS,
} from "./chains.js";

describe("ALL_SUPPORTED_CHAINS", () => {
    it("numeric values should be unique", () => {
        const supportedChainsSet = new Set(ALL_SUPPORTED_CHAINS);
        expect(ALL_SUPPORTED_CHAINS.length).toBe(
            supportedChainsSet.size
        );
    });

    it("should be a type of SupportedChain[]", () => {
        expectTypeOf(ALL_SUPPORTED_CHAINS).toEqualTypeOf<
            SupportedChain[]
        >();
    });
});

test("type should not include V1_2_SUPPORTED_CHAINS", () => {
    expectTypeOf<V1_3_SUPPORTED_CHAINS>(
        SupportedChain.Ethereum |
            SupportedChain.Optimism |
            SupportedChain.Polygon |
            SupportedChain.Cronos |
            SupportedChain.Base |
            SupportedChain.Arbitrum |
            SupportedChain.Bsc |
            SupportedChain.Sepolia |
            SupportedChain.Sepolia |
            SupportedChain.Unichain |
            SupportedChain.UnichainSepolia |
            SupportedChain.Gnosis |
            SupportedChain.World
    );
});
