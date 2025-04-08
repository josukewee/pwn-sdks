import { useQuery } from "@tanstack/vue-query";
import { useConfig } from "@wagmi/vue"
import { getCollateralAmount, IProposalSpecificParams } from "@pwndao/v1-core";
import { ChainLinkProposalContract } from "@pwndao/v1-core";
import { ElasticProposalContract } from "@pwndao/v1-core";
import { ProposalType } from "@pwndao/v1-core";
import { computed, reactive, toRefs } from "vue";

export const useGetCollateralAmount = (params: IProposalSpecificParams) => {
    const reactiveParams = reactive(params);
    const { type, availableCreditLimit } = toRefs(reactiveParams);
    
    const config = useConfig()
    const contract = computed(() => {
        if (type.value === ProposalType.Elastic) {
            return new ElasticProposalContract(config)
        } else {
            return new ChainLinkProposalContract(config)
        }
    })

    return useQuery({
        queryKey: ["get-proposal-collateral-amount", reactiveParams],
        queryFn: () => getCollateralAmount(contract.value, availableCreditLimit.value, reactiveParams),
    });
};