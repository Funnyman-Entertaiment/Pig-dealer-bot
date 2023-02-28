"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Command = void 0;
class Command {
    name;
    description;
    slashCommand;
    response;
    constructor(name, description, slashCommand, response) {
        this.name = name;
        this.description = description;
        this.slashCommand = slashCommand;
        this.response = response;
    }
}
exports.Command = Command;
