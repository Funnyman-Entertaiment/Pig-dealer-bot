"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TriggerUniquePigEvent = exports.DoesPigIdHaveUniqueEvent = void 0;
const StockingPig_1 = require("./StockingPig");
const UniquePigEvents = [StockingPig_1.StockingPigEvent];
function DoesPigIdHaveUniqueEvent(pigId) {
    return UniquePigEvents.some(x => x.PigId === pigId);
}
exports.DoesPigIdHaveUniqueEvent = DoesPigIdHaveUniqueEvent;
function TriggerUniquePigEvent(pigId, interaction) {
    const event = UniquePigEvents.find(x => x.PigId === pigId);
    if (event !== undefined) {
        event.Response(interaction);
    }
}
exports.TriggerUniquePigEvent = TriggerUniquePigEvent;
