import { Timestamp } from "firebase/firestore/lite";
import { SeasonalEvent } from "./SeasonalEvent";
import { FOIL_PACK, PACK_2 } from "../Constants/SignificantPackIDs";
import { GetPack } from "../database/Packs";
import { FOIL_PACK_REPLACEMENT_CHANCE_PER_PACK } from "../Constants/Anniversary";

export const Anniversary = new SeasonalEvent(
	"Pigniversary",
	"Today, some years ago, Pig Dealer was first released to the world.",
	() => {
		const currentDate = Timestamp.now().toDate();

		return currentDate.getUTCMonth() === 10 &&
			currentDate.getUTCDate() >= 24 && currentDate.getUTCDate() <= 30;
	}
);

const ServersWith2PackFoilCooldown: { [key: string]: boolean } = {};

Anniversary.PostChooseRandomPack = function (pack, serverInfo) {
	const replacementChance = FOIL_PACK_REPLACEMENT_CHANCE_PER_PACK[pack.ID] ?? 0;

	if (pack.ID == PACK_2 && ServersWith2PackFoilCooldown[serverInfo.ID] === true) {
		return;
	}

	if (Math.random() >= replacementChance) { return; }

	if (pack.ID == PACK_2) {
		ServersWith2PackFoilCooldown[serverInfo.ID] = true;
		setTimeout(() => {
			ServersWith2PackFoilCooldown[serverInfo.ID] = false;
		}, 1000 * 60 * 60 * 3);
	}

	const newPack = GetPack(FOIL_PACK);

	if (newPack === undefined) { return; }

	return newPack;
};