import { Timestamp } from "firebase/firestore/lite";

export function IsChristmas() {
	const currentDate = Timestamp.now().toDate();

	return currentDate.getUTCMonth() === 11 &&
		currentDate.getUTCDate() >= 21 && currentDate.getUTCDate() <= 25;
}

export function GetNewYearsYear() {
	const currentDate = Timestamp.now().toDate();

	if (currentDate.getUTCMonth() === 0) {
		return currentDate.getUTCFullYear() - 1;
	}

	return currentDate.getUTCFullYear();
}

export function IsNewYear() {
	const currentDate = Timestamp.now().toDate();

	return (currentDate.getUTCMonth() === 11 && currentDate.getUTCDate() >= 30) ||
		(currentDate.getUTCMonth() === 0 && currentDate.getUTCDate() == 1);
}