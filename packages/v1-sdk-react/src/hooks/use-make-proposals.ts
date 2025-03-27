"use client";

import type {
	CreateElasticProposalBatchParams,
	ILoanContract,
	IProposalChainLinkContract,
	IProposalElasticAPIDeps,
	IProposalElasticContract,
	ProposalType,
	ProposalWithSignature,
} from "@pwndao/v1-core";
import { makeProposals } from "@pwndao/v1-core";
import { useMutation } from "@tanstack/react-query";

export type ElasticProposalProps = {
	proposalType: ProposalType.Elastic;
	api: IProposalElasticAPIDeps;
	contract: IProposalElasticContract;
	loanContract: ILoanContract;
};

export type ChainLinkProposalProps = {
	proposalType: ProposalType.ChainLink;
	api: IProposalElasticAPIDeps;
	contract: IProposalChainLinkContract;
	loanContract: ILoanContract;
};

type Props = ElasticProposalProps | ChainLinkProposalProps;

type ProposalParams = CreateElasticProposalBatchParams;

export const useMakeProposals = (proposalParams: Props) => {
	return useMutation<ProposalWithSignature[], Error, ProposalParams>({
		mutationFn: async (params: ProposalParams) => {
			const proposals = await makeProposals<typeof proposalParams.proposalType>(
				proposalParams.proposalType,
				params,
				{
					api: proposalParams.api,
					contract: proposalParams.contract as IProposalElasticContract,
					loanContract: proposalParams.loanContract,
				},
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
