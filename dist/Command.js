"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Command = void 0;
class Command {
    name;
    description;
    requireServerInfo;
    requireUserInfo;
    slashCommand;
    response;
    constructor(name, description, requireServerInfo, requireUserInfo, slashCommand, response) {
        this.name = name;
        this.description = description;
        this.requireServerInfo = requireServerInfo;
        this.requireUserInfo = requireUserInfo;
        this.slashCommand = slashCommand;
        this.response = response;
    }
}
exports.Command = Command;
