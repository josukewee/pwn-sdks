import type { FungibleNFT, NFT } from "./nft.js";
import type { ERC20Token } from "./token.js";

export type Token = ERC20Token | NFT | FungibleNFT;
