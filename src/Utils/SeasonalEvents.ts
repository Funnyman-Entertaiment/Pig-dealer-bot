import { Timestamp } from "firebase/firestore/lite";

export function IsChristmas(){
    const currentDate = Timestamp.now().toDate();

    return currentDate.getUTCMonth() === 11 &&
        currentDate.getUTCDate() >= 21 && currentDate.getUTCDate() <= 25;
}