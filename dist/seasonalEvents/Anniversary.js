"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Anniversary = void 0;
const lite_1 = require("firebase/firestore/lite");
const SeasonalEvent_1 = require("./SeasonalEvent");
const SignificantPackIDs_1 = require("../Constants/SignificantPackIDs");
const Packs_1 = require("../database/Packs");
const Anniversary_1 = require("../Constants/Anniversary");
exports.Anniversary = new SeasonalEvent_1.SeasonalEvent("Pigniversary", "Today, some years ago, Pig Dealer was first released to the world.", () => {
    const currentDate = lite_1.Timestamp.now().toDate();
    return currentDate.getUTCMonth() === 10 &&
        currentDate.getUTCDate() >= 24 && currentDate.getUTCDate() <= 30;
});
const ServersWith2PackFoilCooldown = {};
exports.Anniversary.PostChooseRandomPack = function (pack, serverInfo) {
    const replacementChance = Anniversary_1.FOIL_PACK_REPLACEMENT_CHANCE_PER_PACK[pack.ID] ?? 0;
    if (pack.ID == SignificantPackIDs_1.PACK_2 && ServersWith2PackFoilCooldown[serverInfo.ID] === true) {
        return;
    }
    if (Math.random() >= replacementChance) {
        return;
    }
    if (pack.ID == SignificantPackIDs_1.PACK_2) {
        ServersWith2PackFoilCooldown[serverInfo.ID] = true;
        setTimeout(() => {
            ServersWith2PackFoilCooldown[serverInfo.ID] = false;
        }, 1000 * 60 * 60 * 3);
    }
    const newPack = (0, Packs_1.GetPack)(SignificantPackIDs_1.FOIL_PACK);
    if (newPack === undefined) {
        return;
    }
    return newPack;
};
