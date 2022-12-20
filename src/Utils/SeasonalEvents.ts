import { Timestamp } from "firebase/firestore/lite";

export function IsChristmas(){
    const currentDate = Timestamp.now().toDate();

    return currentDate.getMonth() === 12 &&
        currentDate.getDay() >= 21 && currentDate.getDay() <= 25;
}