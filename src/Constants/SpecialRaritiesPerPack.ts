export const SPECIAL_RARITIES_PER_PACK: { readonly [key: string]: { readonly [key: string]: number }[] } = {
	["🍀Lucky Pack🍀"]: [
		{ "Common": 1 },
		{ "Rare": 1 },
		{ "Rare": 1, "Epic": 0.5 },
		{ "Epic": 1, "Legendary": 0.25 }
	],
	["🍀Super Lucky Pack🍀"]: [
		{ "Rare": 1, "Epic": 0.25 },
		{ "Rare": 1, "Epic": 0.5 },
		{ "Epic": 1 },
		{ "Legendary": 1 }
	],
	["Generic Pack"]: [
		{ "Common": 1 },
		{ "Common": 1 },
		{ "Common": 1 },
		{ "Common": 1, "Rare": 0.25 },
		{ "Rare": 1, "Epic": 0.1 },
		{ "Rare": 1, "Epic": 0.1, "Legendary": 0.1 }
	],
	["Stocking"]: [
		{ "Common": 1, "Rare": 0.1 },
		{ "Rare": 1, "Epic": 0.1 },
		{ "Postcard": 1, "Postcard (Animated)": 0.1 },
	],
	["Epic Pack"]: [
		{ "Epic": 1 },
		{ "Epic": 1 },
		{ "Epic": 1 },
	],
	["Legendary Pack"]: [
		{ "Legendary": 1 },
	],
	["2 Pack"]: [
		{ "Common": 1 },
		{ "Common": 1, "Rare": 0.2, "Epic": 0.05 }
	],
	["5 Pack"]: [
		{ "Common": 1 },
		{ "Common": 1, "Rare": 0.1 },
		{ "Common": 1, "Rare": 0.2 },
		{ "Rare": 1, "Epic": 0.08 },
		{ "Rare": 1, "Epic": 0.3, "Legendary": 0.01 }
	],
	["12 Pack"]: [
		{ "Common": 1 },
		{ "Common": 1 },
		{ "Common": 1 },
		{ "Common": 1 },
		{ "Common": 1, "Rare": 0.3 },
		{ "Common": 1, "Rare": 0.4 },
		{ "Common": 1, "Rare": 0.5 },
		{ "Common": 1, "Rare": 0.5 },
		{ "Rare": 1 },
		{ "Rare": 1, "Epic": 0.5 },
		{ "Epic": 1 },
		{ "Epic": 1, "Legendary": 0.5 }
	],
	["Egg Stage 1"]: [
		{ "Common": 1 },
	],
	["Egg Stage 2"]: [
		{ "Common": 1 },
	],
	["Egg Stage 3"]: [
		{ "Common": 1 },
		{ "Common": 1, "Rare": 0.2, "Epic": 0.05, "Easter": 0.16 }
	],
	["Egg Stage 4"]: [
		{ "Common": 1 },
		{ "Common": 1, "Rare": 0.2, "Epic": 0.05, "Easter": 0.24 }
	],
	["Egg Stage 5"]: [
		{ "Common": 1 },
		{ "Common": 1, "Rare": 0.2 },
		{ "Common": 1, "Rare": 0.2, "Epic": 0.05, "Easter": 0.32 }
	],
	["Egg Stage 6"]: [
		{ "Common": 1 },
		{ "Common": 1, "Rare": 0.2 },
		{ "Common": 1, "Rare": 0.2, "Epic": 0.05, "Easter": 0.4 }
	],
	["Egg Stage 7"]: [
		{ "Common": 1 },
		{ "Common": 1, "Rare": 0.1 },
		{ "Common": 1, "Rare": 0.2 },
		{ "Rare": 1, "Epic": 0.08, "Easter": 0.48 },
	],
	["Egg Stage 8"]: [
		{ "Common": 1 },
		{ "Common": 1, "Rare": 0.1 },
		{ "Common": 1, "Rare": 0.2 },
		{ "Rare": 1, "Epic": 0.08, "Easter": 0.56 },
	],
	["Egg Stage 9"]: [
		{ "Common": 1 },
		{ "Common": 1, "Rare": 0.1 },
		{ "Common": 1, "Rare": 0.2 },
		{ "Rare": 1, "Epic": 0.08 },
		{ "Rare": 1, "Epic": 0.3, "Legendary": 0.01, "Easter": 0.64 }
	],
	["Egg Stage 10"]: [
		{ "Common": 1 },
		{ "Common": 1, "Rare": 0.1 },
		{ "Common": 1, "Rare": 0.2 },
		{ "Rare": 1, "Epic": 0.08 },
		{ "Rare": 1, "Epic": 0.3, "Legendary": 0.01, "Easter": 0.72 }
	]
}