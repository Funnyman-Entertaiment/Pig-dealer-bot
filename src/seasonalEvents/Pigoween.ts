import { Timestamp } from "firebase/firestore/lite";
import { SeasonalEvent } from "./SeasonalEvent";
import { GetPigsByRarity, PigRarity } from "../database/Pigs";
import { ChooseRandomElementFromList } from "../Utils/ExtraRandom";
import { PIGOWEEN_RARITY_PER_RARITY, PIGOWEEN_REPLACE_CHANCE_PER_RARITY } from "../Constants/Pigoween";

export const Pigoween = new SeasonalEvent(
	"Pigoween",
	"IT'S PIGOWEEN YOU FILTHY ANIMALS!!!\n\nTHAT'S RIGHT! October first marks the start if the Pigoween seasonal event! Shit's about to get real spooky around these parts! We are stoked to introduce 16 brand new pigs only available through this event which (obviously) lasts until the first of November. These pigs drop in 3 rarities: Common, Rare and Epic. They will rarely replace pigs of the same rarities in any pack!\n\nEnjoy Pigoween and collect all 16 before the time is up!",
	() => {
		const currentDate = Timestamp.now().toDate();

		return currentDate.getUTCMonth() === 9;
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