import { Timestamp } from "firebase/firestore/lite";
import { CachedMessageInfosPerServer } from "../database/MessageInfo";

export function RemoveOldMessagesFromCache(){
    setInterval(() => {
        const currentTime = Timestamp.now();
        for (const serverID in CachedMessageInfosPerServer) {
            const messages = CachedMessageInfosPerServer[serverID];
            CachedMessageInfosPerServer[serverID] = messages.filter(msg => currentTime.seconds - msg.TimeSent.seconds <= 60 * 60 * 3);
        }
    }, 1000 * 60 * 10);
}