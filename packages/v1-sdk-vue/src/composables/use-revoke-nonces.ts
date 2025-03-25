import type { SupportedChain } from "@pwndao/sdk-core";
import { RevokedNonceContract, revokeProposals } from "@pwndao/v1-core";
import { useMutation } from "@tanstack/vue-query";
import { useConfig } from "@wagmi/vue";
import { computed } from "vue";

export const useRevokeNonces = () => {
    const config = useConfig();
    const contract = computed(() => new RevokedNonceContract(config))

    return useMutation({
        mutationKey: ['revokeNonces'],
        mutationFn: ({
            proposalNonces,
            chainId,
        }: {
            proposalNonces: bigint[];
            chainId: SupportedChain;
        }) => revokeProposals(proposalNonces, chainId, contract.value),
    });
}