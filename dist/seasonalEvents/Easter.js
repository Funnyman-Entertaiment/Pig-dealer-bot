"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Easter = void 0;
const lite_1 = require("firebase/firestore/lite");
const SeasonalEvent_1 = require("./SeasonalEvent");
const Variables_1 = require("../Constants/Variables");
const SignificantPackIDs_1 = require("../Constants/SignificantPackIDs");
const Packs_1 = require("../database/Packs");
function GetFirstMondayOfMonth() {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const dayOfWeek = firstDayOfMonth.getDay();
    const daysUntilMonday = (dayOfWeek === 0) ? 1 : (8 - dayOfWeek);
    const firstMonday = new Date(today.getFullYear(), today.getMonth(), daysUntilMonday);
    return firstMonday.getUTCDay();
}
exports.Easter = new SeasonalEvent_1.SeasonalEvent("Pigster", "This is pigster, eat my balls", () => {
    const currentDate = lite_1.Timestamp.now().toDate();
    if (currentDate.getUTCMonth() !== 3) {
        return false;
    }
    const firstMonday = GetFirstMondayOfMonth();
    const lastDay = firstMonday + 7;
    return currentDate.getUTCDay() >= firstMonday && currentDate.getUTCDate() <= lastDay;
});
let packsUntilEasterEgg = 0;
exports.Easter.PostChooseRandomPack = function (pack) {
    if (pack.ID !== SignificantPackIDs_1.PACK_2) {
        return;
    }
    if (packsUntilEasterEgg < 0) {
        return;
    }
    packsUntilEasterEgg--;
    if (packsUntilEasterEgg > 0) {
        return;
    }
    const newPack = (0, Packs_1.GetPack)(SignificantPackIDs_1.EGG_PACK);
    if (newPack === undefined) {
        return;
    }
    return newPack;
};
setInterval(() => {
    const maxPackNum = Math.floor(Variables_1.Cooldowns.MINUTES_BETWEEN_EGG_PACKS / Variables_1.Cooldowns.MINUTES_BETWEEN_PACKS) - 2;
    packsUntilEasterEgg = Math.floor(Math.random() * maxPackNum);
}, 1000 * 60 * Variables_1.Cooldowns.MINUTES_BETWEEN_EGG_PACKS);
