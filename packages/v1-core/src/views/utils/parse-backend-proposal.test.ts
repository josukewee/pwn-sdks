import {parseBackendProposalResponse} from './parse-backend-proposal.js'
import { ProposalType } from '../../models/proposals/index.js';
import { describe, it, expect, expectTypeOf } from 'vitest';
import type { ProposalDetailSchema } from "@pwndao/api-sdk";
import type {
	Proposal,
	ProposalWithSignature,
} from "../../models/strategies/types.js";
import { ChainLinkProposal, ElasticProposal } from '../../models/proposals/index.js';

// bigInt could not be combined with other types. thinking of summing the arguments to see if it works
// this way we will check all the bigint at once

describe('parseBackendProposalResponse', () => {
  // Тест на корректную обработку ChainLink предложения
  it('should correctly parse ChainLink proposal', () => {
    const mockChainLinkProposal = {
      type: ProposalType.ChainLink,
      chainId: 1,
      collateral: { tokenId: '123' },
      availableCreditLimit: '1000',
      refinancingLoanId: '0',
      nonceSpace: '0',
      nonce: '1',
      minCreditAmount: '100',
      creditData: {
        fixedInterestAmount: '50',
        accruingInterestApr: '500',
        creditPerCollateralUnit: '0'
      },
      duration: '86400',
      signature: '0xsignature',
      hash: '0xhash',
      sourceOfFunds: 'test',
      multiproposalMerkleRoot: '0xroot'
    };

    const result = parseBackendProposalResponse(mockChainLinkProposal as ProposalDetailSchema);
    
    expect(result.type).toBe(ProposalType.ChainLink);
    expect(result.chainId).toBe(1);
    expect(result.signature).toBe('0xsignature');
    expect(result.hash).toBe('0xhash');
    // Проверка преобразования строк в BigInt
    expect(result.collateralId).toBe(123n);
    expect(result.availableCreditLimit).toBe(1000n);
  });

  it('should create appropriate proposal type based on input type', () => {
    //Test for ChainLink
    const chainLinkInput = {
      type: ProposalType.ChainLink,
      chainId: 1,
      collateral: { tokenId: '123' },
      creditData: {},
      signature: '0xsignature',
      hash: '0xhash'
    };
    
    const chainLinkResult = parseBackendProposalResponse(chainLinkInput as ProposalDetailSchema);
    expectTypeOf(chainLinkResult).toEqualTypeOf<ProposalWithSignature>();
    
    // Test for Elastic
    const elasticInput = {
      type: ProposalType.Elastic,
      chainId: 1,
      collateral: { tokenId: '123' },
      creditData: { creditPerCollateralUnit: '200' },
      signature: '0xsignature',
      hash: '0xhash'
    };
    
    const elasticResult = parseBackendProposalResponse(elasticInput as ProposalDetailSchema);
    expect(elasticResult).toBeInstanceOf(ElasticProposal);
  });

  it('should correctly parse backend data with V13SimpleLoanChainlinkProposalDetailSchemaWorkaround', () => {
    const backendData = {
      id: "123",
      duration: "86400",
      expiration: "1700000000",
      status: "ACTIVE",
      collateral: {
        tokenId: "123",
        address: "0xCollateralAddress",
        name: "Test NFT",
        symbol: "TNFT"
      },
      collateralAmount: "1",
      minCreditAmount: "100",
      creditData: {
        fixedInterestAmount: "50",
        accruingInterestApr: "500",
        creditPerCollateralUnit: "200"
      },
      creditAsset: {
        address: "0xCreditAddress",
        name: "Test Token",
        symbol: "TT"
      },
      chainId: 1,
      proposalContractAddress: "0xProposalContract",
      proposalId: "1",
      loanContract: "0xLoanContract",
      proposer: "0xProposer",
      isOffer: true,
      type: ProposalType.ChainLink,
      sourceOfFunds: "0xSourceOfFunds",
      checkCollateralStateFingerprint: false,
      collateralStateFingerprint: "0x0000000000000000000000000000000000000000000000000000000000000000",
      availableCreditLimit: "1000",
      allowedAcceptor: "0x0000000000000000000000000000000000000000",
      refinancingLoanId: "0",
      nonceSpace: "0",
      nonce: "1",
      proposerSpecHash: "0x0000000000000000000000000000000000000000000000000000000000000000",
      signature: "0xsignature",
      multiproposalMerkleRoot: "0xroot",
      isOnChain: false,
      hash: "0xhash",
      createdAt: 1600000000,
      durationOrDate: 86400,
      utilizedCreditId: "0x0000000000000000000000000000000000000000000000000000000000000000",
      feedIntermediaryDenominations: [1, 2, 3],
      feedInvertFlags: [false, true, false],
      loanToValue: 75
    };

    const result = parseBackendProposalResponse(backendData as ProposalDetailSchema);
    console.log(result, typeof(result))
    // Type checking
    expect(result).toBeInstanceOf(ChainLinkProposal);
    expectTypeOf(result).toMatchTypeOf<ProposalWithSignature>();
    
    // checking bigint transformation
    expect(result.type).toBe(ProposalType.ChainLink);
    expect(result.chainId).toBe(1);
    expect(result.collateralId).toBe(123n);
    expect(result.availableCreditLimit).toBe(1000n);
    expect(result.minCreditAmount).toBe(100n);
    expect(result.fixedInterestAmount).toBe(50n);
    expect(result.accruingInterestAPR).toBe(500n);
    expect(result.durationOrDate).toBe(86400n);
    expect(result.nonceSpace).toBe(0n);
    expect(result.nonce).toBe(1n);
  
    expect(result.signature).toBe("0xsignature");
    expect(result.hash).toBe("0xhash");
    expect(result.sourceOfFunds).toBe("0xSourceOfFunds");
    expect(result.multiproposalMerkleRoot).toBe("0xroot");
    
    expect(result.feedIntermediaryDenominations).toEqual([1, 2, 3]);
    expect(result.feedInvertFlags).toEqual([false, true, false]);
    expect(result.loanToValue).toBe(75);
  });
});

