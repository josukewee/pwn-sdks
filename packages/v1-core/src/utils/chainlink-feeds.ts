import type { AddressString } from "@pwndao/sdk-core"
import { SupportedChain, typeSafeObjectKeys } from "@pwndao/sdk-core"
import { DAI, PYUSD, sUSDe, USDe, tBTC, wstETH, USDT, USDC, TUSD, cbETH, weETH, rsETH, ezETH, LBTC, rETH, solvBTC, stETH, WBTC, cbBTC, USD0, WETH, EURc, GHO, USDS } from "../addresses.js"
import invariant from "ts-invariant"

export const ENABLED_QUOTES = {
    [SupportedChain.Ethereum]: ['BTC', 'ETH', 'USD'] as const,
    [SupportedChain.Base]: ['BTC', 'ETH', 'USD', 'EUR'] as const,
    [SupportedChain.Sepolia]: ['ETH', 'USD']
} as const

export const EXISTING_QUOTE_PAIRS = {
    [SupportedChain.Ethereum]: ["BTC/USD", "ETH/USD", "ETH/BTC", "BTC/ETH"],
    [SupportedChain.Base]: ["BTC/USD", "ETH/USD", "EUR/USD"],
    [SupportedChain.Sepolia]: ['BTC/USD', 'BTC/ETH']
}

export const CHAINS_WITH_CHAINLINK_FEED_SUPPORT = typeSafeObjectKeys(EXISTING_QUOTE_PAIRS)
export type ChainsWithChainLinkFeedSupport = typeof CHAINS_WITH_CHAINLINK_FEED_SUPPORT[number]

export const ALLOWED_DENOMINATORS = ["BTC", "USD", "ETH"] as const
export type AllowedDenominatorsEnum = typeof ALLOWED_DENOMINATORS[number]

type IsExistBasePairResult = { found: true, isInverted: boolean } | { found:false } | undefined
export const isExistBasePair = (chainId: ChainsWithChainLinkFeedSupport, base: AllowedDenominatorsEnum, quote: AllowedDenominatorsEnum): IsExistBasePairResult => {
    invariant(CHAINS_WITH_CHAINLINK_FEED_SUPPORT.every(_chain => _chain !== chainId), "Chain does not support ChainLink proposals.")  

    const exactMatch = EXISTING_QUOTE_PAIRS[chainId].find(pair => pair === `${base}/${quote}`)
    if (exactMatch) {
        return {
            found: true,
            isInverted: false
        }
    }

    const invertedMatch = EXISTING_QUOTE_PAIRS[chainId as SupportedChain.Ethereum | SupportedChain.Base].find(pair => {
        return pair.includes(base) && pair.includes(quote)
    })
    if (!invertedMatch) {
        return {
            found: false
        }
    }

    return {
        found: true,
        isInverted: true
    }
}

type AllowedQuotes<T extends ChainsWithChainLinkFeedSupport> = typeof ENABLED_QUOTES[T][number]

type FeedRegistryChainEntry<T extends ChainsWithChainLinkFeedSupport> = {
    [tokenAddress: AddressString]: readonly AllowedQuotes<T>[]
}

type FeedRegistryType = {
    [T in ChainsWithChainLinkFeedSupport]: FeedRegistryChainEntry<T>
}

