import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import router from "../router";
import App from "./App.vue";

describe("App", () => {
	it("renders properly", () => {
		const wrapper = mount(App, { global: { plugins: [router] } });
		router.isReady();
		expect(wrapper.text()).toContain("PWN SDK Examples Strategies");
	});
});
