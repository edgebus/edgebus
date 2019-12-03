export namespace Security {
	export interface Token {
		readonly kind: "TOKEN";
		readonly token: string;
	}
}

export type Security = Security.Token;