export const FEED_REGISTRY = {
    [SupportedChain.Ethereum]: {
        [LBTC[SupportedChain.Ethereum]]: ["BTC"],
        [WBTC[SupportedChain.Ethereum]]: ["BTC"],
        [solvBTC[SupportedChain.Ethereum]]: ["BTC"],
        [cbETH[SupportedChain.Ethereum]]: ["ETH"],
        [rETH[SupportedChain.Ethereum]]: ["ETH"],
        [stETH[SupportedChain.Ethereum]]: ["ETH", "USD"],
        [ezETH[SupportedChain.Ethereum]]: ["ETH"],
        [rsETH[SupportedChain.Ethereum]]: ["ETH"],
        [weETH[SupportedChain.Ethereum]]: ["ETH"],
        [DAI[SupportedChain.Ethereum]]: ["ETH", "USD"],
        [TUSD[SupportedChain.Ethereum]]: ["USD", "ETH"],
        [USDC[SupportedChain.Ethereum]]: ["ETH", "USD"],
        [USDT[SupportedChain.Ethereum]]: ["ETH", "USD"],
        [tBTC[SupportedChain.Ethereum]]: ["USD"],
        [cbBTC[SupportedChain.Ethereum]]: ["USD"],
        [wstETH[SupportedChain.Ethereum]]: ["USD"],
        [USD0[SupportedChain.Ethereum]]: ["USD"],
        [USDe[SupportedChain.Ethereum]]: ["USD"],
        [sUSDe[SupportedChain.Ethereum]]: ["USD"],
        [PYUSD[SupportedChain.Ethereum]]: ["USD"],
        // note: slight hack as WETH == ETH, so these are the same feeds
        //  as for ETH in EXISTING_QUOTE_PAIRS
        [WETH[SupportedChain.Ethereum]]: ["BTC", "USD", "ETH"],
    },
    [SupportedChain.Base]: {
        [LBTC[SupportedChain.Base]]: ["BTC"],
        [solvBTC[SupportedChain.Base]]: ["BTC"],
        [cbETH[SupportedChain.Base]]: ["ETH", "USD"],
        [rETH[SupportedChain.Base]]: ["ETH"],
        [wstETH[SupportedChain.Base]]: ["ETH"],
        [ezETH[SupportedChain.Base]]: ["ETH"],
        [weETH[SupportedChain.Base]]: ["ETH"],
        [DAI[SupportedChain.Base]]: ["USD"],
        [EURc[SupportedChain.Base]]: ["USD"],
        [GHO[SupportedChain.Base]]: ["USD"],
        [tBTC[SupportedChain.Base]]: ["USD"],
        [USDC[SupportedChain.Base]]: ["USD"],
        [USDS[SupportedChain.Base]]: ["USD"],
        [USDT[SupportedChain.Base]]: ["USD"],
        [USDe[SupportedChain.Base]]: ["USD"],
        [WBTC[SupportedChain.Base]]: ["USD"],
        [cbBTC[SupportedChain.Base]]: ["USD"],
        [sUSDe[SupportedChain.Base]]: ["USD"],
        // note: slight hack as WETH == ETH, so these are the same feeds
        //  as for ETH in EXISTING_QUOTE_PAIRS
        [WETH[SupportedChain.Base]]: ["USD", "ETH"]
    },
    [SupportedChain.Sepolia]: {
        [DAI[SupportedChain.Sepolia]]: ["USD"],
        [USDC[SupportedChain.Sepolia]]: ["USD"],
        // note: slight hack as WETH == ETH, so these are the same feeds
        //  as for ETH in EXISTING_QUOTE_PAIRS
        [WETH[SupportedChain.Sepolia]]: ["ETH", "BTC"]
    }
} as const satisfies FeedRegistryType

export const convertNameIntoDenominator = (name: AllowedDenominatorsEnum): AddressString => {
    const nameUppercase = name.toUpperCase() as AllowedDenominatorsEnum
    return {
        BTC: "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB" as AddressString,
        ETH: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" as AddressString, 
        EUR: "0x00000000000000000000000000000000000003d2" as AddressString,
        USD: "0x0000000000000000000000000000000000000348" as AddressString,
    }[nameUppercase]
}

export const getFeedData = (
    chainId: ChainsWithChainLinkFeedSupport, 
    base: AddressString, // collateral asset
    quote: AddressString, // credit asset
  ): { feedIntermediaryDenominations: AddressString[], feedInvertFlags: boolean[] } | null => {
    if (base === quote) {
      return null
    }
  
    const baseFeeds = FEED_REGISTRY?.[chainId]?.[base]
    const quoteFeeds = FEED_REGISTRY?.[chainId]?.[quote]
  
    if ((!baseFeeds?.length && base !== WETH[chainId]) || (!quoteFeeds?.length && quote !== WETH[chainId])) {
      return null
    }
  
    // check for 0 hop route if it's weth
    if (base === WETH[chainId]) {
      // we checking if exists ETH feed for quote
      const isExistDirectEthFeed = quoteFeeds.some(feed => feed === 'ETH')
      if (isExistDirectEthFeed) {
        if (isExistDirectEthFeed) {
          return {
            feedIntermediaryDenominations: [],
            feedInvertFlags: [false],
          }
        }
      }
    } else if (quote === WETH[chainId]) {
      // we checking if exists ETH feed for base
      const isExistDirectEthFeed = baseFeeds.some(feed => feed === 'ETH')
      if (isExistDirectEthFeed) {
        return {
          feedIntermediaryDenominations: [],
          feedInvertFlags: [true],
        }
      }
    }
  
    // Check for direct route (1-hop)
    const commonFeed = baseFeeds.find(_baseFeed => quoteFeeds.includes(_baseFeed))
    if (commonFeed) {
      return {
        feedIntermediaryDenominations: [convertNameIntoDenominator(commonFeed)],
        feedInvertFlags: [false, true],
      }
    }
  
      // check for 2-hop route
    for (const quoteFeed of quoteFeeds) {
      for (const baseFeed of baseFeeds) {
        const _isExistBasePair = isExistBasePair(chainId, quoteFeed, baseFeed)
        if (_isExistBasePair?.found) {
          return {
            feedIntermediaryDenominations: [convertNameIntoDenominator(quoteFeed), convertNameIntoDenominator(baseFeed)],
            feedInvertFlags: [false, _isExistBasePair.isInverted, true]
          }
        } 
      }
    }
  
    // TODO should we throw an error here?
    return null
  }
