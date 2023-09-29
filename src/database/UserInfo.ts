import { doc, DocumentData, getDoc, Timestamp } from "firebase/firestore/lite";
import { DatabaseElementList } from "./DatabaseCacheList";
import { DatabaseElement } from "./DatabaseElement";
import { db } from "../Bot";
import { GetPig, Pig } from "./Pigs";

export class UserInfo extends DatabaseElement {
	LastTimeOpened2Pack: Timestamp | undefined;
	LastTimeOpened: Timestamp | undefined;
	AssembledPigs: string[];
	Pigs: { [key: string]: number };
	WarnedAboutCooldown: boolean;
	FavouritePigs: string[];
	BulletinMsgId: string | undefined;

	constructor(id: string, assembledPigs: string[], pigs: { [key: string]: number }, warnedAboutCooldown: boolean, favouritePigs: string[], bulletinMsgId?: string, lastTimeOpened?: Timestamp, lastTimeOpened2Pack?: Timestamp) {
		super(id);
		this.AssembledPigs = assembledPigs;
		this.Pigs = pigs;
		this.LastTimeOpened2Pack = lastTimeOpened2Pack;
		this.LastTimeOpened = lastTimeOpened;
		this.WarnedAboutCooldown = warnedAboutCooldown;
		this.FavouritePigs = favouritePigs;
		this.BulletinMsgId = bulletinMsgId;
	}

	GetData(): object {
		const data: { [key: string]: unknown } = {
			Pigs: this.Pigs,
			AssembledPigs: this.AssembledPigs,
			WarnedAboutCooldown: this.WarnedAboutCooldown,
			FavouritePigs: this.FavouritePigs
		};

		if (this.LastTimeOpened !== undefined) {
			data.LastTimeOpened = this.LastTimeOpened;
		}

		if (this.LastTimeOpened2Pack !== undefined) {
			data.LastTimeOpened2Pack = this.LastTimeOpened2Pack;
		}

		if (this.BulletinMsgId !== undefined) {
			data.BulletinMsgId = this.BulletinMsgId;
		}

		return data;
	}
}


let CachedUserInfos: DatabaseElementList<UserInfo> | undefined;


export function CreateNewDefaultUserInfo(id: string) {
	return new UserInfo(
		id,
		[],
		{},
		false,
		[]
	);
}


export async function SaveAllUserInfo() {
	await CachedUserInfos?.SaveAll();
}


function CreateUserInfoFromData(id: string, userInfoData: DocumentData): UserInfo {
	const newUserInfo = new UserInfo(
		id,
		userInfoData.AssembledPigs ?? [],
		userInfoData.Pigs ?? {},
		userInfoData.WarnedAboutCooldown ?? false,
		userInfoData.FavouritePigs ?? [],
		userInfoData.BulletinMsgId,
		userInfoData.LastTimeOpened,
		userInfoData.LastTimeOpened2Pack
	);

	return newUserInfo;
}


function GetCachedUserInfos() {
	if (CachedUserInfos === undefined) {
		CachedUserInfos = new DatabaseElementList<UserInfo>();
	}

	return CachedUserInfos;
}


export async function AddUserInfoToCache(userInfo: UserInfo) {
	await GetCachedUserInfos().Add(userInfo);
}


export async function AddUserInfosToCache(packs: UserInfo[]) {
	for (let i = 0; i < packs.length; i++) {
		const pack = packs[i];
		await AddUserInfoToCache(pack);
	}
}


export async function GetUserInfo(userId: string) {
	const cachedUserInfo = GetCachedUserInfos().Get(userId);

	if (cachedUserInfo === undefined) {
		const userInfoDocument = doc(db, `users/${userId}`);
		const foundUserInfo = await getDoc(userInfoDocument);

		if (foundUserInfo.exists()) {
			const userInfoData = foundUserInfo.data();
			const newuserInfo = CreateUserInfoFromData(userId, userInfoData);
			AddUserInfoToCache(newuserInfo);

			return newuserInfo;
		} else {
			return undefined;
		}
	} else {
		return cachedUserInfo;
	}
}


export function GetUserPigIDs(userInfo?: UserInfo): string[] {
	if (userInfo === undefined) { return []; }
	const userPigs: string[] = [];
	for (const pigId in userInfo.Pigs) {
		userPigs.push(pigId);
	}
	return userPigs;
}


export function GetUserPigs(userInfo?: UserInfo): Pig[] {
	return GetUserPigIDs(userInfo).map(pigID => GetPig(pigID)) as unknown as Pig[];
}