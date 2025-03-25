import { SupportedChain } from "@pwndao/sdk-core";
import { VueQueryPlugin } from "@tanstack/vue-query";
import { mount } from "@vue/test-utils";
import { WagmiPlugin } from "@wagmi/vue";
import { useRevokeNonces } from "./use-revoke-nonces";

describe("useRevokeNonces", () => {
	afterEach(() => {
		vi.clearAllMocks();
	});

	it("should revoke nonces", () => {
		const wrapper = mount(
			{
				template: "<div></div>",
				setup() {
					return useRevokeNonces();
				},
			},
			{
				global: {
					plugins: [VueQueryPlugin, [WagmiPlugin, { config: {} }]],
				},
			},
		);

		expect(wrapper.vm.mutate).toBeInstanceOf(Function);

		(wrapper.vm as any).mutate({
			proposalNonces: [1n, 2n],
			chainId: SupportedChain.Sepolia,
		});

		expect(wrapper.vm).toBeDefined();
	});
});
