export const RARITIES_PER_PIG_COUNT: { readonly [key: number]: {readonly [key: string]: number}[]} = {
    [3]: [
        {"Common": 1},
        {"Rare": 1},
        {"Epic": 1, "Legendary": 0.1}
    ],
    [4]: [
        {"Common": 1},
        {"Rare": 1},
        {"Rare": 1, "Epic": 0.1},
        {"Epic": 1, "Legendary": 0.1}
    ],
    [5]: [
        {"Common": 1},
        {"Common": 1, "Rare": 0.25},
        {"Rare": 1},
        {"Rare": 1, "Epic": 0.1},
        {"Epic": 1, "Legendary": 0.1}
    ],
    [6]: [
        {"Common": 1},
        {"Common": 1},
        {"Common": 1, "Rare": 0.25},
        {"Common": 1, "Rare": 0.25},
        {"Rare": 1, "Epic": 0.1},
        {"Epic": 1, "Legendary": 0.1}
    ],
    [8]: [
        {"Common": 1},
        {"Common": 1},
        {"Common": 1, "Rare": 0.25},
        {"Rare": 1},
        {"Rare": 1, "Epic": 0.01},
        {"Rare": 1, "Epic": 0.25},
        {"Rare": 1, "Epic": 0.5},
        {"Epic": 1, "Legendary": 0.1}
    ]
}