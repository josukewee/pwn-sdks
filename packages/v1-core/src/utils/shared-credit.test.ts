import { describe, it, expect, expectTypeOf } from 'vitest';
import { createUtilizedCreditId } from './shared-credit.js'
import type { AddressString, Hex } from "@pwndao/sdk-core";
import { invariant } from 'ts-invariant'

//availbleCreditlimit could be nevetive

describe(
    "createUtilizedCreditId", () => {
        const exampleAddresses: AddressString[] = [
        "0xabcdef1234567890abcdef1234567890abcdef12",
        "0x1234567890abcdef1234567890abcdef12345678",
        "0xa1b2c3d4e5f678901234567890abcdefabcdefab",
        "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
        "0x9999888877776666555544443333222211110000",
        ];

        const availableCreditLimits: bigint[] = [
        BigInt("1000000000000000000"), // 1 ETH
        BigInt("5000000000000000000"), // 5 ETH
        BigInt("250000000000000000"),  // 0.25 ETH
        BigInt("750000000000000000"),  // 0.75 ETH
        BigInt("10000000000000000000"), // 10 ETH
        ];
        test.each(exampleAddresses.map((address, index) => [
            address, 
            availableCreditLimits[index]
        ]))('createUtilizedCreditId with %s and %s', (address, creditLimit) => {
            invariant(creditLimit)
            const result = createUtilizedCreditId({proposer: address, availableCreditLimit: creditLimit});
            expect(result).toBeDefined();
            expectTypeOf(result).toEqualTypeOf<Hex>();
        })

        it('should throw error for negative availableCreditLimit', () => {
            const address = "0xabcdef1234567890abcdef1234567890abcdef12";
            const negativeCreditLimit = BigInt("-1000000000000000000"); // -1 ETH
            
            expect(() => {
                createUtilizedCreditId({
                    proposer: address, 
                    availableCreditLimit: negativeCreditLimit
                });
            }).toThrow();
        })
    }
)