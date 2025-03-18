// import { parseAbi } from 'viem';

// // Proposal ABI as string literals
// const PROPOSAL_ABI = [
//   // Proposal struct definition
//   "struct Proposal { uint8 collateralCategory; address collateralAddress; uint256 collateralId; bool checkCollateralStateFingerprint; bytes32 collateralStateFingerprint; address creditAddress; address[] feedIntermediaryDenominations; bool[] feedInvertFlags; uint256 loanToValue; uint256 minCreditAmount; uint256 availableCreditLimit; bytes32 utilizedCreditId; uint256 fixedInterestAmount; uint24 accruingInterestAPR; uint32 durationOrDate; uint40 expiration; address allowedAcceptor; address proposer; bytes32 proposerSpecHash; bool isOffer; uint256 refinancingLoanId; uint256 nonceSpace; uint256 nonce; address loanContract; }",

//   // Function to get proposal details
//   'function getProposal(uint256 proposalId) view returns (tuple(uint8 proposalType, address creator, address lender, uint256 validUntil, address borrowTicket, uint256 borrowTicketId, address lendTicket, uint256 lendTicketId, address currency, uint256 amount, uint256 duration, uint256 aprBps, address metadataURI, bool executed, bool rejected, bool invalidated, uint256 principalPaid, uint256 interestPaid, uint256 collateralTransferredTo))',
// ] as const;

// // Loan contract ABI as string literals
// const LOAN_ABI = [
//   // Core loan functions
// //   'function createProposal(tuple(uint8,address,uint256,bool,bytes32,address,address[],bool[],uint256,uint256,uint256,bytes32,uint256,uint24,uint32,uint40,address,address,bytes32,bool,uint256,uint256,uint256,address) proposal) returns (uint256)',
// //   'function acceptProposal(uint256 proposalId, uint256 creditAmount) returns (uint256)',
//   'function repayLOAN(uint256 loanId)',
//   'function getLoan(uint256 loanId) view returns (tuple(uint256 id, address borrower, address lender, uint256 startTime, uint256 duration, address collateralAddress, uint256 collateralId, address creditAddress, uint256 creditAmount, uint256 fixedInterestAmount, uint24 accruingInterestAPR, uint256 repaidPrincipal, uint256 repaidInterest, bool defaulted, bool canceled))',
//   'function getProposalStatus(uint256 proposalId) view returns (uint8)',
// ] as const;

// const base_proposal_abis = [
//     'function getProposalHash(Proposal proposal) view returns (bytes32)',
//     'function makeProposal(Proposal proposal) external returns (bytes32 proposalHash)',
// ] as const;

// const elasitc_proposal_abis = [
//     ...base_proposal_abis,
//     'struct Proposal { uint8 collateralCategory; address collateralAddress; uint256 collateralId; bool checkCollateralStateFingerprint; bytes32 collateralStateFingerprint; address creditAddress; uint256 creditPerCollateralUnit; uint256 minCreditAmount; uint256 availableCreditLimit; bytes32 utilizedCreditId; uint256 fixedInterestAmount; uint24 accruingInterestAPR; uint32 durationOrDate; uint40 expiration; address allowedAcceptor; address proposer; bytes32 proposerSpecHash; bool isOffer; uint256 refinancingLoanId; uint256 nonceSpace; uint256 nonce; address loanContract; }',
// ] as const;

// const chain_link_proposal_abis = [
//     ...base_proposal_abis,
//     'struct Proposal { uint8 collateralCategory; address collateralAddress; uint256 collateralId; bool checkCollateralStateFingerprint; bytes32 collateralStateFingerprint; address creditAddress; address[] feedIntermediaryDenominations; bool[] feedInvertFlags; uint256 loanToValue; uint256 minCreditAmount; uint256 availableCreditLimit; bytes32 utilizedCreditId; uint256 fixedInterestAmount; uint24 accruingInterestAPR; uint32 durationOrDate; uint40 expiration; address allowedAcceptor; address proposer; bytes32 proposerSpecHash; bool isOffer; uint256 refinancingLoanId; uint256 nonceSpace; uint256 nonce; address loanContract; }',
// ] as const;

