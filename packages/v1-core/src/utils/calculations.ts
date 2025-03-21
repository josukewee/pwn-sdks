import { CREDIT_PER_COLLATERAL_UNIT_DENOMINATOR } from "../constants.js";
import { Decimal } from "decimal.js";

// note: if you want to calculate min credit amonut, pass minCollateralAmount as collateralAmount arg
export const calculateCreditAmount = (
	collateralAmount: bigint,
	creditPerCollateralUnit: bigint,
): bigint => {
	return (
		(collateralAmount * creditPerCollateralUnit) /
		BigInt(CREDIT_PER_COLLATERAL_UNIT_DENOMINATOR)
	);
};

export const calculateCollateralBasedOnLtv = (
	creditAmount: bigint,
	ltv: bigint,
	collateralUnitPrice: bigint,
	creditUnitPrice: bigint,
): bigint => {
	const creditAppraisal = creditAmount * creditUnitPrice;
	const collateralAppraisal = (creditAppraisal * 100n) / ltv;
	return collateralAppraisal / collateralUnitPrice;
};

export const calculateCreditPerCollateralUnit = (
	creditBigInt: bigint, 
	collateralBigInt: bigint
) => {
	const credit = new Decimal(creditBigInt.toString())
	const collateral = new Decimal(collateralBigInt.toString())
	const denominator = new Decimal(CREDIT_PER_COLLATERAL_UNIT_DENOMINATOR)
  
	const result = credit.times(denominator).dividedBy(collateral)
	return result.toFixed(0) // Convert back to string with no decimals
  }