import { FException } from "@freemework/common";

export interface PackageInfo {
	readonly name: string;
	readonly title: string;
	readonly version: string;
}

const { name, title, version } = require("../../package.json");
const packageInfo: PackageInfo = Object.freeze({
	get name() {
		if(name === undefined || typeof name !== "string") { throw new FException("Unable to read package name from package.json"); }
		return name;
	 },
	 get title() {
		if(title === undefined || typeof title !== "string") { throw new FException("Unable to read package title from package.json"); }
		return title;
	 },
	 get version() {
		if(version === undefined || typeof version !== "string") { throw new FException("Unable to read package version from package.json"); }
		return version;
	 },
});

export default packageInfo;
