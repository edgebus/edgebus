
export interface AppInfo {
	readonly name: string;
	readonly version: string;
	readonly title: string;
}

const { name, title, version } = require("../../package.json");
const appInfo: AppInfo = Object.freeze({ name, title, version });

export default appInfo;
