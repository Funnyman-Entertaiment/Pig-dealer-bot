import { Pack } from "../database/Packs";
import { Pig } from "../database/Pigs";
import { ServerInfo } from "../database/ServerInfo";
import { Christmas } from "./Chritmas";
import { NewYears } from "./NewYears";
import { SeasonalEvent } from "./SeasonalEvent";

const SeasonalEvents: SeasonalEvent[] = [
    Christmas,
    NewYears
];

export function RunPostPackOpened(pack: Pack, serverInfo: ServerInfo, chosenPigs: Pig[], pigsToShow: Pig[]){
    const activeEvents = SeasonalEvents.filter(x => x.IsActive());
    activeEvents.forEach(x => x.PostPackOpened(pack, serverInfo, chosenPigs, pigsToShow));
}

export function RunPostAssembledPigs(pack: Pack, serverInfo: ServerInfo, assembledPigs: Pig[]){
    const activeEvents = SeasonalEvents.filter(x => x.IsActive());
    activeEvents.forEach(x => x.PostAssembledPigs(pack, serverInfo, assembledPigs));
}

export function RunPostChooseRandomPack(pack: Pack): Pack | undefined{
    let returnVal: Pack | undefined = undefined;

    const activeEvents = SeasonalEvents.filter(x => x.IsActive());
    activeEvents.forEach(x => {
        returnVal = x.PostChooseRandomPack(pack);
    });

    return returnVal;
}