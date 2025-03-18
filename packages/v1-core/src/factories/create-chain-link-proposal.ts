import type { BaseTerm, IServerAPI } from './types.js';
import type { IOracleProposalBase } from '../models/proposals/proposal-base.js';
import type {
  IProposalStrategy,
  ProposalWithHash,
  ProposalWithSignature,
  StrategyTerm,
} from '../models/strategies/types.js';
import {
  getLendingCommonProposalFields,
  type IProposalContract,
} from './helpers.js';
import type {
  Hex,
  UserWithNonceManager,
  AddressString,
  Token,
} from '@pwndao/sdk-core';
import { ChainLinkProposal } from '../models/proposals/chainlink-proposal.js';
import { getLoanContractAddress } from '@pwndao/sdk-core';

export interface IProposalChainLinkContract extends IProposalContract {
  getProposalHash(proposal: ChainLinkProposal): Promise<Hex>;
  getCollateralAmount(
    creditAddress: AddressString,
    creditAmount: bigint,
    collateralAddress: AddressString,
    feedIntermediaryDenominations: AddressString[],
    feedInvertFlags: boolean[]
  ): Promise<bigint>;
  createProposal(proposal: ChainLinkProposal): Promise<ProposalWithSignature>;
  createMultiProposal(
    proposals: ProposalWithHash[]
  ): Promise<ProposalWithSignature[]>;
}

export interface IProposalChainLinkAPIDeps {
  getAssetUsdUnitPrice: IServerAPI['get']['getAssetUsdUnitPrice'];
  persistProposal: IServerAPI['post']['persistProposal'];
  persistProposals: IServerAPI['post']['persistProposals'];
  updateNonces: IServerAPI['post']['updateNonce'];
}

export class ChainLinkProposalStrategy
  implements IProposalStrategy<IOracleProposalBase>
{
  constructor(
    public term: StrategyTerm ,
    public api: IProposalChainLinkAPIDeps,
    public contract: IProposalChainLinkContract
  ) {}

  async implementChainLinkProposal(
    params: CreateChainLinkElasticProposalParams,
    api: IProposalChainLinkAPIDeps,
    contract: IProposalChainLinkContract
  ): Promise<ChainLinkProposal> {
    // Calculate expiration timestamp
    const expiration =
      Math.floor(Date.now() / 1000) + params.expirationDays * 24 * 60 * 60;

    // Get duration in seconds or timestamp
    let durationOrDate: number;
    if (params.duration.days !== undefined) {
      durationOrDate = params.duration.days * 24 * 60 * 60;
    } else {
      durationOrDate = Math.floor(params.duration.date.getTime() / 1000);
    }

    // Calculate the required collateral amount using ChainLink
    // note: not being used in the proposal data in some of the proposal types
    const collateralAmount = await contract.getCollateralAmount(
      params.credit.address,
      params.creditAmount,
      params.collateral.address,
      [], // feedIntermediaryDenominations - empty for simplicity
      [] // feedInvertFlags - empty for simplicity
    );

    // Get common proposal fields
    const commonFields = await getLendingCommonProposalFields(
      {
        user: params.user,
        collateral: params.collateral,
        credit: params.credit,
        creditAmount: params.creditAmount,
        utilizedCreditId: params.utilizedCreditId,
        durationOrDate,
        apr: params.apr,
        expiration,
        loanContract: getLoanContractAddress(params.collateral.chainId),
        relatedStrategyId: this.term.id,
      },
      {
        contract: contract,
      }
    );

    // Create and return the ChainLink proposal
    return new ChainLinkProposal(
      {
        ...commonFields,
        feedIntermediaryDenominations: [],
        feedInvertFlags: [],
        loanToValue: params.ltv,
        minCreditAmount: collateralAmount,
        chainId: params.collateral.chainId,
      },
      params.collateral.chainId
    );
  }

  getProposalsParams(
    user: UserWithNonceManager,
    creditAmount: bigint,
    utilizedCreditId: Hex
  ): CreateChainLinkElasticProposalParams[] {
    const result: CreateChainLinkElasticProposalParams[] = [];
    for (const credit of this.term.creditAssets) {
      for (const collateral of this.term.collateralAssets) {
        result.push({
          collateral,
          credit,
          user,
          creditAmount,
          utilizedCreditId,

          apr: this.term.apr,
          duration: {
            days: this.term.durationDays,
            date: undefined,
          },
          ltv: this.term.ltv,
          expirationDays: this.term.expirationDays,
          minAmountPercentage: Number(this.term.minCreditAmountPercentage),
          relatedStrategyId: this.term.id,
        });
      }
    }

    return result;
  }

  async createLendingProposals(
    user: UserWithNonceManager,
    creditAmount: bigint,
    utilizedCreditId: Hex
  ): Promise<ChainLinkProposal[]> {
    const paramsArray = this.getProposalsParams(
      user,
      creditAmount,
      utilizedCreditId
    );
    const result: ChainLinkProposal[] = [];

    const proposals = await Promise.allSettled(
      paramsArray.map(async (params) => {
        try {
          // Use the shared implementation directly
          return await this.implementChainLinkProposal(
            params,
            this.api,
            this.contract
          );
        } catch (error) {
          console.error('Error creating ChainLink proposal:', error);
          throw error;
        }
      })
    );

    for (const proposal of proposals) {
      if (proposal.status === 'fulfilled') {
        result.push(proposal.value);
      }
    }

    return result;
  }
}

