import { Timestamp } from "firebase/firestore/lite";
import { SeasonalEvent } from "./SeasonalEvent";
import { STOCKING_PACK } from "../Constants/SignificantPackIDs";
import { STOCKING_PIG } from "../Constants/SignificantPigIDs";
import { GetPig, GetPigsByRarity } from "../database/Pigs";
import { ChooseRandomElementFromList } from "../Utils/ExtraRandom";

export const Christmas = new SeasonalEvent(() => {
    const currentDate = Timestamp.now().toDate();

    return currentDate.getUTCMonth() === 11 &&
        currentDate.getUTCDate() >= 21 && currentDate.getUTCDate() <= 25;
});

Christmas.PostPackOpened = function(pack, _serverInfo, chosenPigs, pigsToShow){
    if (pack.ID === STOCKING_PACK) { return; }

    if (Math.random() < 0.05) {
        const stockingPig = GetPig(STOCKING_PIG);
        if (stockingPig !== undefined) { pigsToShow.push(stockingPig); }
    } else if (Math.random() < 0.1) {
        const christmasPigs = GetPigsByRarity("Christmas");
        const chosenChristmasPig = ChooseRandomElementFromList(christmasPigs);
        chosenPigs.push(chosenChristmasPig);
    }
}