"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChooseRandomElementFromList = void 0;
function ChooseRandomElementFromList(list) {
    return list[Math.floor(Math.random() * list.length)];
}
exports.ChooseRandomElementFromList = ChooseRandomElementFromList;
