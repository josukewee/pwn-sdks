import { Decimal } from "decimal.js";
import { formatUnits, parseUnits } from "viem";
import { describe, it } from "vitest";
import { CREDIT_PER_COLLATERAL_UNIT_DENOMINATOR } from "../constants.js";
import {
	calculateCollateralAmountFungibleProposal,
	calculateCollateralBasedOnLtv,
	calculateCreditAmount,
	calculateCreditPerCollateralUnit,
} from "./calculations.js";

const ONE_TOKEN = BigInt("1000000000000000000"); // 1 token with 18 decimals
const SMALL_AMOUNT = BigInt("1000000"); // 0.001 token

// Helper Functions
const createCreditPerCollateralUnit = (multiplier: number) => {
	return new Decimal(multiplier)
		.times(new Decimal(CREDIT_PER_COLLATERAL_UNIT_DENOMINATOR))
		.toFixed(0);
};

describe("Calculations package", () => {
	describe("calculateCreditPerCollateralUnit", () => {
		it("should correctly calculate credit per collateral unit for basic scenarios", () => {
			// Simple 10:1 ratio
			const result1 = calculateCreditPerCollateralUnit(
				BigInt(1000),
				BigInt(100),
			);
			expect(+result1 / CREDIT_PER_COLLATERAL_UNIT_DENOMINATOR).toBe(10);

			// Large numbers with same 10:1 ratio
			const result2 = calculateCreditPerCollateralUnit(
				BigInt(parseUnits("1000", 18)), // 1000 tokens
				BigInt(parseUnits("100", 18)), // 100 tokens
			);
			expect(+result2 / CREDIT_PER_COLLATERAL_UNIT_DENOMINATOR).toBe(10);

			// Small numbers with 2:1 ratio
			const result3 = calculateCreditPerCollateralUnit(BigInt(10), BigInt(5));
			expect(+result3 / CREDIT_PER_COLLATERAL_UNIT_DENOMINATOR).toBe(2);
		});

		it("should handle non-integer ratios correctly", () => {
			// 333.33... ratio (1000/3)
			const result1 = calculateCreditPerCollateralUnit(BigInt(1000), BigInt(3));
			expect(result1).toBe("33333333333333333333000000000000000000000");

			// Very small ratio (0.000001)
			const result2 = calculateCreditPerCollateralUnit(
				BigInt(1),
				BigInt(1000000),
			);
			expect(result2).toBe("100000000000000000000000000000000");
		});
	});

	describe("calculateCreditAmount", () => {
		it("should calculate credit amount correctly for basic scenarios", () => {
			// 2:1 ratio (2 credit per 1 collateral)
			const result1 = calculateCreditAmount(
				ONE_TOKEN, // 1 collateral token
				BigInt(createCreditPerCollateralUnit(2)), // 2 credit per 1 collateral
			);
			expect(result1.toString()).toBe("2000000000000000000"); // 2 credit tokens

			// 1:1 ratio with small amounts
			const result2 = calculateCreditAmount(
				SMALL_AMOUNT,
				BigInt(createCreditPerCollateralUnit(1)),
			);
			expect(result2.toString()).toBe(SMALL_AMOUNT.toString());
		});

		it("should handle fractional ratios correctly", () => {
			// 1.5:1 ratio (1.5 credit per 1 collateral)
			const result = calculateCreditAmount(
				ONE_TOKEN, // 1 collateral token
				BigInt(createCreditPerCollateralUnit(1.5)), // 1.5 credit per 1 collateral
			);
			const expectedAmount = new Decimal(ONE_TOKEN.toString())
				.times(1.5)
				.toFixed(0);
			expect(result.toString()).toBe(expectedAmount); // 1.5 credit tokens
		});

		it("should maintain precision with small collateral amounts", () => {
			// 2:1 ratio with very small collateral
			const result = calculateCreditAmount(
				SMALL_AMOUNT, // Very small amount
				BigInt(createCreditPerCollateralUnit(2)),
			);
			expect(result.toString()).toBe((SMALL_AMOUNT * BigInt(2)).toString());
		});

		describe("PWN Utils calculations - Round-Trip Calculations", () => {
			describe("Collateral → Credit → Collateral conversions", () => {
				it("should maintain precision when converting collateral to credit and back", () => {
					// Initial values
					const initialCollateral = BigInt("1000000000000000000"); // 1 ETH
					const creditPerCollateralUnit = new Decimal(2)
						.times(new Decimal(CREDIT_PER_COLLATERAL_UNIT_DENOMINATOR))
						.toFixed(0);

					// Convert collateral to credit
					const creditAmount = calculateCreditAmount(
						initialCollateral,
						BigInt(creditPerCollateralUnit),
					);

					// Convert credit back to collateral
					const finalCollateral = calculateCollateralAmountFungibleProposal({
						creditPerCollateralUnit,
						collateralDecimals: 18,
						availableCreditLimit: creditAmount.toString(),
						returnBigInt: true,
					});

					// Should get back our original collateral amount
					expect(finalCollateral.toString()).toBe(initialCollateral.toString());
				});

				it("should handle fractional amounts in round-trip conversion", () => {
					// Initial values with odd ratio
					const initialCollateral = BigInt("3000000000000000000"); // 3 ETH
					const creditPerCollateralUnit = new Decimal(1.5)
						.times(new Decimal(CREDIT_PER_COLLATERAL_UNIT_DENOMINATOR))
						.toFixed(0);

					// First conversion
					const creditAmount = calculateCreditAmount(
						initialCollateral,
						BigInt(creditPerCollateralUnit),
					);

					// Convert back
					const finalCollateral = calculateCollateralAmountFungibleProposal({
						creditPerCollateralUnit,
						collateralDecimals: 18,
						availableCreditLimit: creditAmount.toString(),
						returnBigInt: true,
					});

					expect(finalCollateral.toString()).toBe(initialCollateral.toString());
				});
			});

			describe("Credit → Collateral → Credit conversions", () => {
				it("should maintain precision when converting credit to collateral and back", () => {
					// Initial credit amount
					const initialCredit = BigInt("100000000"); // 100 USDC (assuming 6 decimals)
					const creditPerCollateralUnit = new Decimal(2)
						.times(new Decimal(CREDIT_PER_COLLATERAL_UNIT_DENOMINATOR))
						.toFixed(0);

					// Calculate required collateral
					const collateralAmount = calculateCollateralAmountFungibleProposal({
						creditPerCollateralUnit,
						collateralDecimals: 18,
						availableCreditLimit: initialCredit.toString(),
						returnBigInt: true,
					}) as bigint;

					// Convert collateral back to credit
					const finalCredit = calculateCreditAmount(
						collateralAmount,
						BigInt(creditPerCollateralUnit),
					);

					expect(finalCredit.toString()).toBe(initialCredit.toString());
				});

				it("should handle edge cases in credit-collateral-credit conversion", () => {
					// Test with very small amounts
					const smallCredit = BigInt("1000"); // 0.001 USDC
					const creditPerCollateralUnit = new Decimal(1000)
						.times(new Decimal(CREDIT_PER_COLLATERAL_UNIT_DENOMINATOR))
						.toFixed(0);

					// First conversion
					const collateralAmount = calculateCollateralAmountFungibleProposal({
						creditPerCollateralUnit,
						collateralDecimals: 18,
						availableCreditLimit: smallCredit.toString(),
						returnBigInt: true,
					}) as bigint;

					// Convert back to credit
					const finalCredit = calculateCreditAmount(
						collateralAmount,
						BigInt(creditPerCollateralUnit),
					);

					expect(finalCredit.toString()).toBe(smallCredit.toString());
				});
			});

			describe("Complex scenarios", () => {
				it("should handle multiple conversions maintaining precision", () => {
					// Initial setup
					const initialCollateral = BigInt("1500000000000000000"); // 1.5 ETH
					const creditPerCollateralUnit = new Decimal(2.5)
						.times(new Decimal(CREDIT_PER_COLLATERAL_UNIT_DENOMINATOR))
						.toFixed(0);

					// Multiple conversions
					const credit1 = calculateCreditAmount(
						initialCollateral,
						BigInt(creditPerCollateralUnit),
					);

					const collateral1 = calculateCollateralAmountFungibleProposal({
						creditPerCollateralUnit,
						collateralDecimals: 18,
						availableCreditLimit: credit1.toString(),
						returnBigInt: true,
					}) as bigint;

					const credit2 = calculateCreditAmount(
						collateral1,
						BigInt(creditPerCollateralUnit),
					);

					// Final conversion back to collateral
					const finalCollateral = calculateCollateralAmountFungibleProposal({
						creditPerCollateralUnit,
						collateralDecimals: 18,
						availableCreditLimit: credit2.toString(),
						returnBigInt: true,
					});

					// After all conversions, should match initial value
					expect(finalCollateral.toString()).toBe(initialCollateral.toString());
				});

				it("should maintain precision with different decimal places", () => {
					// Let's add debug logs to trace the calculation
					const initialCredit = BigInt(1_000_000_000); // 1000 USDC

					const creditPerCollateralUnit = new Decimal(1500)
						.times(new Decimal(CREDIT_PER_COLLATERAL_UNIT_DENOMINATOR))
						.toFixed(0);

					// First conversion: credit -> collateral
					const collateralAmount = calculateCollateralAmountFungibleProposal({
						creditPerCollateralUnit,
						collateralDecimals: 18,
						availableCreditLimit: initialCredit.toString(),
						returnBigInt: true,
					}) as bigint;

					// Second conversion: collateral -> credit
					const finalCredit = calculateCreditAmount(
						collateralAmount,
						BigInt(creditPerCollateralUnit),
					);

					// Allow for small differences (less than 0.01 USD)
					// For USDC with 6 decimals, 0.01 USD = 10000 (1 cent = 10^4)
					const tolerance = BigInt(10000);
					const difference =
						finalCredit > initialCredit
							? finalCredit - initialCredit
							: initialCredit - finalCredit;

					expect(difference).toBeLessThanOrEqual(tolerance);
				});
			});
		});
	});

	it("should calculate collateral correctly for real-world USDC-ETH scenario", () => {
		// Scenario: Lending 1000 USDC against ETH at $1791.43
		// USDC has 6 decimals, ETH has 18 decimals
		// Credit amount: 1000 USDC = 1000_000000
		// Credit (USDC) price: $1.01 (6 decimals)
		// Collateral (ETH) price: $1791.43 (18 decimals)
		// LTV: 70%

		const result = calculateCollateralBasedOnLtv(
			BigInt(parseUnits("1000", 6)), // 1000 USDC (6 decimals)
			BigInt(70), // 70% LTV
			BigInt(parseUnits("1791.43", 18)), // ETH price $1791.43 (18 decimals)
			BigInt(parseUnits("1.01", 6)), // USDC price $1.01 (6 decimals)
			6, // USDC price decimals
			18, // ETH price decimals
		);

		console.log("Collateral amount in ETH:", formatUnits(result, 18));

		// Expected collateral calculation:
		// 1. Credit value = 1000 USDC * $1.01 = $1010
		// 2. Required collateral value = ($1010 * 100) / 70 ≈ $1442.86
		// 3. Required ETH = $1442.86 / $1791.43 ≈ 0.805 ETH
		// 4. In wei: 0.805 * 10^18 ≈ 805422005245609852
		const expectedCollateral = "805422005245609852"; // 0.805 ETH
		expect(result.toString()).toBe(expectedCollateral);
	});
});
