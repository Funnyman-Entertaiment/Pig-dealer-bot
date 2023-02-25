"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Christmas = void 0;
const lite_1 = require("firebase/firestore/lite");
const SeasonalEvent_1 = require("./SeasonalEvent");
const SignificantPackIDs_1 = require("../Constants/SignificantPackIDs");
const SignificantPigIDs_1 = require("../Constants/SignificantPigIDs");
const Pigs_1 = require("../database/Pigs");
const ExtraRandom_1 = require("../Utils/ExtraRandom");
exports.Christmas = new SeasonalEvent_1.SeasonalEvent("Pigsmas", "This is pigsmas", () => {
    const currentDate = lite_1.Timestamp.now().toDate();
    return currentDate.getUTCMonth() === 11 &&
        currentDate.getUTCDate() >= 21 && currentDate.getUTCDate() <= 25;
});
exports.Christmas.PostPackOpened = function (pack, _serverInfo, chosenPigs, pigsToShow) {
    if (pack.ID === SignificantPackIDs_1.STOCKING_PACK) {
        return;
    }
    if (Math.random() < 0.05) {
        const stockingPig = (0, Pigs_1.GetPig)(SignificantPigIDs_1.STOCKING_PIG);
        if (stockingPig !== undefined) {
            pigsToShow.push(stockingPig);
        }
    }
    else if (Math.random() < 0.1) {
        const christmasPigs = (0, Pigs_1.GetPigsByRarity)("Christmas");
        const chosenChristmasPig = (0, ExtraRandom_1.ChooseRandomElementFromList)(christmasPigs);
        chosenPigs.push(chosenChristmasPig);
    }
};
