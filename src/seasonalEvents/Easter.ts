import { Timestamp } from "firebase/firestore/lite";
import { SeasonalEvent } from "./SeasonalEvent";
import { Cooldowns } from "../Constants/Variables";
import { EGG_PACK, PACK_2 } from "../Constants/SignificantPackIDs";
import { GetPack } from "../database/Packs";
import { LogInfo } from "../Utils/Log";

function GetFirstMondayOfMonth(): number {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const dayOfWeek = firstDayOfMonth.getDay();
    const daysUntilMonday = (dayOfWeek === 0) ? 1 : (8 - dayOfWeek);
    const firstMonday = new Date(today.getFullYear(), today.getMonth(), daysUntilMonday);
    return firstMonday.getUTCDay();
}

export const Easter = new SeasonalEvent(
    "Pigster",
    "It's pigster, everyone! Easter is a great holiday. Family, food, eggs, Christian imagery... What's not love?" +
    "Well, on that list of reasons to love Easter you can also put the Pig Dealer Easter event, Pigster!" +
    "Pigster lasts over the duration of the first week of April. " +
    "Here's how it works: Every once in a while, an egg will drop instead of a pack. " +
    "These eggs normally only contain a single pig, but with time, the egg will grow bigger and healthier, " +
    "containing more pigs for you to claim! Every minute, its odds of containing a Pigster exclusive Pig will increase, " +
    "and so will the amount of pigs it contains every two minutes! This sounds great, right? Well, there's a catch. " +
    "If the egg is left unopened too long (11 minutes, to be precise) it will go bad!" +
    "Opening it will only yield the horrific stench of sulfur and the disappointment of a wasted egg, so stay on your toes!",
    () => {
        const currentDate = Timestamp.now().toDate();

        if(currentDate.getUTCMonth() !== 3){ return false; }

        const firstMonday = GetFirstMondayOfMonth()
        const lastDay = firstMonday + 7;

        return currentDate.getUTCDay() >= firstMonday && currentDate.getUTCDate() <= lastDay;
    }
);

let packsUntilEasterEgg = 0;

Easter.PostChooseRandomPack = function(pack) {
    if(pack.ID !== PACK_2){ return; }

    if(packsUntilEasterEgg < 0) { return; }

    packsUntilEasterEgg--;

    if(packsUntilEasterEgg > 0){ return; }

    const newPack = GetPack(EGG_PACK);

    if(newPack === undefined){ return; }

    return newPack;
}

setInterval(() => {
    const maxPackNum = Math.floor(Cooldowns.MINUTES_BETWEEN_EGG_PACKS / Cooldowns.MINUTES_BETWEEN_PACKS)-2;
    packsUntilEasterEgg = Math.floor(Math.random() * maxPackNum);
}, 1000 * 60 * Cooldowns.MINUTES_BETWEEN_EGG_PACKS);