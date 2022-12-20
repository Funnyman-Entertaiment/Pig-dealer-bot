"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SPECIAL_RARITIES_PER_PACK = void 0;
exports.SPECIAL_RARITIES_PER_PACK = {
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
    ]
};
