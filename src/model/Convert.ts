export namespace Converter {
	export const enum Kind {
		JavaScript = "javascript"
	}

	export interface JavaScript {
		readonly kind: Kind.JavaScript;
		readonly code: string;
	}
}

export type Converter = Converter.JavaScript;
