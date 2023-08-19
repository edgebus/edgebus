import { assert } from "chai";

describe("URL tests", function () {
	it("Encode/Decode URL password", async function () {
		const testPassword = "bla^bla^bla";
		
		const url = new URL("http://localhost:8080/test");
		url.password = testPassword;

		const urlPassword = url.password;
		// const urlPassword = decodeURIComponent(url.password);

		assert.strictEqual(urlPassword, testPassword);
	});

	it("Encode/Decode URL host", async function () {
		const testHost = "bla^bla^bla";
		
		const url = new URL("http://localhost:8080/test");
		url.hostname =  testHost;

		const urlHost = url.hostname;
		// const urlHost = decodeURIComponent(url.hostname);

		assert.strictEqual(urlHost, testHost);
	});
});
