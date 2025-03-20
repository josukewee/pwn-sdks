import {
	MultiTokenCategory,
	SupportedChain,
	ZERO_ADDRESS,
	ZERO_FINGERPRINT,
	getLoanContractAddress,
} from "@pwndao/sdk-core";
import {
	generateAddress,
	getMockToken,
	getMockUserWithNonceManager,
} from "@pwndao/sdk-core";
import { ProposalType } from "../models/proposals/proposal-base.js";
import { makeProposal } from "./make-proposal.js";

describe("Test make proposal", () => {
	const token_1_address = generateAddress();
	const token_2_address = generateAddress();
	const user_address = generateAddress();
	const date = new Date("2025-02-01T00:00:00.000Z");

	beforeEach(() => {
		// Reset timers before setting up fake timers again
		vi.useRealTimers();

		vi.useFakeTimers();
		vi.setSystemTime(date);
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	const durationDays = 30;
	const expirationDays = 30;
	const creditAmount = 1n * 10n ** 18n;
	const ltv = 6969n;
	const apr = 1000;

	const proposerSpecHash = generateAddress();

	it("should assemble elastic proposal", async () => {
		const contractMock = {
			createProposal: vi.fn().mockImplementation((p) => p),
			getProposerSpec: vi
				.fn()
				.mockImplementation(() => Promise.resolve(proposerSpecHash)),
		};

		const proposal = await makeProposal<ProposalType.Elastic>(
			ProposalType.Elastic,
			{
				collateral: getMockToken(SupportedChain.Ethereum, token_1_address),
				user: getMockUserWithNonceManager(user_address),
				credit: getMockToken(SupportedChain.Ethereum, token_2_address),
				creditAmount,
				ltv: {
					[`${token_1_address}/${SupportedChain.Ethereum}-${token_2_address}/${SupportedChain.Ethereum}`]:
						Number(ltv),
				},
				apr: {
					[`${token_1_address}/${SupportedChain.Ethereum}-${token_2_address}/${SupportedChain.Ethereum}`]:
						apr,
				},
				duration: {
					days: durationDays,
					date: undefined,
				},
				expirationDays,
				utilizedCreditId: generateAddress(), // Utilized credit is essentialy 32 bytes
				minCreditAmountPercentage: 3,
				relatedStrategyId: "1",
				isOffer: true
			},
			{
				api: {
					getAssetUsdUnitPrice: async () => 1000000000000000000n,
				},
				contract: contractMock,
			},
		);

		expect(contractMock.createProposal).toHaveBeenCalled();
		expect(contractMock.getProposerSpec).toHaveBeenCalled();
		expect(contractMock.getProposerSpec).toHaveBeenCalledWith(
			{
				sourceOfFunds: user_address,
			},
			SupportedChain.Ethereum,
		);

		expect(proposal).toBeDefined();
		expect(proposal.proposerSpecHash).toBe(proposerSpecHash);
		expect(proposal.collateralAddress).toBe(token_1_address);
		expect(proposal.creditAddress).toBe(token_2_address);
		expect(proposal.availableCreditLimit).toBe(1n * 10n ** 18n);
		expect(proposal.minCreditAmount).toBe(3n * 10n ** (18n - 2n)); // 3% of credit amount
		expect(proposal.accruingInterestAPR).toBe(apr);
		expect(proposal.durationOrDate).toBe(durationDays * 24 * 60 * 60);
		// Verify expiration calculation: current timestamp + expirationDays * 24 * 60 * 60
		const expectedExpiration =
			Math.floor(date.getTime() / 1000) + expirationDays * 24 * 60 * 60;
		expect(proposal.expiration).toBe(expectedExpiration);
		expect(expectedExpiration).toBe(1740960000);

		expect(proposal.collateralCategory).toBe(MultiTokenCategory.ERC20);
		expect(proposal.collateralId).toBe(0n);
		expect(proposal.checkCollateralStateFingerprint).toBe(false);
		expect(proposal.collateralStateFingerprint).toBe(ZERO_FINGERPRINT);
		expect(proposal.allowedAcceptor).toBe(ZERO_ADDRESS);
		expect(proposal.proposer).toBe(user_address);
		expect(proposal.isOffer).toBe(true);
		expect(proposal.refinancingLoanId).toBe(0n);
		expect(proposal.nonceSpace).toBe(0n);
		expect(proposal.nonce).toBe(0n);
		expect(proposal.loanContract).toBe(
			getLoanContractAddress(SupportedChain.Ethereum),
		);
		expect(proposal.relatedStrategyId).toBe("1");
	});
});
