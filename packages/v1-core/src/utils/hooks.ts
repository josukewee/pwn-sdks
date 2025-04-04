import { useConfig } from "wagmi";
import { ChainLinkProposalContract } from "src/contracts/index.js";
import { ChainLinkProposal, ProposalType } from "src/index.js";

type GetChainlinkCollateralAmountParams = {
    creditAddress: string,
    availableCreditLimit: string,
    collateralAddress: string,
    feedIntermediaryDenominations: string[],
    feedInvertFlags: boolean[],
    loanToValue: string,
    chainId: number,
}
export const useChainlinkUtils = () => {
    const config = useConfig()
    const getChainlinkCollateralAmount = async (params: GetChainlinkCollateralAmountParams) => {
        const proposal = {
            ...params,
            type: ProposalType.ChainLink,
        } as unknown as ChainLinkProposal
        const contract = new ChainLinkProposalContract(config)
        const data = await contract.getCollateralAmount(proposal)
        return data
    }

    return {
        getChainlinkCollateralAmount,
    }
}