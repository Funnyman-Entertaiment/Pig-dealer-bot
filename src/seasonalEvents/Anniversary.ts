import { Timestamp } from "firebase/firestore/lite";
import { SeasonalEvent } from "./SeasonalEvent";
import { FOIL_PACK, PACK_2 } from "src/Constants/SignificantPackIDs";
import { GetPack } from "src/database/Packs";

export const Anniversary = new SeasonalEvent(
    "Pigniversary",
    "Today, some years ago, Pig Dealer was first released to the world.",
    () => {
        const currentDate = Timestamp.now().toDate();

        return currentDate.getUTCMonth() === 11 && currentDate.getUTCDate() === 27;
    }
)

Anniversary.PostChooseRandomPack = function (pack) {
    if (pack.ID !== PACK_2) { return; }

    if (Math.random() >= 0.05) { return; }

    const newPack = GetPack(FOIL_PACK);

    if (newPack === undefined) { return; }

    return newPack;
}