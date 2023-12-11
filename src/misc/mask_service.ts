import { FExceptionArgument } from "@freemework/common";

export interface IMaskService {
	/**
	 * Mask URI to be safe to pass it into console, logger, etc.
	 * @param uri URI to be masked
	 * @returns Masked URI
	 */
	maskUri(uri: string): string

	/**
	 * Mask URI to be safe to pass it into console, logger, etc.
	 * @param uri URI to be masked
	 * @returns Masked URI
	 */
	maskUri(uri: URL): URL;
}

export class MaskService implements IMaskService {

	private readonly _lowLen: number;
	private readonly _highLen: number;
	private readonly _maskSymbol: string;

	/**
	 * Initializes a new instance of the MaskService class.
	 * @param lowLen Minimal chars to mask as one first and one last symbol
	 * @param highLen Minimal chars to mask as two first and two last symbol
	 * @param maskSymbol Mask symbol
	 */
	constructor(lowLen: number, highLen: number, maskSymbol: string = '*') {
		if (lowLen < 2) {
			throw new FExceptionArgument("Low length may not be lesser 2.", "lowLen");
		}
		if (highLen < 4) {
			throw new FExceptionArgument("High length may not be lesser 4.", "highLen");
		}
		if (lowLen > highLen) {
			throw new FExceptionArgument("High length should not be less than Low length.", "highLen");
		}
		if (maskSymbol.length != 1) {
			throw new FExceptionArgument("Mask symbol should be of length 1", "maskSymbol");
		}
		this._lowLen = lowLen;
		this._highLen = highLen;
		this._maskSymbol = maskSymbol;
	}

	public maskUri(uri: string): string;

	public maskUri(uri: URL): URL;

	public maskUri(uri: string | URL): string | URL {
		const friendlyUri: URL = uri instanceof URL ? uri : new URL(uri);

		const password = friendlyUri.password;
		if (password.length > 0) {
			const maskedPassword = this.maskSensitiveDataByAsterisk(password);
			const escapedMaskedPassword = escape(maskedPassword);

			const maskedUri: URL = new URL(friendlyUri);
			maskedUri.password = escapedMaskedPassword;
			if (uri instanceof URL) {
				return maskedUri;
			} else {
				return maskedUri.toString();
			}
		}

		return uri; // No password
	}

	private maskSensitiveDataByAsterisk(data: string): string {
		const len: number = data.length;
		const maskSymbol: string = this._maskSymbol;

		if (len == this._lowLen) {
			return `${data[0]}${this._maskSymbol.repeat(len - 1)}`;
		}
		if (len > this._lowLen && len < this._highLen) {
			return `${data[0]}${maskSymbol.repeat(len - 2)}${data[data.length - 1]}`;
		}
		if (len == this._highLen) {
			return `${data.substring(0, 2)}${maskSymbol.repeat(len - 3)}${data[data.length - 1]}`;
		}
		if (len >= this._highLen) {
			return `${data.substring(0, 2)}${maskSymbol.repeat(len - 4)}${data.substring(data.length - 2)}`;
		}
		return maskSymbol.repeat(len);

	}

	private static _lazyInstance: IMaskService | null = null;

	/**
	 * A default instance of IMaskService.
	 */
	public static get DEFAULT(): IMaskService {
		if (this._lazyInstance == null) {
			this._lazyInstance = new MaskService(7, 11);
		}
		return this._lazyInstance;
	}
}
