import { LabelIdentifier } from "../model";

export namespace Label {

	export interface Id {
		readonly labelId: LabelIdentifier;
	}

	export interface Data {
		readonly labelValue: string;
	}

	export interface Instance {
		readonly labelCreatedAt: Date;
		readonly labelDeletedAt: Date | null;
	}
}

export type Label =
	& Label.Id
	& Label.Data
	& Label.Instance
	;
