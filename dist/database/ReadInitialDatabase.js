"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReadPigsAndPacks = void 0;
const lite_1 = require("firebase/firestore/lite");
const Bot_1 = require("src/Bot");
const Pigs_1 = require("./Pigs");
const Packs_1 = require("./Packs");
async function ReadPigs() {
    const pigQuery = (0, lite_1.query)((0, lite_1.collection)(Bot_1.db, "pigs"));
    const pigs = await (0, lite_1.getDocs)(pigQuery);
    pigs.forEach(pig => {
        const pigObject = (0, Pigs_1.CreatePigFromData)(pig.id, pig.data());
        (0, Pigs_1.AddPig)(pigObject);
    });
}
async function ReadPacks() {
    const packQuery = (0, lite_1.query)((0, lite_1.collection)(Bot_1.db, "packs"));
    const packs = await (0, lite_1.getDocs)(packQuery);
    packs.forEach(pack => {
        const packData = (0, Packs_1.CreatePackFromData)(pack.id, pack.data());
        (0, Packs_1.AddPack)(packData);
    });
}
function ReadPigsAndPacks() {
    ReadPigs();
    ReadPacks();
}
exports.ReadPigsAndPacks = ReadPigsAndPacks;
