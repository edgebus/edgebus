import { assert } from "chai";

import { EgressIdentifier } from "../../../src/model/identifiers";

describe("Model identifiers tests", function () {
	it("EgressApiIdentifier equality", async function () {
		const originalFirst: EgressIdentifier = EgressIdentifier.generate();
		const originalSecond: EgressIdentifier = EgressIdentifier.generate();

		assert.notStrictEqual(originalFirst, originalSecond);
	});

	it("EgressApiIdentifier equality", async function () {
		const original: EgressIdentifier = EgressIdentifier.generate();

		const originalUuid: string = original.uuid;
		const originalRestored: EgressIdentifier = EgressIdentifier.fromUuid(originalUuid);

		assert.strictEqual(original, originalRestored);
	});

	it("EgressApiIdentifier equality", async function () {
		const original: EgressIdentifier = EgressIdentifier.generate();

		const originalId: string = original.value;
		const originalRestored: EgressIdentifier = EgressIdentifier.parse(originalId);

		assert.strictEqual(original, originalRestored);
	});

	it("EgressApiIdentifier equality", async function () {
		const one: EgressIdentifier = EgressIdentifier.fromUuid("4a208671-b0b3-4a08-8c65-af2943693c93");
		const two: EgressIdentifier = EgressIdentifier.fromUuid("4a208671-b0b3-4a08-8c65-af2943693c93");

		assert.strictEqual(one, two);
	});
});
