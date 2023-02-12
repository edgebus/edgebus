import { FEnsure } from "@freemework/common";

import { BuildInfo } from "../../src/provider/BuildInfo";

const commitDate = new Date();

export abstract class DevelBuildInfo extends BuildInfo {
	public constructor() {
		super(DevelBuildInfo._fromPackageJson());
	}

	private static _fromPackageJson(): BuildInfo {
		const { version, name, description, author, contributors } = require("../../package.json");

		const ensure: FEnsure = FEnsure.create();

		const buildInfo: BuildInfo = {
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
