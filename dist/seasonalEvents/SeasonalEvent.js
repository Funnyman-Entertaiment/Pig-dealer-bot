"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeasonalEvent = void 0;
class SeasonalEvent {
    Name;
    Description;
    IsActive;
    PostPackOpened;
    PostAssembledPigs;
    PostChooseRandomPack;
    constructor(name, description, isActive) {
        this.Name = name;
        this.Description = description;
        this.IsActive = isActive;
        this.PostPackOpened = function () { };
        this.PostAssembledPigs = function () { };
        this.PostChooseRandomPack = function () { return undefined; };
    }
}
exports.SeasonalEvent = SeasonalEvent;
