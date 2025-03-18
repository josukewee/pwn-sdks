import { API } from "../api.js";
import type { Strategy } from "../models/strategies/types.js";

export const getStrategy = (strategyId: string): Promise<Strategy> =>
	API.get.getStrategyDetail(strategyId);
