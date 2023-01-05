import { SaveAllServerInfo } from "../database/ServerInfo";
import { SaveAllUserInfo } from "../database/UserInfo";

export function SaveCachePeriodically(){
    setInterval(() => {
        SaveAllServerInfo();
        SaveAllUserInfo();
    }, 1000 * 60 * 60 * 12);
}