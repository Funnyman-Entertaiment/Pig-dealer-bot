import { Timestamp } from "firebase/firestore/lite";
import { SeasonalEvent } from "./SeasonalEvent";
import { GetPig } from "../database/Pigs";
import { LEPRECHAUN_PIG } from "../Constants/SignificantPigIDs";

export const SaintPatricks = new SeasonalEvent(
	"Saint Pigtricks",
	"Irish famine",
	() => {
		const currentDate = Timestamp.now().toDate();

		return currentDate.getUTCMonth() === 2 &&
			currentDate.getUTCDate() >= 17 && currentDate.getUTCDate() <= 18;
	}
);

SaintPatricks.PostPackOpened = function (_, serverInfo, chosenPigs, pigsToShow) {
	const currentDate = Timestamp.now().toDate();
	const currentYear = currentDate.getUTCFullYear();

	if (serverInfo.YearsSpawnedLeprechaun.includes(currentYear)) { return; }

	const leprechaunPig = GetPig(LEPRECHAUN_PIG);

	if (leprechaunPig === undefined) { return; }

	if (Math.random() < 0.1) {
		chosenPigs.push(leprechaunPig);
		pigsToShow.push(leprechaunPig);

		serverInfo.YearsSpawnedLeprechaun.push(currentYear);
	}
};
