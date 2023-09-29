import { Pack } from "../database/Packs";
import { Pig } from "../database/Pigs";
import { ServerInfo } from "../database/ServerInfo";
import { Anniversary } from "./Anniversary";
import { Christmas } from "./Chritmas";
import { Easter } from "./Easter";
import { NewYears } from "./NewYears";
import { Pigoween } from "./Pigoween";
import { SaintPatricks } from "./SaintPatricks";
import { SeasonalEvent } from "./SeasonalEvent";

const SeasonalEvents: SeasonalEvent[] = [
	Christmas,
	NewYears,
	Easter,
	SaintPatricks,
	Anniversary,
	Pigoween
];

export function GetActiveEvents() {
	return SeasonalEvents.filter(x => x.IsActive());
}

export function RunPostPackOpened(pack: Pack, serverInfo: ServerInfo, chosenPigs: Pig[], pigsToShow: Pig[]) {
	const activeEvents = GetActiveEvents();
	activeEvents.forEach(x => x.PostPackOpened(pack, serverInfo, chosenPigs, pigsToShow));
}

export function RunPostAssembledPigs(pack: Pack, serverInfo: ServerInfo, assembledPigs: Pig[]) {
	const activeEvents = GetActiveEvents();
	activeEvents.forEach(x => x.PostAssembledPigs(pack, serverInfo, assembledPigs));
}

export function RunPostChooseRandomPack(pack: Pack, serverInfo: ServerInfo): Pack | undefined {
	let returnVal: Pack | undefined = undefined;

	const activeEvents = GetActiveEvents();
	activeEvents.forEach(x => {
		returnVal = x.PostChooseRandomPack(pack, serverInfo);
	});

	return returnVal;
}