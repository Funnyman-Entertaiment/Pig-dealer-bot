import { LogInfo } from "../Utils/Log";
import { SaveAllServerInfo } from "../database/ServerInfo";
import { SaveAllUserInfo } from "../database/UserInfo";

export function SaveCachePeriodically() {
	LogInfo("Saving caches");

	setInterval(() => {
		SaveAllServerInfo();
		SaveAllUserInfo();
	}, 1000 * 60 * 60 * 12);
}