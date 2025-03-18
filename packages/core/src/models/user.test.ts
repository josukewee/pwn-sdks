import { faker } from "@faker-js/faker";
import { SupportedChain } from "../chains.js";
import type { AddressString } from "../types.js";
import { User, UserWithNonceManager } from "./user.js";

describe("User model test", () => {
	it("Test user normally declared", () => {
		const addy = faker.finance.ethereumAddress() as AddressString;

		const user = new User(addy);

		expect(user.address).to.equal(addy);
	});
});

describe("UserWithNonceManager model test", () => {
	it("Test user normally declared", () => {
		const addy = faker.finance.ethereumAddress() as AddressString;

		const user = new User(addy);

		const userWithNonceManager = new UserWithNonceManager(user, {
			[SupportedChain.Ethereum]: [69n, 420n],
		});

		expect(
			userWithNonceManager.getNonceSpace(SupportedChain.Ethereum),
		).to.equal(420n);
		expect(userWithNonceManager.getNextNonce(SupportedChain.Ethereum)).to.equal(
			69n,
		);

		// Get used nonces
		expect(userWithNonceManager.getUsedNonces()).to.deep.equal({
			[SupportedChain.Ethereum]: 1n,
		});
	});
});
