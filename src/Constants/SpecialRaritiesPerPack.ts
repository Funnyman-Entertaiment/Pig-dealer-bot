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
        {"Legendary": 1},
        {"Legendary": 1}
    ]
}