import { defineConfig } from "@wagmi/cli";
import { foundry } from "@wagmi/cli/plugins";
import { actions } from "@wagmi/cli/plugins";
// eslint-disable-next-line @nx/enforce-module-boundaries
import deployments from "../../contracts/solidity/deployments/latest.json";

export default defineConfig({
	out: "src/generated.ts",
	plugins: [
		foundry({
			deployments: deployments.chains,
			project: "../../contracts/solidity",
		}),
		actions(),
	],
});
