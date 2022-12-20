"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsChristmas = void 0;
const lite_1 = require("firebase/firestore/lite");
function IsChristmas() {
    const currentDate = lite_1.Timestamp.now().toDate();
    return currentDate.getMonth() === 12 &&
        currentDate.getDay() >= 21 && currentDate.getDay() <= 25;
}
exports.IsChristmas = IsChristmas;
