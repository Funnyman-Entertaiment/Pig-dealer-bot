"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewYears = void 0;
const lite_1 = require("firebase/firestore/lite");
const SeasonalEvent_1 = require("./SeasonalEvent");
const Pigs_1 = require("../database/Pigs");
const SignificantPigIDs_1 = require("../Constants/SignificantPigIDs");
function GetNewYearsYear() {
    const currentDate = lite_1.Timestamp.now().toDate();
    if (currentDate.getUTCMonth() === 0) {
        return currentDate.getUTCFullYear() - 1;
    }
    return currentDate.getUTCFullYear();
}
exports.NewYears = new SeasonalEvent_1.SeasonalEvent("Pig's New Year", "Party", () => {
    const currentDate = lite_1.Timestamp.now().toDate();
    return (currentDate.getUTCMonth() === 11 && currentDate.getUTCDate() >= 30) ||
        (currentDate.getUTCMonth() === 0 && currentDate.getUTCDate() == 1);
});
exports.NewYears.PostPackOpened = function (_pack, serverInfo, chosenPigs) {
    const currentYear = GetNewYearsYear();
    if (!serverInfo.YearsSpawnedAllNewYearDeco.includes(currentYear) && Math.random() < 0.1) {
        const newYearPigs = (0, Pigs_1.GetPigsByRarity)("New Year");
        const chosenNewYearPigs = newYearPigs[Math.floor(Math.random() * newYearPigs.length)];
        chosenPigs.push(chosenNewYearPigs);
    }
};
exports.NewYears.PostAssembledPigs = function (_pack, serverInfo, assembledPigs) {
    if (!assembledPigs.some(pig => pig.ID === SignificantPigIDs_1.ASSEMBLY_NEW_YEAR_PIG)) {
        return;
    }
    const currentYear = GetNewYearsYear();
    serverInfo.YearsSpawnedAllNewYearDeco.push(currentYear);
};
