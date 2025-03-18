import { getStrategy } from "@pwndao/v1-core";
import { VueQueryPlugin } from "@tanstack/vue-query";
import { mount } from "@vue/test-utils";
import { useStrategy } from "./use-strategy";

vi.mock("@pwndao/v1-core", () => ({
	getStrategy: vi.fn(),
}));

describe("useStrategy", () => {
	afterEach(() => {
		vi.clearAllMocks();
	});

	it("should be a function", () => {
		const wrapper = mount(
			{
				template: "<div></div>",
				setup() {
					return useStrategy("test");
				},
			},
			{
				global: {
					plugins: [VueQueryPlugin],
				},
			},
		);

		expect(useStrategy).toBeInstanceOf(Function);
		expect(wrapper.vm).toBeDefined();
		expect(getStrategy).toHaveBeenCalledWith("test");
	});
});
