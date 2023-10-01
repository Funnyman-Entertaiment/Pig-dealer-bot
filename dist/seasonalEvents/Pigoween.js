"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pigoween = void 0;
const lite_1 = require("firebase/firestore/lite");
const SeasonalEvent_1 = require("./SeasonalEvent");
const Pigs_1 = require("../database/Pigs");
const ExtraRandom_1 = require("../Utils/ExtraRandom");
const Pigoween_1 = require("../Constants/Pigoween");
exports.Pigoween = new SeasonalEvent_1.SeasonalEvent("Pigoween", "Muahahaha. It's Pigoween, so spooky.", () => {
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
