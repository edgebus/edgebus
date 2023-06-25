import { LabelApiIdentifier } from "../misc/api-identifier";

export namespace Label {

	export interface Id {
		readonly labelId: LabelApiIdentifier;
	}

	export interface Data {
		readonly value: string;
	}
	
	export interface Instance {
		readonly labelCreatedAt: Date;
		readonly labelDeletedAt: Date | null;
	}
	
}

export type Label
	= Label.Id
	& Label.Data
	& Label.Instance
	;
