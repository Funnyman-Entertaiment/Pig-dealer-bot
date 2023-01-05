"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetPackByName = exports.GetPacksByRarity = exports.GetPack = exports.CreatePackFromData = exports.ClearPacks = exports.AddPack = exports.Pack = void 0;
const DatabaseElement_1 = require("./DatabaseElement");
class Pack extends DatabaseElement_1.DatabaseElement {
    Name;
    Rarity;
    PigCount;
    Set;
    Tags;
    constructor(id, name, rarity, pigCount, set, tags) {
        super(id);
        this.Name = name;
        this.Rarity = rarity;
        this.PigCount = pigCount;
        this.Set = set;
        this.Tags = tags;
    }
    GetData() {
        return {
            Name: this.Name,
            Rarity: this.Rarity,
            PigCount: this.PigCount,
            Set: this.Set,
            Tags: this.Tags
        };
    }
}
exports.Pack = Pack;
let Packs = [];
function AddPack(pack) {
    Packs.push(pack);
}
exports.AddPack = AddPack;
function ClearPacks() {
    Packs = [];
}
exports.ClearPacks = ClearPacks;
function CreatePackFromData(id, packData) {
    const newPack = new Pack(id, packData.Name, packData.Rarity, packData.PigCount, packData.Set, packData.Tags);
    return newPack;
}
exports.CreatePackFromData = CreatePackFromData;
function GetPack(id) {
    return Packs.find(pack => {
        return pack.ID === id;
    });
}
exports.GetPack = GetPack;
function GetPacksByRarity(rarity) {
    return Packs.filter(pack => {
        return pack.Rarity === rarity;
    });
}
exports.GetPacksByRarity = GetPacksByRarity;
function GetPackByName(name) {
    return Packs.find(pack => {
        return pack.Name === name;
    });
}
exports.GetPackByName = GetPackByName;
