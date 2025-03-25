import { getFeedData } from './create-chain-link-proposal.js';
import { SupportedChain, type AddressString, generateAddress } from '@pwndao/sdk-core';
import { type AllowedDenominatorsEnum, ChainsWithChainLinkFeedSupport, FEED_REGISTRY, WETH, convertNameIntoDenominator, ezETH, stETH, tBTC, weETH } from '../constants.js';
import { LBTC, PYUSD, USDC, DAI, WBTC, USDT } from '../constants.js';

describe('getFeedData', () => {
  const testFeedData = (
    _name: string,
    chainId: SupportedChain,
    collateral: string,
    credit: string,
    expectedDenominations: string[],
    expectedInvertFlags: boolean[]
  ) => {
    const result = getFeedData(
      chainId as ChainsWithChainLinkFeedSupport,
      collateral as AddressString,
      credit as AddressString
    );

    expect(result).toBeDefined();
    expect(result?.feedIntermediaryDenominations).toHaveLength(expectedDenominations.length);
    expect(result?.feedInvertFlags).toHaveLength(expectedInvertFlags.length);
    
    expectedDenominations.forEach((denom, index) => {
      expect(result?.feedIntermediaryDenominations[index]).toBe(
        convertNameIntoDenominator(denom as AllowedDenominatorsEnum)
      );
    });

    expectedInvertFlags.forEach((flag, index) => {
      expect(result?.feedInvertFlags[index]).toBe(flag);
    });
  };

  describe('0 hops', () => {
    it.each([
      [
        'USDC->ETH==WETH',
        SupportedChain.Ethereum,
        WETH[SupportedChain.Ethereum],
        USDC[SupportedChain.Ethereum],
        [],
        [false]
      ],
      [
        'WETH==ETH->USDC',
        SupportedChain.Ethereum,
        USDC[SupportedChain.Ethereum],
        WETH[SupportedChain.Ethereum],
        [],
        [true]
      ],
    ])('%s route', testFeedData)
  })

  describe('1 hop', () => {
    it.each([
      [
        'DAI->ETH->weETH',
        SupportedChain.Ethereum,
        weETH[SupportedChain.Ethereum],
        DAI[SupportedChain.Ethereum],
        ['ETH'],
        [false, true]
      ],

      [
        'tBTC->USD->ETH==WETH',
        SupportedChain.Ethereum,
        WETH[SupportedChain.Ethereum],
        tBTC[SupportedChain.Ethereum],
        ['USD'],
        [false, true]
      ],
      [
        'WETH==ETH->USD->tBTC',
        SupportedChain.Ethereum,
        tBTC[SupportedChain.Ethereum],
        WETH[SupportedChain.Ethereum],
        ['USD'],
        [false, true]
      ],
      [
        'WBTC->BTC->WETH==ETH',
        SupportedChain.Ethereum,
        WETH[SupportedChain.Ethereum],
        WBTC[SupportedChain.Ethereum],
        ['BTC'],
        [false, true]
      ],
      [
        'PYUSD->USD->WETH==ETH',
        SupportedChain.Ethereum,
        WETH[SupportedChain.Ethereum],
        PYUSD[SupportedChain.Ethereum],
        ['USD'],
        [false, true]
      ],
      [
        'USDC->ETH->stETH',
        SupportedChain.Ethereum,
        stETH[SupportedChain.Ethereum],
        USDC[SupportedChain.Ethereum],
        ['ETH'],
        [false, true]
      ],
    ])('%s route', testFeedData)
  });

  describe('2-hop routes', () => {
    it.each([
      [
        'PYUSD->USD->BTC->LBTC',
        SupportedChain.Ethereum,
        LBTC[SupportedChain.Ethereum],
        PYUSD[SupportedChain.Ethereum],
        ['USD', 'BTC'],
        [false, true, true]
      ],
      [
        'LBTC->BTC->ETH->stETH',
        SupportedChain.Ethereum,
        stETH[SupportedChain.Ethereum],
        LBTC[SupportedChain.Ethereum],
        ['BTC', 'ETH'],
        [false, false, true]
      ],
      [
        'LBTC->BTC->ETH->USDC',
        SupportedChain.Ethereum,
        USDC[SupportedChain.Ethereum],
        LBTC[SupportedChain.Ethereum],
        ['BTC', 'ETH'],
        [false, false, true]
      ],
      [
        'WBTC->BTC->ETH->USDT',
        SupportedChain.Ethereum,
        USDT[SupportedChain.Ethereum],
        WBTC[SupportedChain.Ethereum],
        ['BTC', 'ETH'],
        [false, false, true]
      ],
      [
        'USDT->ETH->BTC->WBTC',
        SupportedChain.Ethereum,
        WBTC[SupportedChain.Ethereum],
        USDT[SupportedChain.Ethereum],
        ['ETH', 'BTC'],
        [false, false, true]
      ],
      [
        'LBTC->BTC->USD->ETH==WETH',
        SupportedChain.Base,
        WETH[SupportedChain.Base],
        LBTC[SupportedChain.Base],
        ['BTC', 'USD'],
        [false, false, true]
      ]
    ])('%s route', testFeedData)
  });

  describe('edge cases', () => {
    it.each([
      [
        'same asset feeds',
        SupportedChain.Ethereum,
        PYUSD[SupportedChain.Ethereum],
        PYUSD[SupportedChain.Ethereum]
      ],
      [
        'non-existent token',
        SupportedChain.Ethereum,
        generateAddress(),
        PYUSD[SupportedChain.Ethereum]
      ],
      [
        'unsupported chain token',
        SupportedChain.Ethereum,
        generateAddress(),
        PYUSD[SupportedChain.Ethereum]
      ],
      // TODO once we allow 3-hop routes OR eth/btc feed will appear on base,
      //  we should remove this test and instead check correct result
      [
        'too much hops than allowed',
        SupportedChain.Base,
        LBTC[SupportedChain.Base],
        ezETH[SupportedChain.Base]
      ]
    ])(
      'should return null for %s',
      (
        _name,
        chainId,
        collateral,
        credit
      ) => {
        const result = getFeedData(
          chainId as ChainsWithChainLinkFeedSupport,
          collateral as AddressString,
          credit as AddressString
        );
        
        expect(result).toBeNull();
      }
    );

    it('should handle undefined registry entries', () => {
      const originalRegistry = { ...FEED_REGISTRY };
      // @ts-expect-error - intentionally setting undefined for test
      FEED_REGISTRY[SupportedChain.Ethereum] = undefined;

      const result = getFeedData(
        SupportedChain.Ethereum,
        LBTC[SupportedChain.Ethereum] as AddressString,
        PYUSD[SupportedChain.Ethereum] as AddressString
      );
      
      expect(result).toBeNull();

      // Cleanup
      // @ts-expect-error - intentionally setting undefined for test
      FEED_REGISTRY[SupportedChain.Ethereum] = originalRegistry[SupportedChain.Ethereum];
    });

    it('should handle empty feed arrays', () => {
      const originalRegistry = { ...FEED_REGISTRY };
      // @ts-expect-error - intentionally setting empty arrays for test
      FEED_REGISTRY[SupportedChain.Ethereum] = {
        [LBTC[SupportedChain.Ethereum]]: [],
        [PYUSD[SupportedChain.Ethereum]]: []
      };

      const result = getFeedData(
        SupportedChain.Ethereum,
        LBTC[SupportedChain.Ethereum] as AddressString,
        PYUSD[SupportedChain.Ethereum] as AddressString
      );
      
      expect(result).toBeNull();

      // Cleanup
      // @ts-expect-error - intentionally setting empty arrays for test
      FEED_REGISTRY[SupportedChain.Ethereum] = originalRegistry[SupportedChain.Ethereum];
    });
  });
});