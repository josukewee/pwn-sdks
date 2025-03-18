import { CREDIT_PER_COLLATERAL_UNIT_DENOMINATOR } from "../constants.js";

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
	credit: bigint,
	collateral: bigint,
): bigint => {
	return (credit * BigInt(CREDIT_PER_COLLATERAL_UNIT_DENOMINATOR)) / collateral;
};
