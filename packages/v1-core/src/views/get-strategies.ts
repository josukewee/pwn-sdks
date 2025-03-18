import type { SupportedChain } from "@pwndao/sdk-core";
import { API } from "../api.js";
import type { Strategy } from "../models/strategies/types.js";

export const getStrategies = (chainId: SupportedChain): Promise<Strategy[]> =>
	API.get.getStrategies(chainId);
