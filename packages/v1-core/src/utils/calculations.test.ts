import { calculateCreditPerCollateralUnit } from './calculations.js'
import { Decimal } from "decimal.js"
import { parseUnits } from 'viem'
import { describe, it } from 'vitest'
import { CREDIT_PER_COLLATERAL_UNIT_DENOMINATOR } from "../constants.js";

describe("Calculations package", () => {
    describe('calculateCreditPerCollateralUnit', () => {
        it('should correctly calculate credit per collateral unit for basic scenarios', () => {
          // Simple 10:1 ratio
          const result1 = calculateCreditPerCollateralUnit(BigInt(1000), BigInt(100))
          expect(+result1 / CREDIT_PER_COLLATERAL_UNIT_DENOMINATOR).toBe(10)
    
          // Large numbers with same 10:1 ratio
          const result2 = calculateCreditPerCollateralUnit(
            BigInt(parseUnits('1000', 18)), // 1000 tokens
            BigInt(parseUnits('100', 18)), // 100 tokens
          )
          expect(+result2 / CREDIT_PER_COLLATERAL_UNIT_DENOMINATOR).toBe(10)
    
          // Small numbers with 2:1 ratio
          const result3 = calculateCreditPerCollateralUnit(BigInt(10), BigInt(5))
          expect(+result3 / CREDIT_PER_COLLATERAL_UNIT_DENOMINATOR).toBe(2)
        })
    
      it('should handle non-integer ratios correctly', () => {
          // 333.33... ratio (1000/3)
          const result1 = calculateCreditPerCollateralUnit(BigInt(1000), BigInt(3))
          expect(result1).toBe("33333333333333333333000000000000000000000")
    
          // Very small ratio (0.000001)
          const result2 = calculateCreditPerCollateralUnit(BigInt(1), BigInt(1000000))
          expect(result2).toBe("100000000000000000000000000000000")
        })
    })
})