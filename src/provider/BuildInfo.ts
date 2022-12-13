import { FEnsure, FExceptionInvalidOperation } from "@freemework/common";

import { Provides, Singleton } from "typescript-ioc";

@Singleton
export abstract class BuildInfo {
	public readonly title: string;
	public readonly description: string;
	// public readonly company: string;
	// public readonly copyright: string;
	// public readonly product: string;
	public readonly version: string;
	// public readonly contributors: ReadonlyArray<string>;
	// public readonly repositoryUrl: URL;
	// public readonly repositoryReference: string;
	// public readonly repositoryCommit: string;
	// public readonly buildConfiguration: string;
	// public readonly buildLogUrl: URL;
	// public readonly buildDate: Date;

	public constructor(buildInfoLike: BuildInfo) {
		if (this.constructor === BuildInfo) {
			throw new FExceptionInvalidOperation(`Cannot create an instance of abstract class: ${this.constructor.name}`);
		}

		this.title = buildInfoLike.title;
		this.description = buildInfoLike.description;
		// this.company = buildInfoLike.company;
		// this.copyright = buildInfoLike.copyright;
		// this.product = buildInfoLike.product;
		this.version = buildInfoLike.version;
		// this.contributors = buildInfoLike.contributors;
		// this.repositoryUrl = buildInfoLike.repositoryUrl;
		// this.repositoryReference = buildInfoLike.repositoryReference;
		// this.repositoryCommit = buildInfoLike.repositoryCommit;
		// this.buildConfiguration = buildInfoLike.buildConfiguration;
		// this.buildLogUrl = buildInfoLike.buildLogUrl;
		// this.buildDate = buildInfoLike.buildDate;
	}
}

@Provides(BuildInfo)
class BuildInfoImpl extends BuildInfo {
	public constructor() {
		super(BuildInfoImpl._fromPackageJson());
	}

	private static _fromPackageJson(): BuildInfo {
		const { version, title, description, author, contributors, copyright, product, build } = require("../../package.json");

		const ensure: FEnsure = FEnsure.create();

		// const buildRaw: any = ensure.defined(build, "Incorrect 'build' field.");

		const buildInfo: BuildInfo = {
			title: ensure.string(title, "Incorrect 'title' field."),
			description: ensure.string(description, "Incorrect 'description' field."),
			// company: ensure.string(author, "Incorrect 'author' field."),
			// copyright: ensure.string(copyright, "Incorrect 'copyright' field."),
			// product: ensure.string(product, "Incorrect 'product' field."),
			version: ensure.string(version, "Incorrect 'version' field."),
			// contributors: ensure.array(contributors, "Incorrect 'contributors' field.").map(contributor => ensure.string(contributor, "Bad contributor value.")),
			// repositoryUrl: new URL(ensure.string(buildRaw.repositoryUrl, "Incorrect 'repositoryUrl' field.")),
			// repositoryReference: ensure.string(buildRaw.repositoryReference, "Incorrect 'repositoryReference' field."),
			// repositoryCommit: ensure.string(buildRaw.repositoryCommit, "Incorrect 'repositoryCommit' field."),
			// buildConfiguration: ensure.string(buildRaw.buildConfiguration, "Incorrect 'buildConfiguration' field."),
			// buildLogUrl: new URL(ensure.string(buildRaw.buildLogUrl, "Incorrect 'buildLogUrl' field.")),
			// buildDate: new Date(ensure.string(buildRaw.buildDate, "Incorrect 'buildDate' field."))
		};

		return Object.freeze(buildInfo);
	}
}
