import { Timestamp } from "firebase/firestore/lite";
import { SeasonalEvent } from "./SeasonalEvent";
import { GetPigsByRarity, PigRarity } from "../database/Pigs";
import { ChooseRandomElementFromList } from "../Utils/ExtraRandom";
import { PIGOWEEN_RARITY_PER_RARITY, PIGOWEEN_REPLACE_CHANCE_PER_RARITY } from "../Constants/Pigoween";

export const Pigoween = new SeasonalEvent(
	"Pigoween",
	"Muahahaha. It's Pigoween, so spooky.",
	() => {
		const currentDate = Timestamp.now().toDate();

		return currentDate.getUTCMonth() === 10;
	}
);

Pigoween.PostPackOpened = function (_pack, _serverInfo, chosenPigs, pigsToShow) {
	for (let i = chosenPigs.length-1; i > 0; i--) {
		const pig = chosenPigs[i];
		
		const replaceChance = PIGOWEEN_REPLACE_CHANCE_PER_RARITY[pig.Rarity] ?? 0;

		if(Math.random() < replaceChance) {
			const rarity = PIGOWEEN_RARITY_PER_RARITY[pig.Rarity];

			const pigoweenPigs = GetPigsByRarity(rarity as PigRarity);
			const chosenPig = ChooseRandomElementFromList(pigoweenPigs);

			chosenPigs.push(chosenPig);
			chosenPigs.splice(i, 1);

			const showIndex = pigsToShow.findIndex(x => x.ID == pig.ID);
			pigsToShow.push(chosenPig);
			pigsToShow.splice(showIndex, 1);

			break;
		}
	}
};