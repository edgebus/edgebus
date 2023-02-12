"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DevelBuildInfo = void 0;
const common_1 = require("@freemework/common");
const BuildInfo_1 = require("../../src/provider/BuildInfo");
const commitDate = new Date();
class DevelBuildInfo extends BuildInfo_1.BuildInfo {
    constructor() {
        super(DevelBuildInfo._fromPackageJson());
    }
    static _fromPackageJson() {
        const { version, name, description, author, contributors } = require("../../package.json");
        const ensure = common_1.FEnsure.create();
        const buildInfo = {
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
exports.DevelBuildInfo = DevelBuildInfo;
//# sourceMappingURL=DevelBuildInfo.js.map