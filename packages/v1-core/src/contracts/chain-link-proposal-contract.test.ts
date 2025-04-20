import { ChainLinkProposalContract } from "./index.js";
import { test, describe, beforeEach, expect } from "vitest";
import { ChainLinkProposal } from "../models/proposals/chainlink-proposal.js";
import { Hex } from "viem";
import { mainnet } from 'wagmi/chains';
import { type AddressString } from "@pwndao/sdk-core";
import { mock, type Config } from '@wagmi/core'
import type { Mutate, StoreApi } from 'zustand/vanilla'

vi.mock('@moleculexyz/wagmi-safe-wait-for-tx', () => ({
    safeWaitForTransactionReceipt: vi.fn().mockResolvedValue({ status: 'success' })
}));

describe("ChainlinkProposalContract", () => {

    beforeEach(() => {
		vi.clearAllMocks();
	});

    const mockConfig: Config = {
    chains: [mainnet],
    connectors: [],
    storage: null,
    state: {
        chainId: mainnet.id,
        connections: new Map(),
        current: null,
        status: 'disconnected' as const
        },
        getClient: vi.fn(),
        setState: vi.fn(),
        subscribe: vi.fn(),
        _internal: {
            mipd: undefined,
            store: {
                getState: vi.fn(),
                setState: vi.fn(),
                subscribe: vi.fn()
            } as Mutate<StoreApi<any>, [['zustand/persist', any]]>,
            ssr: false,
            syncConnectedChain: true,
            transports: {},
            chains: {
                setState: vi.fn(),
                subscribe: vi.fn()
            },
            connectors: {
                providerDetailToConnector: vi.fn(),
                setup: vi.fn(),
                setState: vi.fn(),
                subscribe: vi.fn()
            },
            events: {
                change: vi.fn(),
                connect: vi.fn(),
                disconnect: vi.fn()
            }
        }
    }

    const mockDeps = {
        persistProposal: vi.fn().mockResolvedValue({ success: true })
    };

    const mockChainLinkProposal = new ChainLinkProposal({
        feedIntermediaryDenominations: ["0xUSD"] as `0x${string}`[],
        feedInvertFlags: [false],
        loanToValue: BigInt(7500),
        minCreditAmount: BigInt(1000),
        collateralAddress: "0x1234567890123456789012345678901234567890" as `0x${string}`,
        collateralId: BigInt(0),
        checkCollateralStateFingerprint: false,
        collateralStateFingerprint: "0x0000000000000000000000000000000000000000000000000000000000000000" as `0x${string}`,
        availableCreditLimit: BigInt(10000),
        utilizedCreditId: "0x7890000000000000000000000000000000000000000000000000000000000000" as `0x${string}`,
        expiration: 1234567890,
        allowedAcceptor: "0x0000000000000000000000000000000000000000" as `0x${string}`,
        proposer: "0xdef0000000000000000000000000000000000000" as `0x${string}`,
        isOffer: true,
        refinancingLoanId: BigInt(0),
        nonceSpace: BigInt(1),
        collateralCategory: 0, // MultiTokenCategory
        creditAddress: "0xabc0000000000000000000000000000000000000" as `0x${string}`,
        durationOrDate: 30,
        proposerSpecHash: "0x0000000000000000000000000000000000000000000000000000000000000000" as `0x${string}`,
        nonce: BigInt(1),
        fixedInterestAmount: BigInt(0),
        accruingInterestAPR: 500, // 5%
        relatedStrategyId: "strategy-1",
        sourceOfFunds: null,
        chainId: mainnet.id,
        loanContract: "0x0000000000000000000000000000000000000000" as `0x${string}`,
    }, mainnet.id);

    const mockHash = "0x1234567890abcdef" as Hex;

    const exampleChainLinkProposalContract = new ChainLinkProposalContract(mockConfig)
    it("should getProposalHash", async () => {
        vi.mock('@moleculexyz/wagmi-safe-wait-for-tx', () => ({
            waitForTransaction: vi.fn().mockResolvedValue(true)
        }));
        const mockClient = {
            readContract: vi.fn().mockResolvedValue(mockHash)
        };
        
        mockConfig.getClient = vi.fn().mockReturnValue(mockClient);

        const hash = await exampleChainLinkProposalContract.getProposalHash(mockChainLinkProposal);
        expect(hash).toBe(mockHash);

        expect(mockConfig.getClient).toHaveBeenCalledWith({
            chainId: mockChainLinkProposal.chainId
        });
    });

    it("should signProposal", async () => {
        const signedProposal = await exampleChainLinkProposalContract.signProposal(mockChainLinkProposal);
    });

    it("should CreateProposal", async () => {
        const proposal = await exampleChainLinkProposalContract.createProposal(mockChainLinkProposal, mockDeps);
    });

    it("should createOnChainProposal", async () => {
        const onChainProposal = await exampleChainLinkProposalContract.createOnChainProposal(mockChainLinkProposal);
    });

    it("should getCollateralAmount", async () => {
        const collateralAmount = await exampleChainLinkProposalContract.getCollateralAmount(mockChainLinkProposal);
    });
});