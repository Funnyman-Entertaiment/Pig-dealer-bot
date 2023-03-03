"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SaintPatricks = void 0;
const lite_1 = require("firebase/firestore/lite");
const SeasonalEvent_1 = require("./SeasonalEvent");
const Pigs_1 = require("../database/Pigs");
const SignificantPigIDs_1 = require("../Constants/SignificantPigIDs");
exports.SaintPatricks = new SeasonalEvent_1.SeasonalEvent("Saint Pigtricks", "Irish famine", () => {
    const currentDate = lite_1.Timestamp.now().toDate();
    return currentDate.getUTCMonth() === 2 &&
        currentDate.getUTCDate() >= 17 && currentDate.getUTCDate() <= 18;
});
exports.SaintPatricks.PostPackOpened = function (_, serverInfo, chosenPigs, pigsToShow) {
    const currentDate = lite_1.Timestamp.now().toDate();
    const currentYear = currentDate.getUTCFullYear();
    if (serverInfo.YearsSpawnedLeprechaun.includes(currentYear)) {
        return;
    }
    const leprechaunPig = (0, Pigs_1.GetPig)(SignificantPigIDs_1.LEPRECHAUN_PIG);
    if (leprechaunPig === undefined) {
        return;
    }
    if (Math.random() < 0.1) {
        chosenPigs.push(leprechaunPig);
        pigsToShow.push(leprechaunPig);
        serverInfo.YearsSpawnedLeprechaun.push(currentYear);
    }
};
