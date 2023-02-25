import { Timestamp } from "firebase/firestore/lite";
import { SeasonalEvent } from "./SeasonalEvent";
import { GetPigsByRarity } from "../database/Pigs";
import { ASSEMBLY_NEW_YEAR_PIG } from "../Constants/SignificantPigIDs";

function GetNewYearsYear(){
    const currentDate = Timestamp.now().toDate();

    if(currentDate.getUTCMonth() === 0){
        return currentDate.getUTCFullYear() - 1;
    }

    return currentDate.getUTCFullYear();
}

export const NewYears = new SeasonalEvent(() =>{
    const currentDate = Timestamp.now().toDate();

    return (currentDate.getUTCMonth() === 11 && currentDate.getUTCDate() >= 30) ||
    (currentDate.getUTCMonth() === 0 && currentDate.getUTCDate() == 1)
});

NewYears.PostPackOpened = function(_pack, serverInfo, chosenPigs, _pigsToShow){
    const currentYear = GetNewYearsYear();

    if (!serverInfo.YearsSpawnedAllNewYearDeco.includes(currentYear) && Math.random() < 0.1) {
        const newYearPigs = GetPigsByRarity("New Year");
        const chosenNewYearPigs = newYearPigs[Math.floor(Math.random() * newYearPigs.length)];
        chosenPigs.push(chosenNewYearPigs);
    }
}

NewYears.PostAssembledPigs = function(_pack, serverInfo, assembledPigs){
    if (!assembledPigs.some(pig => pig.ID === ASSEMBLY_NEW_YEAR_PIG)) { return; }
    const currentYear = GetNewYearsYear();

    serverInfo.YearsSpawnedAllNewYearDeco.push(currentYear);
}