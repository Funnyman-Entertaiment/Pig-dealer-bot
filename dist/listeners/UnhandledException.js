"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Log_1 = require("../Utils/Log");
exports.default = () => {
    process.on('unhandledRejection', error => {
        const e = error;
        (0, Log_1.LogError)(`${e.message}: ${e.url}`);
    });
};
