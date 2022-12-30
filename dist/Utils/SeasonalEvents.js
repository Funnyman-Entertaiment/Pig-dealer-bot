"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsChristmas = void 0;
const lite_1 = require("firebase/firestore/lite");
function IsChristmas() {
    const currentDate = lite_1.Timestamp.now().toDate();
    return currentDate.getUTCMonth() === 11 &&
        currentDate.getUTCDate() >= 21 && currentDate.getUTCDate() <= 25;
}
exports.IsChristmas = IsChristmas;
