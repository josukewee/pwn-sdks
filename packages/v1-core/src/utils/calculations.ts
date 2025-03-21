import { formatUnits } from "viem";
import { CREDIT_PER_COLLATERAL_UNIT_DENOMINATOR } from "../constants.js";
import { Decimal } from "decimal.js";

// note: if you want to calculate min credit amonut, pass minCollateralAmount as collateralAmount arg
export const calculateCreditAmount = (
	collateralAmount: bigint,
	creditPerCollateralUnit: bigint,
): bigint => {
	const collateral = new Decimal(collateralAmount.toString());
	const denominator = new Decimal(CREDIT_PER_COLLATERAL_UNIT_DENOMINATOR);
	const ratio = new Decimal(creditPerCollateralUnit.toString())
	return BigInt(collateral.mul(ratio).div(denominator).toFixed(0))
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
	const availableCreditLimitBigInt = new Decimal(availableCreditLimit || 0)
	const creditPerCollateralUnitBigInt = new Decimal(creditPerCollateralUnit || 0)
  
	if (availableCreditLimitBigInt.isZero() || creditPerCollateralUnitBigInt.isZero()) {
	  return returnBigInt ? BigInt(0) : '0'
	}
  
	// Use ceil() to avoid rounding down which could lead to insufficient collateral
	const maxPossibleCollateralAmountBigInt = availableCreditLimitBigInt
	  .times(new Decimal(CREDIT_PER_COLLATERAL_UNIT_DENOMINATOR))
	  .div(creditPerCollateralUnitBigInt)
	  .toFixed(0)
  
	if (returnBigInt)
	  return BigInt(maxPossibleCollateralAmountBigInt.toString())

	return formatUnits(BigInt(maxPossibleCollateralAmountBigInt.toString()), collateralDecimals)
  }

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