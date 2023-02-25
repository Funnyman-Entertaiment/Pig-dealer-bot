import { ServerInfo } from "../database/ServerInfo";
import { Pack } from "../database/Packs";
import { Pig } from "../database/Pigs";

export class SeasonalEvent {
    IsActive: () => Boolean;
    PostPackOpened: (pack: Pack, serverInfo: ServerInfo, chosenPigs: Pig[], pigsToShow: Pig[]) => void;
    PostAssembledPigs: (pack: Pack, serverInfo: ServerInfo, assembledPigs: Pig[]) => void;
    PostChooseRandomPack: (pack: Pack) => Pack | undefined;

    constructor(isActive: () => Boolean) {
        this.IsActive = isActive;

        this.PostPackOpened = function () { }
        this.PostAssembledPigs = function () { }
        this.PostChooseRandomPack = function () { return undefined; }
    }
}