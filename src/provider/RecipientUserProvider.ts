import { CancellationToken, Logger } from "@zxteam/contract";
import { Initable } from "@zxteam/disposable";
import { Provides, Singleton } from "@zxteam/launcher";
import logger from "@zxteam/logger";

@Singleton
export abstract class RecipientUserProvider extends Initable {
	protected readonly log: Logger;

	public constructor() {
		super();
		this.log = logger.getLogger("RecipientUser");
		if (this.log.isDebugEnabled) {
			this.log.debug(`Implementation: ${this.constructor.name}`);
		}
	}

	// TBD
}

@Provides(RecipientUserProvider)
class RecipientUserProviderImpl extends RecipientUserProvider {
	public constructor() {
		super();
	}

	// TBD

	protected async onInit(cancellationToken: CancellationToken) {
		// nop
	}

	protected async onDispose() {
		// nop
	}
}
