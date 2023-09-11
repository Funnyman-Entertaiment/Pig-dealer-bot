import { getDocs, query, collection } from "firebase/firestore/lite";
import { GetPack } from "../database/Packs";
import { DropPack } from "../Utils/DropPack";
import { CreateServerInfoFromData } from "../database/ServerInfo";
import { LogInfo } from "../Utils/Log";
import { db } from "../Bot";
import { Cooldowns } from "../Constants/Variables";
import { PACK_12, PACK_2, PACK_5 } from "../Constants/SignificantPackIDs";
import { RunPostChooseRandomPack } from "../seasonalEvents/SeasonalEvents";

let packsUntil5Pack = -1;
let packsUntil12Pack = -1;

let packDropperTimeout: NodeJS.Timeout | undefined;
let fivePackTimeout: NodeJS.Timeout | undefined;
let twelvePackTimeout: NodeJS.Timeout | undefined;

function GetRandomNumber(max: number, exception?: number): number {
	if (exception === undefined) {
		return Math.floor(Math.random() * max);
	}

	const chosen = GetRandomNumber(max - 1);

	if (chosen >= exception) {
		return chosen + 1;
	} else {
		return chosen;
	}
}


async function SpawnRandomPack() {
	if (packDropperTimeout !== undefined) {
		clearTimeout(packDropperTimeout);
	}

	const q = query(collection(db, "serverInfo"));
	const servers = await getDocs(q);

	LogInfo("Sending random packs.");

	let pack = GetPack(PACK_2);

	if (packsUntil5Pack === 0) {
		pack = GetPack(PACK_5);
	}

	if (packsUntil12Pack === 0) {
		pack = GetPack(PACK_12);
	}

	if (pack === undefined) { return; }

	const returnedPack = RunPostChooseRandomPack(pack);
	if (returnedPack !== undefined) {
		pack = returnedPack;
	}

	servers.forEach(async server => {
		if (pack === undefined) { return; }

		const serverInfo = CreateServerInfoFromData(server.id, server.data());

		if (!serverInfo.Enabled) { return; }

		let embedTitle = `A ${pack.Name} HAS APPEARED!`;
		const vowelRegex = "^[aieouAIEOU].*";
		const matched = pack.Name.match(vowelRegex);
		if (matched) {
			embedTitle = `AN ${pack.Name} HAS APPEARED!`;
		}

		DropPack(serverInfo, {
			pack: pack,
			title: embedTitle,
			ping: true
		});
	});

	if (packsUntil5Pack >= 0) { packsUntil5Pack--; }
	if (packsUntil12Pack >= 0) { packsUntil12Pack--; }

	packDropperTimeout = setTimeout(() => {
		SpawnRandomPack();
	}, 1000 * 60 * Cooldowns.MINUTES_BETWEEN_PACKS);
}


async function Set5PackSpawn() {
	if (fivePackTimeout !== undefined) {
		clearTimeout(fivePackTimeout);
	}

	const maxPackNum = Math.floor(Cooldowns.MINUTES_BETWEEN_5_PACKS / Cooldowns.MINUTES_BETWEEN_PACKS);

	if (maxPackNum <= 0) {
		return;
	}

	if (packsUntil12Pack >= 0 && packsUntil12Pack <= maxPackNum) {
		packsUntil5Pack = GetRandomNumber(maxPackNum, packsUntil12Pack);
	} else {
		packsUntil5Pack = GetRandomNumber(maxPackNum);
	}

	fivePackTimeout = setTimeout(() => {
		Set5PackSpawn();
	}, 1000 * 60 * Cooldowns.MINUTES_BETWEEN_5_PACKS);
}


async function Set12PackSpawn() {
	if (twelvePackTimeout !== undefined) {
		clearTimeout(twelvePackTimeout);
	}

	const maxPackNum = Math.floor(Cooldowns.MINUTES_BETWEEN_12_PACKS / Cooldowns.MINUTES_BETWEEN_PACKS);

	if (maxPackNum <= 0) {
		return;
	}

	packsUntil12Pack = GetRandomNumber(maxPackNum, packsUntil5Pack);


	twelvePackTimeout = setTimeout(() => {
		Set12PackSpawn();
	}, 1000 * 60 * Cooldowns.MINUTES_BETWEEN_12_PACKS);
}


export const PackDropper = function () {
	packDropperTimeout = setTimeout(() => {
		SpawnRandomPack();
	}, 1000 * 5);

	Set5PackSpawn();

	Set12PackSpawn();
};