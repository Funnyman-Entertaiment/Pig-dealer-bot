import { PACK_12, PACK_2, PACK_5 } from "./SignificantPackIDs";

export const FOIL_PACK_REPLACEMENT_CHANCE_PER_PACK: { readonly [key: string]: number } = {
	[PACK_2]: 0.01,
	[PACK_5]: 0.1,
	[PACK_12]: 0.2
};