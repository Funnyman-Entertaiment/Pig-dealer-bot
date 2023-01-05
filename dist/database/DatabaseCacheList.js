"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseElementList = void 0;
const lite_1 = require("firebase/firestore/lite");
const MessageInfo_1 = require("./MessageInfo");
const Packs_1 = require("./Packs");
const Pigs_1 = require("./Pigs");
const ServerInfo_1 = require("./ServerInfo");
const UserInfo_1 = require("./UserInfo");
const Bot_1 = require("../Bot");
const MAX_CACHE_SIZE = 300;
function GetDocumentReference(element) {
    if (element instanceof Pigs_1.Pig) {
        return (0, lite_1.doc)(Bot_1.db, `pigs/${element.ID}`);
    }
    else if (element instanceof Packs_1.Pack) {
        return (0, lite_1.doc)(Bot_1.db, `packs/${element.ID}`);
    }
    else if (element instanceof ServerInfo_1.ServerInfo) {
        return (0, lite_1.doc)(Bot_1.db, `serverInfo/${element.ID}`);
    }
    else if (element instanceof UserInfo_1.UserInfo) {
        return (0, lite_1.doc)(Bot_1.db, `users/${element.ID}`);
    }
    else if (element instanceof MessageInfo_1.MessageInfo) {
        return (0, lite_1.doc)(Bot_1.db, `serverInfo/${element.ServerId}/messages/${element.ID}`);
    }
    return undefined;
}
class DatabaseElementList {
    Elements;
    constructor() {
        this.Elements = [];
    }
    async Add(element) {
        if (this.Get(element.ID) !== undefined) {
            return;
        }
        if (this.Elements.length >= MAX_CACHE_SIZE) {
            const firstElement = this.Elements.shift();
            if (firstElement !== undefined) {
                const document = GetDocumentReference(firstElement);
                if (document !== undefined) {
                    await (0, lite_1.setDoc)(document, firstElement.GetData());
                }
            }
        }
        this.Elements.push(element);
    }
    async SaveAll() {
        this.Elements.forEach(async (element) => {
            const document = GetDocumentReference(element);
            if (document !== undefined) {
                await (0, lite_1.setDoc)(document, element.GetData());
            }
        });
    }
    Get(id) {
        for (let i = 0; i < this.Elements.length; i++) {
            const element = this.Elements[i];
            if (element.ID === id) {
                this.Elements.splice(i, 1);
                this.Elements.push(element);
                return element;
            }
        }
        return undefined;
    }
    ForEach(callbackFn) {
        this.Elements.forEach(callbackFn);
    }
    Filter(filterFn) {
        const filteredElements = [];
        this.ForEach(elem => {
            if (filterFn(elem)) {
                filteredElements.push(elem);
            }
        });
        return filteredElements;
    }
}
exports.DatabaseElementList = DatabaseElementList;
