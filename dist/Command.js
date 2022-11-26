"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Command = void 0;
class Command {
    slashCommand;
    response;
    constructor(slashCommand, response) {
        this.slashCommand = slashCommand;
        this.response = response;
    }
}
exports.Command = Command;
