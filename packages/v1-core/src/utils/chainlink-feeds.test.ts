import { describe, it, expect } from 'vitest'
import { SupportedChain } from "@pwndao/sdk-core"
import { getFeedData, isExistBasePair, FEED_REGISTRY } from './chainlink-feeds.js'
import { DAI, USDC, WETH, WBTC, stETH } from "../addresses.js"

describe('Chainlink Feeds Utils', () => {

  const chains = {
    ethereum: SupportedChain.Ethereum as const,
    sepolia: SupportedChain.Sepolia as const
  };
  
  const tokens = {
    ethereum: {
      dai: DAI[chains.ethereum],
      usdc: USDC[chains.ethereum],
      weth: WETH[chains.ethereum],
      wbtc: WBTC[chains.ethereum],
      steth: stETH[chains.ethereum]
    },
    sepolia: {
      dai: DAI[chains.sepolia],
      usdc: USDC[chains.sepolia],
      wbtc: WBTC[chains.sepolia]
    }
  };
  
  const unsupportedAddress = '0x1234567890123456789012345678901234567890';

  describe('isExistBasePair', () => {
    it('should return correct result for existing inverted pair', () => {
      const result = isExistBasePair(chains.ethereum, 'USD', 'ETH')
      expect(result).toEqual({ found: true, isInverted: true })
    })

    it('should return false for non-existing pair', () => {
      const result = isExistBasePair(chains.sepolia, 'USD', 'EUR')
      expect(result).toEqual({ found: false })
    })
  })

  describe('getFeedData', () => {
    describe('Same token cases', () => {
      it('should return null when base and quote are the same', () => {
        const result = getFeedData(
          chains.ethereum,
          tokens.ethereum.dai,
          tokens.ethereum.dai
        )
        expect(result).toBeNull()
      })
    })

    describe('WETH cases', () => {
      it('should handle direct WETH/USDC pair correctly in both directions', () => {
        let result = getFeedData(
          chains.ethereum,
          tokens.ethereum.weth,
          tokens.ethereum.usdc
        )
        expect(result).toEqual({
          feedIntermediaryDenominations: [],
          feedInvertFlags: [false]
        })

        result = getFeedData(
          chains.ethereum,
          tokens.ethereum.usdc,
          tokens.ethereum.weth
        )
        expect(result).toEqual({
          feedIntermediaryDenominations: [],
          feedInvertFlags: [true]
        })
      })
    })

    describe('One-hop routes', () => {
      it('should find route through common denominator (USD)', () => {
        const result = getFeedData(
          chains.ethereum,
          tokens.ethereum.dai,
          tokens.ethereum.usdc
        )
        expect(result).toBeTruthy()
        expect(result?.feedIntermediaryDenominations.length).toBe(1)
        expect(result?.feedInvertFlags).toEqual([false, true])
      })
    })

    describe('Two-hop routes', () => {
      it('should find route through two intermediaries', () => {
        const result = getFeedData(
          chains.ethereum,
          tokens.ethereum.wbtc,
          tokens.ethereum.steth
        )
        expect(result).toBeTruthy()
        expect(result?.feedIntermediaryDenominations.length).toBe(2)
        expect(result?.feedInvertFlags.length).toBe(3)
      })
    })

    describe('Error cases', () => {
      it('should return null for unsupported token', () => {
        const result = getFeedData(
          chains.ethereum,
          unsupportedAddress as any,
          tokens.ethereum.usdc
        )
        expect(result).toBeNull()
      })

      it('should return null when no route exists', () => {
        const result = getFeedData(
          chains.sepolia,
          tokens.sepolia.dai,
          tokens.sepolia.wbtc
        )
        expect(result).toBeNull()
      })
    })
  })

  describe('FEED_REGISTRY validation', () => {
    it('should have valid token addresses for each chain', () => {
      const supportedChainIds = [1, 8453, 11155111]; // Ethereum, Base, Sepolia
      
      for (const chainId of supportedChainIds) {
        const registry = FEED_REGISTRY[chainId as keyof typeof FEED_REGISTRY];
        for (const tokenAddress of Object.keys(registry)) {
          expect(tokenAddress).toMatch(/^0x[a-fA-F0-9]{40}$/)
        }
      }
    })

    it('should have valid feed types for each token', () => {
      const supportedChainIds = [1, 8453, 11155111]; // Ethereum, Base, Sepolia
      
      for (const chainId of supportedChainIds) {
        const registry = FEED_REGISTRY[chainId as keyof typeof FEED_REGISTRY];
        for (const tokenFeeds of Object.values(registry)) {
          (tokenFeeds as readonly string[]).forEach(feed => {
            expect(['BTC', 'ETH', 'USD', 'EUR']).toContain(feed)
          })
        }
      }
    })
  })
})
