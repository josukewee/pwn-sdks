import type { SupportedChain } from "../chains.js";
import { ZERO_ADDRESS } from "../constants.js";
import { BaseAsset } from "../models/asset.js";

export class NativeToken extends BaseAsset {
	constructor(public override chainId: SupportedChain) {
		super(chainId, ZERO_ADDRESS, 18, true, 421);
	}
}
