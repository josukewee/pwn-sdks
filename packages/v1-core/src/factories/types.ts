import type {
	FreeUserNonceSchemaWorkaround,
	proposalCreateBatchResponse,
	proposalCreateResponse,
} from "@pwndao/api-sdk";
import type {
	AddressString,
	BaseAsset,
	Hex,
	SupportedChain,
	Token,
	UserWithNonceManager,
} from "@pwndao/sdk-core";
import type {
	ProposalWithSignature,
	Strategy,
} from "../models/strategies/types.js";

export type BaseTerm = {
	user: UserWithNonceManager;
	collateral: Token;
	credit: Token;
	creditAmount: bigint;
	ltv: Record<string, number>;
	apr: Record<string, number>;
	duration:
		| {
				days: number;
				date?: undefined;
		  }
		| {
				days?: undefined;
				date: Date;
		  };
	expirationDays: number;
	utilizedCreditId: Hex;
	relatedStrategyId?: string;
	isOffer: boolean;
};

export interface IServerAPI {
	get: {
		getStrategyDetail(strategyId: string): Promise<Strategy>;
		getStrategies(chainId: SupportedChain): Promise<Strategy[]>;
		proposalsByStrategy(strategyId: string): Promise<ProposalWithSignature[]>;
		/**
		 * Returns the recent nonce for the user and the nonce space
		 * @param userAddress
		 * @param chainId
		 * @returns [recentNonce, nonceSpace]
		 */
		recentNonce: (
			userAddress: AddressString,
			chainId: SupportedChain,
		) => Promise<[bigint, bigint]>;
		getAssetUsdUnitPrice: (asset: BaseAsset) => Promise<bigint>;
	};
	post: {
		persistProposal: (
			params: ProposalWithSignature,
		) => Promise<proposalCreateResponse>;
		persistProposals: (
			params: ProposalWithSignature[],
		) => Promise<proposalCreateBatchResponse>;
		/**
		 * Updates the nonce for the user and the chain
		 * @param userAddress
		 * @param chainId
		 * @param nonce
		 */
		updateNonce: (
			userAddress: AddressString,
			chainId: SupportedChain,
			nonce: bigint,
		) => Promise<FreeUserNonceSchemaWorkaround>;
	};
}
