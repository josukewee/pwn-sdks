import type {
	CreateChainLinkElasticProposalBatchParams,
	CreateElasticProposalBatchParams,
	ILoanContract,
	IProposalChainLinkAPIDeps,
	IProposalChainLinkContract,
	IProposalElasticAPIDeps,
	IProposalElasticContract,
	ProposalType,
	ProposalWithSignature,
} from "@pwndao/v1-core";
import { makeProposals } from "@pwndao/v1-core";
import { useMutation } from "@tanstack/vue-query";

export type ElasticProposalProps = {
	api: IProposalElasticAPIDeps;
	loanContract: ILoanContract;
};

export type ChainLinkProposalProps = {
	api: IProposalChainLinkAPIDeps;
	loanContract: ILoanContract;
};

type Props = ElasticProposalProps | ChainLinkProposalProps;
type ProposalParams = CreateElasticProposalBatchParams | CreateChainLinkElasticProposalBatchParams;
export type CommonCreateProposalParams = CreateElasticProposalBatchParams & CreateChainLinkElasticProposalBatchParams;

export const useMakeProposals = <T extends Props>(proposalParams: T) => {
	return useMutation<ProposalWithSignature[], Error, ProposalParams>({
		mutationFn: async (params: ProposalParams[]) => {
			type Deps = T extends { proposalType: ProposalType.Elastic } 
				? ElasticProposalProps
				: ChainLinkProposalProps;

			const deps = {
				api: proposalParams.api,
				loanContract: proposalParams.loanContract,
			} as Deps;

			const proposals = await makeProposals(
				params,
				deps,
			);

			return proposals;
		},
		onSuccess: (data) => {
			console.log(data);
		},
		onError: (error) => {
			console.error(error);
		},
	});
};
