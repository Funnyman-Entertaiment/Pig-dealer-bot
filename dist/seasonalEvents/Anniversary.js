"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Anniversary = void 0;
const lite_1 = require("firebase/firestore/lite");
const SeasonalEvent_1 = require("./SeasonalEvent");
const SignificantPackIDs_1 = require("../Constants/SignificantPackIDs");
const Packs_1 = require("../database/Packs");
exports.Anniversary = new SeasonalEvent_1.SeasonalEvent("Pigniversary", "Today, some years ago, Pig Dealer was first released to the world.", () => {
    const currentDate = lite_1.Timestamp.now().toDate();
    return currentDate.getUTCMonth() === 11 && currentDate.getUTCDate() === 27;
});
exports.Anniversary.PostChooseRandomPack = function (pack) {
    if (pack.ID !== SignificantPackIDs_1.PACK_2) {
        return;
    }
    if (Math.random() >= 0.05) {
        return;
    }
    const newPack = (0, Packs_1.GetPack)(SignificantPackIDs_1.FOIL_PACK);
    if (newPack === undefined) {
        return;
    }
    return newPack;
};
