import { ChainLinkProposalContract, ElasticProposalContract } from "../contracts/index.js";
import { ProposalType } from "../../src/index.js"
import type { Proposal } from "../../src/index.js"

type CommonProposalParams = Pick<Proposal, 'chainId' | 'type' | 'availableCreditLimit'>

type ElasticProposalSpecificParams = CommonProposalParams & Pick<Extract<Proposal, { type: ProposalType.Elastic }>, 
    'creditPerCollateralUnit'
>

type ChainLinkProposalSpecificParams = CommonProposalParams & Pick<Extract<Proposal, { type: ProposalType.ChainLink }>, 
    'creditAddress' | 'collateralAddress' | 'feedIntermediaryDenominations' | 'feedInvertFlags' | 'loanToValue'
>

export type IProposalSpecificParams = ElasticProposalSpecificParams | ChainLinkProposalSpecificParams

export const getCollateralAmount = async (contract: ElasticProposalContract | ChainLinkProposalContract, amount: bigint, proposalSpecificParams: IProposalSpecificParams) => {
    const proposal = {
        ...proposalSpecificParams,
        availableCreditLimit: amount,
    } as never;

    if (
        (contract instanceof ElasticProposalContract && proposalSpecificParams.type === ProposalType.Elastic) ||
        (contract instanceof ChainLinkProposalContract && proposalSpecificParams.type === ProposalType.ChainLink)
    ) {
        return await contract.getCollateralAmount(proposal)
    }
    
    throw new Error(`Incompatible proposal type and contract combination: ${proposalSpecificParams.type}`);
}