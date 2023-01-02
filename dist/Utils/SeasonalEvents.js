"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsNewYear = exports.GetNewYearsYear = exports.IsChristmas = void 0;
const lite_1 = require("firebase/firestore/lite");
function IsChristmas() {
    const currentDate = lite_1.Timestamp.now().toDate();
    return currentDate.getUTCMonth() === 11 &&
        currentDate.getUTCDate() >= 21 && currentDate.getUTCDate() <= 25;
}
exports.IsChristmas = IsChristmas;
function GetNewYearsYear() {
    const currentDate = lite_1.Timestamp.now().toDate();
    if (currentDate.getUTCMonth() === 0) {
        return currentDate.getUTCFullYear() - 1;
    }
    return currentDate.getUTCFullYear();
}
exports.GetNewYearsYear = GetNewYearsYear;
function IsNewYear() {
    const currentDate = lite_1.Timestamp.now().toDate();
    return (currentDate.getUTCMonth() === 11 && currentDate.getUTCDate() >= 30) ||
        (currentDate.getUTCMonth() === 0 && currentDate.getUTCDate() == 1);
}
exports.IsNewYear = IsNewYear;
