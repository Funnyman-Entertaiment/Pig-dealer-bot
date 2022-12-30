import { Colors } from "discord.js";

export const COLOR_PER_PACK_RARITY: { readonly [key: string]: number } = {
    Default: Colors.NotQuiteBlack,
    Common: Colors.Green,
    Rare: Colors.Blue,
    [`Super Rare`]: Colors.Orange,

    [`Special`]: Colors.DarkGreen
}