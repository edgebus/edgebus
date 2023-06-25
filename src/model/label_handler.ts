import { FException } from "@freemework/common";
import { LabelHandlerApiIdentifier, TopicApiIdentifier } from "../misc/api-identifier";

export namespace LabelHandler {

	export const enum Kind {
		ExternalProcess = "EXTERNAL_PROCESS"
	}

	export interface Id {
		readonly labelHandlerId: LabelHandlerApiIdentifier;
	}

	export interface Base {
		readonly topicId: TopicApiIdentifier;
	}

	export interface ExternalProcess extends LabelHandler.Base {
		readonly labelHandlerKind: LabelHandler.Kind.ExternalProcess;
		readonly externalProcessPath: string;
	}

	export type Data = ExternalProcess;

	export interface Instance {
		readonly labelHandlerCreatedAt: Date;
		readonly labelHandlerDeletedAt: Date | null;
	}

}

export type LabelHandler
	= LabelHandler.Id
	& LabelHandler.Data
	& LabelHandler.Instance
	;

export function ensureLabelHandlerKind(kind: string): asserts kind is LabelHandler.Kind {
	const friendlyKind: LabelHandler.Kind = kind as LabelHandler.Kind;
	switch (friendlyKind) {
		case LabelHandler.Kind.ExternalProcess:
			return;
		default:
			throw new UnreachableLabelHandlerKindException(friendlyKind);
	}
}

class UnreachableLabelHandlerKindException extends FException {
	public constructor(kind: never) {
		super(`Wrong label handler kind value '${kind}'`);
	}
}
