import type { PublicClient } from 'viem';
import type { WalletClient } from 'viem';
import type { Address } from 'viem';
import type { Hex } from 'viem';
import { safeWaitForTransactionReceipt } from '@moleculexyz/wagmi-safe-wait-for-tx';
import { DEFAULT_SAFE_CONFIG, SAFE_ERROR_CODES, type SafeConfig, SafeSignatureError } from './types.js';
import { SafeMessageType } from './types.js';
import invariant from 'ts-invariant';

export class SafeService {
	private readonly config: Required<SafeConfig>;
	private readonly publicClient: PublicClient;
	private readonly walletClient: WalletClient;

	constructor(
		publicClient: PublicClient,
		walletClient: WalletClient,
		safeConfig?: Partial<SafeConfig>
	) {
		this.config = { ...DEFAULT_SAFE_CONFIG, ...safeConfig };
		this.publicClient = publicClient;
		this.walletClient = walletClient;
	}

	async isSafeAddress(address: Address): Promise<boolean> {
		try {
			const code = await this.publicClient.getBytecode({ address });
			return code !== undefined && code !== '0x';
		} catch {
			return false;
		}
	}

	async signTypedData(
		safeAddress: Address,
		domain: Record<string, unknown>,
		types: Record<string, Array<{ name: string; type: string }>>,
		message: Record<string, unknown>
	): Promise<Hex> {
		try {
			const signature = await this.walletClient.signTypedData({
				account: safeAddress,
				domain,
				types,
				primaryType: 'SafeMessage',
				message
			});
			return signature;
		} catch (error) {
			throw new SafeSignatureError(
				'Failed to sign typed data with Safe',
				SAFE_ERROR_CODES.EXECUTION_FAILURE,
				error as Error
			);
		}
	}

	async getMessageHash(
		safeAddress: Address,
		message: string | Record<string, unknown>,
		messageType: SafeMessageType
	): Promise<string> {
		try {
			if (messageType === SafeMessageType.TYPED_MESSAGE) {
				return await this.walletClient.signTypedData({
					account: safeAddress,
					domain: message as Record<string, unknown>,
					types: { SafeMessage: [] },
					primaryType: 'SafeMessage',
					message: {}
				});
			}
			return await this.walletClient.signMessage({
				account: safeAddress,
				message: message as string
			});
		} catch (error) {
			throw new SafeSignatureError(
				'Failed to get message hash',
				SAFE_ERROR_CODES.EXECUTION_FAILURE,
				error as Error
			);
		}
	}

	async waitForTransaction(hash: Hex): Promise<void> {
		const address = await this.walletClient?.account?.getAddress?.();
		invariant(address, 'Wallet client account is required');
		await safeWaitForTransactionReceipt(this.publicClient, {
			hash,
			address
		});
	}
}
