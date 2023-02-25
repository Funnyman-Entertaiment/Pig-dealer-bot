import { Timestamp } from "firebase/firestore/lite";
import { SeasonalEvent } from "./SeasonalEvent";
import { Cooldowns } from "../Constants/Variables";
import { EGG_PACK, PACK_2 } from "../Constants/SignificantPackIDs";
import { GetPack } from "src/database/Packs";

function GetFirstMondayOfMonth(): number {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const dayOfWeek = firstDayOfMonth.getDay();
    const daysUntilMonday = (dayOfWeek === 0) ? 1 : (8 - dayOfWeek);
    const firstMonday = new Date(today.getFullYear(), today.getMonth(), daysUntilMonday);
    return firstMonday.getUTCDay();
}

export const Easter = new SeasonalEvent(() => {
    const currentDate = Timestamp.now().toDate();

    if(currentDate.getUTCMonth() !== 3){ return false; }

    const firstMonday = GetFirstMondayOfMonth()
    const lastDay = firstMonday + 7;

    return currentDate.getUTCDay() >= firstMonday && currentDate.getUTCDate() <= lastDay;
});

let packsUntilEasterEgg = 0;

Easter.PostChooseRandomPack = function(pack) {
    if(pack.ID !== PACK_2){ return; }

    if(packsUntilEasterEgg > 0){
        packsUntilEasterEgg--;
        return;
    }

    const newPack = GetPack(EGG_PACK);

    if(newPack === undefined){ return; }

    return newPack;
}

setInterval(() => {
    const maxPackNum = Math.floor(Cooldowns.MINUTES_BETWEEN_EGG_PACKS / Cooldowns.MINUTES_BETWEEN_PACKS)-2
    packsUntilEasterEgg = Math.floor(Math.random() * maxPackNum)
}, 1000 * 60 * Cooldowns.MINUTES_BETWEEN_EGG_PACKS)