"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pigoween = void 0;
const lite_1 = require("firebase/firestore/lite");
const SeasonalEvent_1 = require("./SeasonalEvent");
const Pigs_1 = require("../database/Pigs");
const ExtraRandom_1 = require("../Utils/ExtraRandom");
const Pigoween_1 = require("../Constants/Pigoween");
exports.Pigoween = new SeasonalEvent_1.SeasonalEvent("Pigoween", "IT'S PIGOWEEN YOU FILTHY ANIMALS!!!\n\nTHAT'S RIGHT! October first marks the start if the Pigoween seasonal event! Shit's about to get real spooky around these parts! We are stoked to introduce 16 brand new pigs only available through this event which (obviously) lasts until the first of November. These pigs drop in 3 rarities: Common, Rare and Epic. They will rarely replace pigs of the same rarities in any pack!\n\nEnjoy Pigoween and collect all 16 before the time is up!", () => {
    const currentDate = lite_1.Timestamp.now().toDate();
    return currentDate.getUTCMonth() === 9;
});
exports.Pigoween.PostPackOpened = function (_pack, _serverInfo, chosenPigs, pigsToShow) {
    for (let i = chosenPigs.length - 1; i > 0; i--) {
        const pig = chosenPigs[i];
        const replaceChance = Pigoween_1.PIGOWEEN_REPLACE_CHANCE_PER_RARITY[pig.Rarity] ?? 0;
        if (Math.random() < replaceChance) {
            const rarity = Pigoween_1.PIGOWEEN_RARITY_PER_RARITY[pig.Rarity];
            const pigoweenPigs = (0, Pigs_1.GetPigsByRarity)(rarity);
            const chosenPig = (0, ExtraRandom_1.ChooseRandomElementFromList)(pigoweenPigs);
            chosenPigs.push(chosenPig);
            chosenPigs.splice(i, 1);
            const showIndex = pigsToShow.findIndex(x => x.ID == pig.ID);
            pigsToShow.push(chosenPig);
            pigsToShow.splice(showIndex, 1);
            break;
        }
    }
};
