import { ArgumentError } from "@zxteam/errors";

import * as  crypto from "crypto";
import { promisify } from "util";

const pbkdf2Async = promisify(crypto.pbkdf2);

export class Encrypter {
	private readonly _key: Buffer;

	public constructor(key: Buffer | string) {
		if (key instanceof Buffer) {
			if (key.length !== 32) {
				throw new ArgumentError("key", "Wrong encryption key length. Expected exactly 32 bytes.");
			}
			this._key = key;
		} else {
			if (key.length !== 64) {
				throw new ArgumentError("key", "Wrong encryption key length. Expected HEX-string with length exactly 64 symbols.");
			}
			try {
				this._key = Buffer.from(key, "hex");
			} catch (e) {
				throw new ArgumentError("key", "Wrong encryption key. Expected hex-string with length exactly 64 symbols", e);
			}
		}
	}

	public decryptBinary(encryptedData: Uint8Array): Buffer {
		const iv: Uint8Array = encryptedData.slice(0, 16);
		const payload: Uint8Array = encryptedData.slice(16);
		const decipher = crypto.createDecipheriv("aes-256-cbc", this._key, iv);
		const decryptedData = Buffer.concat([decipher.update(payload), decipher.final()]);
		return decryptedData;
	}

	public decryptHex(encryptedHex: string): string {
		const encryptedData: Buffer = Buffer.from(encryptedHex, "hex");
		const decryptedData: Buffer = this.decryptBinary(encryptedData);
		return decryptedData.toString("utf8");
	}


	public encryptBinary(data: Buffer): Buffer {
		const iv: Buffer = crypto.randomBytes(16);
		const cipher = crypto.createCipheriv("aes-256-cbc", this._key, iv);
		const encrypted: Buffer = Buffer.concat([iv, cipher.update(data), cipher.final()]);
		return encrypted;
	}

	public encryptHex(text: string): string {
		return this.encryptBinary(Buffer.from(text, "utf8")).toString("hex");
	}
}


/**
 * Password-Based Key Derivation Function helper
 * https://en.wikipedia.org/wiki/PBKDF2
 */
export async function passwordDerivation(
	password: string, iterations: number = 10, keylen: number = 32, digest: string = "sha512"
): Promise<Buffer> {
	const salt: Buffer = new Buffer([0x22, 0x9d, 0xcf, 0xdd, 0x8d, 0xa1, 0x52, 0x0f]);
	const encriptionKey: Buffer = await pbkdf2Async(Buffer.from(password), salt, 10, 32, "sha512");
	return encriptionKey;
}
