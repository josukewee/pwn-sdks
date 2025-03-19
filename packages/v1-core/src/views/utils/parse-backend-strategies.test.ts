import { describe, test, vi } from "vitest";
import { parseBackendStrategiesResponse } from "./parse-backend-strategies.js";
import thesisData from "./thesis-data.json";

describe("Parse Backend strategies reponse test", () => {
	test("Succesfully parse elastic proposal schema", () => {
		const parsedData = parseBackendStrategiesResponse(thesisData);

		expect(parsedData).toBeDefined();
		expect(parsedData.id).toEqual("23");
		expect(parsedData.name).toEqual("GNO backed loans ");
		expect(parsedData.description).toEqual(
			"Provide GNO utility by creating a a high LTV market for borrowing other assets\t\t\t\t\t",
		);

		expect(parsedData.terms.apr).toBeDefined();
		expect(parsedData.terms.ltv).toBeDefined();
		expect(parsedData.terms.creditAssets).toBeDefined();
		expect(parsedData.terms.collateralAssets).toBeDefined();
		expect(parsedData.terms.durationDays).toEqual(90);
		expect(parsedData.terms.expirationDays).toEqual(30);
		expect(parsedData.terms.minCreditAmountPercentage).toEqual(10); // 0.01 * 1e4

		expect(parsedData.terms.collateralAssets.length).toEqual(1);
		expect(parsedData.terms.collateralAssets[0].address).toEqual(
			"0x9C58BAcC331c9aa871AFD802DB6379a98e80CEdb",
		);
		expect(parsedData.terms.collateralAssets[0].chainId).toEqual(100);
		expect(parsedData.terms.collateralAssets[0].decimals).toEqual(18);

		expect(parsedData.terms.creditAssets.length).toEqual(4);

		expect(parsedData.terms.creditAssets[0].address).toEqual(
			"0x6C76971f98945AE98dD7d4DFcA8711ebea946eA6",
		);
		expect(parsedData.terms.creditAssets[0].chainId).toEqual(100);
		expect(parsedData.terms.creditAssets[0].decimals).toEqual(18);

		expect(parsedData.terms.ltv).toEqual({
			"0x9C58BAcC331c9aa871AFD802DB6379a98e80CEdb/100-0x23e4E76D01B2002BE436CE8d6044b0aA2f68B68a/100": 75,
			"0x9C58BAcC331c9aa871AFD802DB6379a98e80CEdb/100-0x6C76971f98945AE98dD7d4DFcA8711ebea946eA6/100": 75,
			"0x9C58BAcC331c9aa871AFD802DB6379a98e80CEdb/100-0x6A023CCd1ff6F2045C3309768eAd9E68F978f6e1/100": 75,
			"0x9C58BAcC331c9aa871AFD802DB6379a98e80CEdb/100-0xa818F1B57c201E092C4A2017A91815034326Efd1/100": 75,
		});

		expect(parsedData.terms.apr).toEqual({
			"0x9C58BAcC331c9aa871AFD802DB6379a98e80CEdb/100-0x23e4E76D01B2002BE436CE8d6044b0aA2f68B68a/100": 1,
			"0x9C58BAcC331c9aa871AFD802DB6379a98e80CEdb/100-0x6C76971f98945AE98dD7d4DFcA8711ebea946eA6/100": 1,
			"0x9C58BAcC331c9aa871AFD802DB6379a98e80CEdb/100-0x6A023CCd1ff6F2045C3309768eAd9E68F978f6e1/100": 1,
			"0x9C58BAcC331c9aa871AFD802DB6379a98e80CEdb/100-0xa818F1B57c201E092C4A2017A91815034326Efd1/100": 1,
		});

		expect(parsedData.lendingStats).toBeDefined();
		expect(parsedData.lendingStats.totalCommittedAmount).toEqual(
			45242475438495092665n,
		);
		expect(parsedData.lendingStats.totalUtilizedAmount).toEqual(
			25247661364433600466n,
		);
		expect(parsedData.lendingStats.totalAvailableAmount).toEqual(
			19994814074061492199n,
		);

		expect(parsedData.borrowingStats).toBeDefined();
		expect(parsedData.borrowingStats.totalBorrowedAmount).toEqual(0n);
		expect(parsedData.borrowingStats.totalRepaidAmount).toEqual(0n);
		expect(parsedData.borrowingStats.totalDefaultedAmount).toEqual(0n);
		expect(parsedData.borrowingStats.activeBorrowedAmount).toEqual(0n);
	});
});
