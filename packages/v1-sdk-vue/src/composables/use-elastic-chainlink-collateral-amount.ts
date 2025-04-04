import { useQuery } from "@tanstack/vue-query";
import { useConfig } from "@wagmi/vue"
import { getCollateralAmount, IProposalSpecificParams } from "@pwndao/v1-core";
import { ChainLinkProposalContract } from "@pwndao/v1-core";
import { ElasticProposalContract } from "@pwndao/v1-core";
import { ProposalType } from "@pwndao/v1-core";
import { computed } from "vue";


export const useGetCollateralAmount = (params: IProposalSpecificParams) => {
    const config = useConfig()
    const contract = computed(() => {
        if (params.type === ProposalType.Elastic) {
            return new ElasticProposalContract(config)
        } else {
            return new ChainLinkProposalContract(config)
        }
    })

    return useQuery({
        queryKey: ["get-proposal-collateral-amount", params],
        queryFn: () => getCollateralAmount(contract.value, params.availableCreditLimit, params),
    });
};