// const list_proposal_abis = [
//     ...base_proposal_abis,
//     'struct Proposal { unit8 collateralCategory; address collateralAddress; bytes32 collateralIdsWhitelistMerkleRoot; uint256 collateralAmount; bool checkCollateralStateFingerprint; bytes32 collateralStateFingerprint; address creditAddress; uint256 creditAmount; uint256 availableCreditLimit; bytes32 utilizedCreditId; uint256 fixedInterestAmount; uint24 accruingInterestAPR; uint32 durationOrDate; uint40 expiration; address allowedAcceptor; address proposer; bytes32 proposerSpecHash; bool isOffer; uint256 refinancingLoanId; uint256 nonceSpace; uint256 nonce; address loanContract; }',
// ] as const;

// const dutch_auction_proposal_abis = [
//     ...base_proposal_abis,
//     'struct Proposal { uint8 collateralCategory; address collateralAddress; uint256 collateralId; uint256 collateralAmount; bool checkCollateralStateFingerprint; bytes32 collateralStateFingerprint; address creditAddress; uint256 minCreditAmount; uint256 maxCreditAmount; uint256 availableCreditLimit; bytes32 utilizedCreditId; uint256 fixedInterestAmount; uint24 accruingInterestAPR; uint32 durationOrDate; uint40 auctionStart; uint40 auctionDuration; address allowedAcceptor; address proposer; bytes32 proposerSpecHash; bool isOffer; uint256 refinancingLoanId; uint256 nonceSpace; uint256 nonce; address loanContract; }',
// ] as const;

// const simple_proposal_abis = [
//     'function getProposalHash(Proposal proposal) view returns (bytes32)',
//     'function makeProposal(Proposal proposal) external returns (bytes32 proposalHash)',
//     'struct Proposal { unit8 collateralCategory; address collateralAddress; uint256 collateralId; uint256 collateralAmount; bool checkCollateralStateFingerprint; bytes32 collateralStateFingerprint; address creditAddress; uint256 creditAmount; uint256 availableCreditLimit; bytes32 utilizedCreditId; uint256 fixedInterestAmount; uint24 accruingInterestAPR; uint32 durationOrDate; uint40 expiration; address allowedAcceptor; address proposer; bytes32 proposerSpecHash; bool isOffer; uint256 refinancingLoanId; uint256 nonceSpace; uint256 nonce; address loanContract; }',
// ] as const;

// // Export parsed ABIs
// export const proposalAbi = parseAbi(PROPOSAL_ABI);
// export const loanAbi = parseAbi(LOAN_ABI);

// export const listProposalAbi = parseAbi(list_proposal_abis)
// export const elasticProposalAbi = parseAbi(elasitc_proposal_abis)
// export const chainLinkProposalAbi = parseAbi(chain_link_proposal_abis)
// export const dutchAuctionProposalAbi = parseAbi(dutch_auction_proposal_abis)
// export const simpleProposalAbi = parseAbi(simple_proposal_abis)

export const multiCallAbi = [
	{
		inputs: [
			{
				components: [
					{ internalType: "address", name: "target", type: "address" },
					{ internalType: "bytes", name: "callData", type: "bytes" },
				],
				internalType: "struct Multicall.Call[]",
				name: "calls",
				type: "tuple[]",
			},
		],
		name: "aggregate",
		outputs: [
			{ internalType: "uint256", name: "blockNumber", type: "uint256" },
			{ internalType: "bytes[]", name: "returnData", type: "bytes[]" },
		],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [{ internalType: "uint256", name: "blockNumber", type: "uint256" }],
		name: "getBlockHash",
		outputs: [{ internalType: "bytes32", name: "blockHash", type: "bytes32" }],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [],
		name: "getCurrentBlockCoinbase",
		outputs: [{ internalType: "address", name: "coinbase", type: "address" }],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [],
		name: "getCurrentBlockDifficulty",
		outputs: [{ internalType: "uint256", name: "difficulty", type: "uint256" }],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [],
		name: "getCurrentBlockGasLimit",
		outputs: [{ internalType: "uint256", name: "gaslimit", type: "uint256" }],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [],
		name: "getCurrentBlockTimestamp",
		outputs: [{ internalType: "uint256", name: "timestamp", type: "uint256" }],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [{ internalType: "address", name: "addr", type: "address" }],
		name: "getEthBalance",
		outputs: [{ internalType: "uint256", name: "balance", type: "uint256" }],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [],
		name: "getLastBlockHash",
		outputs: [{ internalType: "bytes32", name: "blockHash", type: "bytes32" }],
		stateMutability: "view",
		type: "function",
	},
] as const;
