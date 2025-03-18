import type { AddressString } from "src/types.js";
import type { SupportedChain } from "../chains.js";
import { BaseAsset, MultiTokenCategory } from "./asset.js";

export class NFT extends BaseAsset {
	static category = MultiTokenCategory.ERC721;

	constructor(
		chainId: SupportedChain,
		address: AddressString,
		decimals: number,
		name?: string,
		symbol?: string,
	) {
		super(chainId, address, decimals, false, NFT.category, name, symbol);
	}
}

export class FungibleNFT extends BaseAsset {
	static category = MultiTokenCategory.ERC1155;
	// balance is not the part of asset static data so it doesn't make sense to have it here

	constructor(
		chainId: SupportedChain,
		address: AddressString,
		decimals: number,
		name?: string,
		symbol?: string,
	) {
		super(
			chainId,
			address,
			decimals,
			false,
			FungibleNFT.category,
			name,
			symbol,
		);
	}
}
