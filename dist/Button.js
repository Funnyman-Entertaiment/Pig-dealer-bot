"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Button = void 0;
class Button {
    id;
    requireServerInfo;
    requireMessageInfo;
    requireUserInfo;
    response;
    constructor(id, requireServerInfo, requireMessageInfo, requireUserInfo, response) {
        this.id = id;
        this.requireServerInfo = requireServerInfo;
        this.requireMessageInfo = requireMessageInfo;
        this.requireUserInfo = requireUserInfo;
        this.response = response;
    }
}
exports.Button = Button;
