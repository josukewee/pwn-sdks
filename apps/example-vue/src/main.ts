import "./index.css";
import "./styles.less";
import { VueQueryPlugin } from "@tanstack/vue-query";
import { WagmiPlugin } from "@wagmi/vue";
import { createPinia } from "pinia";
import { http } from "viem";
import { createApp } from "vue";
import { createConfig } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import App from "./app/App.vue";
import router from "./router";

// Configure Wagmi
const config = createConfig({
	chains: [mainnet, sepolia],
	transports: {
		[mainnet.id]: http(),
		[sepolia.id]: http(),
	},
});

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(VueQueryPlugin);
app.use(WagmiPlugin, { config });

app.mount("#root");
