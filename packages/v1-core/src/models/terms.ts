import type { AddressString, BaseAsset, Hex } from "@pwndao/sdk-core";

export interface IBaseTerms {
	/**
	 * Address of a lender.
	 */
	lender: AddressString;
	/**
	 * Address of a borrower
	 */
	borrower: AddressString;
	/**
	 * Loan duration is seconds
	 */
	duration: bigint;
	/**
	 * Asset used as a loan collateral. For a definition see { MultiToken dependency lib }.
	 */
	collateral: BaseAsset;
	/**
	 * Asset used as loan credit.
	 */
	credit: BaseAsset;
	/**
	 * Fixed interest amount in credit asset tokens. It is the minimum amount of interest which has to be paid by a borrower.
	 */
	fixedInterestAmount: bigint;
	/**
	 * Accuring interest APR
	 */
	accruingInterestAPR: number;

	/**
	 * Hash of a lender specification.
	 */
	lenderSpec: ILenderSpec;

	/**
	 * Hash of a borrower specification
	 */
	borrowerSpec: ICallerSpec;
}

/**
 * Loan proposal specification during loan creation.
 */
export interface IProposalSpec {
	/**
	 * Address of a loan proposal contract.
	 */
	proposalContract: AddressString;
	/**
	 * Encoded proposal data that is passed to the loan proposal contract.
	 */
	proposalData: Hex;

	/**
	 * Inclusion proof of the proposal in the proposal contract.
	 */
	proposalInclusionProof: Hex[];

	/**
	 * Signature of proposal.
	 */
	signature: Hex;
}

/**
 * Lender specification during loan creation.
 */
export interface ILenderSpec {
	/**
	 * Address of a source of funds. This can be the lenders address, if the loan is funded directly,
	 * or a pool address from with the funds are withdrawn on the lenders behalf.
	 */
	sourceOfFunds: AddressString;
}

export interface ICallerSpec {
	refinancingLoanId: bigint;
	revokeNonce: boolean;
	nonce: bigint;
}

interface ITermsWithAmounts extends IBaseTerms {
	collateralAmount: bigint;
	creditAmount: bigint;
}

export abstract class ProposalTerms implements IBaseTerms {
	constructor(
		public lender: AddressString,
		public borrower: AddressString,
		public duration: bigint,
		public collateral: BaseAsset,
		public credit: BaseAsset,
		public fixedInterestAmount: bigint,
		public accruingInterestAPR: number,
		public lenderSpec: ILenderSpec,
		public borrowerSpec: ICallerSpec,
	) {}
}

/**
 * todo: parse with abitype
 */
// type getChainLinkElasticProposalParams = Abi

type MinTermsForPrice = Pick<IBaseTerms, "collateral" | "credit">;

interface IOracleCalculationsBase {
	intermediaryDenominations: AddressString[];
	invertFlags: boolean[];
}

interface PriceCalculationParams {
	creditAmount: bigint;
	// creditAddress?: can be taken from IBaseTerms.credit.address;
	// collateralAddress: AddressString;
	loanToValue: bigint;
	terms: MinTermsForPrice;
	/**
	 * Optional for oracle proposals
	 */
	feedParams?: IOracleCalculationsBase;
}

interface IPriceCalculationStrategy {
	getCollateralAmount(params: PriceCalculationParams): ITermsWithAmounts;
}

export class ElasticProposalTerms {
	constructor(private contract: IPriceCalculationStrategy) {}

	createBorrowingTerms(
		terms: IBaseTerms,
		lenderSpec: ILenderSpec,
		borrowerSpec: ICallerSpec,
		creditAmount: bigint,
		loanToValue: bigint,
	): ITermsWithAmounts {
		const { collateralAmount } = this.contract.getCollateralAmount({
			creditAmount,
			loanToValue,
			terms: {
				collateral: terms.collateral,
				credit: terms.credit,
			},
		});

		return {
			...terms,
			lenderSpec,
			borrowerSpec,
			collateralAmount,
			creditAmount,
		};
	}

	createLendingTerms(
		terms: IBaseTerms,
		lenderSpec: ILenderSpec,
		borrowerSpec: ICallerSpec,
		creditAmount: bigint,
		loanToValue: bigint,
	): ITermsWithAmounts {
		const { collateralAmount } = this.contract.getCollateralAmount({
			creditAmount,
			loanToValue,
			terms: {
				collateral: terms.collateral,
				credit: terms.credit,
			},
		});

		return {
			...terms,
			lenderSpec,
			borrowerSpec,
			collateralAmount,
			creditAmount,
		};
	}
}
