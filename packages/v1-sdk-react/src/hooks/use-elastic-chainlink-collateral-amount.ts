import { useQuery } from "@tanstack/react-query";
import { useConfig } from "wagmi"
import { getCollateralAmount, IProposalSpecificParams } from "@pwndao/v1-core";
import { ChainLinkProposalContract } from "@pwndao/v1-core";
import { ElasticProposalContract } from "@pwndao/v1-core";
import { ProposalType } from "@pwndao/v1-core";


export const useGetCollateralAmount = (params: IProposalSpecificParams) => {
    const config = useConfig()
    let contract: ElasticProposalContract | ChainLinkProposalContract

    if (params.type === ProposalType.Elastic) {
        contract = new ElasticProposalContract(config)
    } else {
        contract = new ChainLinkProposalContract(config)
    }

    return useQuery({
        queryKey: ["get-proposal-collateral-amount", params],
        queryFn: () => getCollateralAmount(contract, params.availableCreditLimit, params),
    });
};