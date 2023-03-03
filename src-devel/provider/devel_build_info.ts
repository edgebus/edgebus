import { FEnsure } from "@freemework/common";

import { BuildInfoProvider } from "../../src/provider/build_info_provider";

const commitDate = new Date();

export abstract class DevelBuildInfoProvider extends BuildInfoProvider {
	public constructor() {
		super(DevelBuildInfoProvider._fromPackageJson());
	}

	private static _fromPackageJson(): BuildInfoProvider {
		const { version, name, description, author, contributors } = require("../../package.json");

		const ensure: FEnsure = FEnsure.create();

		const buildInfo: BuildInfoProvider = {
			name: ensure.string(name, "Incorrect 'name' field."),
			description: ensure.string(description, "Incorrect 'description' field."),
			company: ensure.string(author, "Incorrect 'author' field."),
			// copyright: ensure.string(copyright, "Incorrect 'copyright' field."),
			version: ensure.string(version, "Incorrect 'version' field."),
			contributors: ensure.array(contributors, "Incorrect 'contributors' field.").map(contributor => ensure.string(contributor, "Bad contributor value.")),
			projectUrl: new URL("http://localhost"),
			pipelineUrl: new URL("http://localhost"),
			commitReference: "workcopy",
			commitDate,
			buildConfiguration: "local",
		};

		return Object.freeze(buildInfo);
	}
}
