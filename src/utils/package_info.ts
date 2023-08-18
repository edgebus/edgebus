
export interface PackageInfo {
	readonly name: string;
	readonly version: string;
}

const { name, version } = require("../../package.json");
const packageInfo: PackageInfo = Object.freeze({ name, version });

export default packageInfo;