export type CreateChainLinkElasticProposalParams = BaseTerm & {
  minAmountPercentage: number;
};

export type ChainLinkElasticProposalDeps = {
  api: IProposalChainLinkAPIDeps;
  contract: IProposalChainLinkContract;
}

export const createChainLinkElasticProposal = async (
  params: CreateChainLinkElasticProposalParams,
  deps: ChainLinkElasticProposalDeps
): Promise<ChainLinkProposal> => {
  // Create a dummy StrategyTerm with just enough data for the strategy to work
  const dummyTerm: StrategyTerm = {
    creditAssets: [params.credit],
    collateralAssets: [params.collateral],
    apr: params.apr,
    durationDays: params.duration.days || 0,
    ltv: params.ltv,
    expirationDays: params.expirationDays,
    minCreditAmountPercentage: BigInt(params.minAmountPercentage),
  };

  const strategy = new ChainLinkProposalStrategy(
    dummyTerm,
    deps.api,
    deps.contract as IProposalChainLinkContract
  );
  const proposals = await strategy.createLendingProposals(
    params.user,
    params.creditAmount,
    params.utilizedCreditId
  );
  return proposals[0];
};

/**
 * Parameters for creating a batch of elastic proposals
 */
export type CreateChainLinkElasticProposalBatchParams = {
  terms: Omit<BaseTerm, 'collateral' | 'credit'> & {
    minAmountPercentage: number;
  };
  collateralAssets: Token[];
  creditAssets: Token[];
};

/**
 * Creates multiple elastic proposals in a batch
 *
 * @param params - The parameters for the batch of proposals
 * @param deps - RPC interface and contract
 * @returns Array of created elastic proposals
 */
export const createChainLinkElasticProposalBatch = async (
  params: CreateChainLinkElasticProposalBatchParams,
  deps: ChainLinkElasticProposalDeps
): Promise<ChainLinkProposal[]> => {
  // Create a strategy term with the batch parameters
  const dummyTerm: StrategyTerm = {
    creditAssets: params.creditAssets,
    collateralAssets: params.collateralAssets,
    apr: params.terms.apr,
    durationDays: params.terms.duration.days || 0,
    ltv: params.terms.ltv,
    expirationDays: params.terms.expirationDays,
    minCreditAmountPercentage: BigInt(params.terms.minAmountPercentage),
    // id: '1',
  };

  // Create a strategy and generate all proposals
  const strategy = new ChainLinkProposalStrategy(
    dummyTerm,
    deps.api,
    deps.contract
  );
  const proposals = await strategy.createLendingProposals(
    params.terms.user,
    params.terms.creditAmount,
    params.terms.utilizedCreditId
  );

  return proposals;
};
