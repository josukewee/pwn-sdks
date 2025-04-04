import { Decimal } from "decimal.js";
import { formatUnits } from "viem";
import { CREDIT_PER_COLLATERAL_UNIT_DENOMINATOR } from "../constants.js";

// note: if you want to calculate min credit amonut, pass minCollateralAmount as collateralAmount arg
export const calculateCreditAmount = (
	collateralAmount: bigint,
	creditPerCollateralUnit: bigint,
): bigint => {
	const collateral = new Decimal(collateralAmount.toString());
	const denominator = new Decimal(CREDIT_PER_COLLATERAL_UNIT_DENOMINATOR);
	const ratio = new Decimal(creditPerCollateralUnit.toString());
	return BigInt(collateral.mul(ratio).div(denominator).toFixed(0));
};

export const calculateCollateralAmountFungibleProposal = ({
	creditPerCollateralUnit,
	collateralDecimals,
	availableCreditLimit,
	returnBigInt,
}: {
	creditPerCollateralUnit: string;
	collateralDecimals: number;
	availableCreditLimit: string;
	returnBigInt: boolean;
}) => {
	const availableCreditLimitBigInt = new Decimal(availableCreditLimit || 0);
	const creditPerCollateralUnitBigInt = new Decimal(
		creditPerCollateralUnit || 0,
	);

	if (
		availableCreditLimitBigInt.isZero() ||
		creditPerCollateralUnitBigInt.isZero()
	) {
		return returnBigInt ? BigInt(0) : "0";
	}

	// Use ceil() to avoid rounding down which could lead to insufficient collateral
	const maxPossibleCollateralAmountBigInt = availableCreditLimitBigInt
		.times(new Decimal(CREDIT_PER_COLLATERAL_UNIT_DENOMINATOR))
		.div(creditPerCollateralUnitBigInt)
		.toFixed(0);

	if (returnBigInt) return BigInt(maxPossibleCollateralAmountBigInt.toString());

	return formatUnits(
		BigInt(maxPossibleCollateralAmountBigInt.toString()),
		collateralDecimals,
	);
};

/**
 * Calculates the collateral amount based on the ltv
 * @param creditAmount - The amount of credit to be collateralized
 * @param ltv - The ltv to be used
 * @param collateralUnitPrice - The price of the collateral
 * @param creditUnitPrice - The price of the credit
 * @param creditPriceDecimals - Number of decimals in creditUnitPrice (optional, defaults to 18)
 * @param collateralPriceDecimals - Number of decimals in collateralUnitPrice (optional, defaults to 18)
 * @returns The collateral amount
 * @example
 * // Calculate collateral needed for 1000 USDC at 70% LTV with ETH at $1791.43
 * const result = calculateCollateralBasedOnLtv(
 *   parseUnits("1000", 6), // 1000 USDC (6 decimals)
 *   BigInt(70), // 70% LTV
 *   parseUnits("1791.43", 18), // ETH price $1791.43 (18 decimals)
 *   parseUnits("1.01", 6), // USDC price $1.01 (6 decimals)
 *   6, // USDC price decimals
 *   18, // ETH price decimals
 * );
 * // result: approximately 0.805 ETH
 */
export const calculateCollateralBasedOnLtv = (
	creditAmount: bigint,
	ltv: bigint,
	collateralUnitPrice: bigint,
	creditUnitPrice: bigint,
	creditPriceDecimals = 18,
	collateralPriceDecimals = 18,
): bigint => {
	// Convert credit price to match collateral price decimals
	const decimalDifference = collateralPriceDecimals - creditPriceDecimals;
	const normalizedCreditPrice =
		decimalDifference > 0
			? creditUnitPrice * BigInt(10 ** decimalDifference)
			: creditUnitPrice / BigInt(10 ** Math.abs(decimalDifference));

	// Calculate total credit value in USD (maintaining precision)
	const creditValue = new Decimal(creditAmount.toString())
		.mul(normalizedCreditPrice.toString())
		.div(BigInt(10 ** creditPriceDecimals).toString());

	// Calculate required collateral value in USD
	const requiredCollateralValue = creditValue.mul(100).div(ltv.toString());

	// Convert to collateral tokens
	// Multiply by 10^18 to maintain precision when dividing by collateral price
	const scaledCollateralValue = requiredCollateralValue.mul(
		BigInt(10 ** 18).toString(),
	);

	const result = scaledCollateralValue.div(
		new Decimal(collateralUnitPrice.toString()),
	);

	return BigInt(result.toFixed(0));
};

export const calculateCreditPerCollateralUnit = (
	creditBigInt: bigint,
	collateralBigInt: bigint,
) => {
	const credit = new Decimal(creditBigInt.toString());
	const collateral = new Decimal(collateralBigInt.toString());
	const denominator = new Decimal(CREDIT_PER_COLLATERAL_UNIT_DENOMINATOR);

	const result = credit.times(denominator).dividedBy(collateral);
	return result.toFixed(0); // Convert back to string with no decimals
};
