import { FEnsure, FExceptionInvalidOperation } from "@freemework/common";

import { Provides, Singleton } from "typescript-ioc";

@Singleton
export abstract class BuildInfo {
	public readonly name: string;
	public readonly description: string;
	public readonly company: string;
	// public readonly copyright: string;
	public readonly version: string;
	public readonly contributors: ReadonlyArray<string>;
	public readonly pipelineUrl: URL;
	public readonly projectUrl: URL;
	public readonly commitReference: string;
	public readonly commitDate: Date;
	public readonly buildConfiguration: string;

	public constructor(buildInfoLike: BuildInfo) {
		if (this.constructor === BuildInfo) {
			throw new FExceptionInvalidOperation(`Cannot create an instance of abstract class: ${this.constructor.name}`);
		}

		this.name = buildInfoLike.name;
		this.description = buildInfoLike.description;
		this.company = buildInfoLike.company;
		// this.copyright = buildInfoLike.copyright;
		this.version = buildInfoLike.version;
		this.contributors = buildInfoLike.contributors;
		this.projectUrl = buildInfoLike.projectUrl;
		this.pipelineUrl = buildInfoLike.pipelineUrl;
		this.commitReference = buildInfoLike.commitReference;
		this.commitDate = buildInfoLike.commitDate;
		this.buildConfiguration = buildInfoLike.buildConfiguration;
	}
}

@Provides(BuildInfo)
class BuildInfoImpl extends BuildInfo {
	public constructor() {
		super(BuildInfoImpl._fromPackageJson());
	}

	private static _fromPackageJson(): BuildInfo {
		const { version, name, description, author, contributors, copyright, product, build: buildRaw } = require("../../package.json");

		const ensure: FEnsure = FEnsure.create();

		const build: any = ensure.defined(buildRaw, "Incorrect 'build' field.");

		const buildInfo: BuildInfo = {
			name: ensure.string(name, "Incorrect 'name' field."),
			description: ensure.string(description, "Incorrect 'description' field."),
			company: ensure.string(author, "Incorrect 'author' field."),
			// copyright: ensure.string(copyright, "Incorrect 'copyright' field."),
			version: ensure.string(version, "Incorrect 'version' field."),
			contributors: ensure.array(contributors, "Incorrect 'contributors' field.").map(contributor => ensure.string(contributor, "Bad contributor value.")),
			projectUrl: new URL(ensure.string(build.project_url, "Incorrect 'build.project_url' field.")),
			pipelineUrl: new URL(ensure.string(build.pipeline_url, "Incorrect 'build.pipeline_url' field.")),
			commitReference: ensure.string(build.commit_reference, "Incorrect 'build.commit_reference' field."),
			commitDate: new Date(ensure.string(build.commit_timestamp, "Incorrect 'build.commit_timestamp' field.")),
			buildConfiguration: ensure.string(build.configuration, "Incorrect 'build.configuration' field."),
		};

		return Object.freeze(buildInfo);
	}
}
