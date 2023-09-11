import { Colors } from "discord.js";

export const COLOR_PER_PIG_RARITY: { readonly [key: string]: number } = {
	Common: Colors.LightGrey,
	Rare: Colors.Yellow,
	Epic: Colors.Purple,
	Legendary: Colors.LuminousVividPink,
	Assembly: Colors.Red,
	["One of a kind"]: Colors.Gold,
	["Limited Edition"]: Colors.Gold,
	Christmas: Colors.DarkGreen,
	Postcard: Colors.DarkRed,
	["Postcard (Animated)"]: Colors.DarkRed,
	["Christmas Bundle"]: Colors.DarkGreen,
	["Apology Present"]: Colors.White,
	["Personal Gift"]: Colors.White,
	["Unimplemented"]: Colors.Grey,
	["Easter"]: 9031664,
	["Saint Patrick's Day"]: Colors.Green,
	Halloween: Colors.Orange,
	["Halloween (Rare)"]: Colors.DarkGold,
	["Halloween (Epic)"]: Colors.DarkOrange
};