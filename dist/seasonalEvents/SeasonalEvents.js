"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RunPostChooseRandomPack = exports.RunPostAssembledPigs = exports.RunPostPackOpened = exports.GetActiveEvents = void 0;
const Anniversary_1 = require("./Anniversary");
const Chritmas_1 = require("./Chritmas");
const Easter_1 = require("./Easter");
const NewYears_1 = require("./NewYears");
const Pigoween_1 = require("./Pigoween");
const SaintPatricks_1 = require("./SaintPatricks");
const SeasonalEvents = [
    Chritmas_1.Christmas,
    NewYears_1.NewYears,
    Easter_1.Easter,
    SaintPatricks_1.SaintPatricks,
    Anniversary_1.Anniversary,
    Pigoween_1.Pigoween
];
function GetActiveEvents() {
    return SeasonalEvents.filter(x => x.IsActive());
}
exports.GetActiveEvents = GetActiveEvents;
function RunPostPackOpened(pack, serverInfo, chosenPigs, pigsToShow) {
    const activeEvents = GetActiveEvents();
    activeEvents.forEach(x => x.PostPackOpened(pack, serverInfo, chosenPigs, pigsToShow));
}
exports.RunPostPackOpened = RunPostPackOpened;
function RunPostAssembledPigs(pack, serverInfo, assembledPigs) {
    const activeEvents = GetActiveEvents();
    activeEvents.forEach(x => x.PostAssembledPigs(pack, serverInfo, assembledPigs));
}
exports.RunPostAssembledPigs = RunPostAssembledPigs;
function RunPostChooseRandomPack(pack) {
    let returnVal = undefined;
    const activeEvents = GetActiveEvents();
    activeEvents.forEach(x => {
        returnVal = x.PostChooseRandomPack(pack);
    });
    return returnVal;
}
exports.RunPostChooseRandomPack = RunPostChooseRandomPack;
