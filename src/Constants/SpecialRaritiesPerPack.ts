export const SPECIAL_RARITIES_PER_PACK: { readonly [key: string]: {readonly [key: string]: number}[]} = {
    ["🍀Lucky Pack🍀"]: [
        {"Common": 1},
        {"Rare": 1},
        {"Rare": 1, "Epic": 0.5},
        {"Epic": 1, "Legendary": 0.25}
    ],
    ["🍀Super Lucky Pack🍀"]: [
        {"Rare": 1, "Epic": 0.25},
        {"Rare": 1, "Epic": 0.5},
        {"Epic": 1},
        {"Legendary": 1}
    ],
    ["Generic Pack"]: [
        {"Common": 1},
        {"Common": 1},
        {"Common": 1},
        {"Common": 1, "Rare": 0.25},
        {"Rare": 1, "Epic": 0.1},
        {"Rare": 1, "Epic": 0.1, "Legendary": 0.1}
	],
	["Stocking"]: [
        {"Common": 1, "Rare": 0.1},
        {"Rare": 1, "Epic": 0.1},
        {"Postcard": 1, "Postcard (Animated)": 0.1},
	],
	["Epic Pack"]: [
        {"Epic": 1},
        {"Epic": 1},
        {"Epic": 1},
	],
	["Legendary Pack"]: [
        {"Legendary": 1},
	]
}