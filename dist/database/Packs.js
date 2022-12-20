"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetPacksByRarity = exports.GetPack = exports.AddPacksToCache = exports.AddPackToCache = exports.CreatePackFromData = exports.AddPack = exports.Pack = void 0;
const DatabaseCacheList_1 = require("./DatabaseCacheList");
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
let CachedPacks;
function AddPack(pack) {
    Packs.push(pack);
}
exports.AddPack = AddPack;
function GetCachedPacks() {
    if (CachedPacks === undefined) {
        CachedPacks = new DatabaseCacheList_1.DatabaseElementList();
    }
    return CachedPacks;
}
function CreatePackFromData(id, packData) {
    const newPack = new Pack(id, packData.Name, packData.Rarity, packData.PigCount, packData.Set, packData.Tags);
    return newPack;
}
exports.CreatePackFromData = CreatePackFromData;
async function AddPackToCache(pack, db) {
    await GetCachedPacks().Add(pack, db);
}
exports.AddPackToCache = AddPackToCache;
async function AddPacksToCache(packs, db) {
    for (let i = 0; i < packs.length; i++) {
        const pack = packs[i];
        await AddPackToCache(pack, db);
    }
}
exports.AddPacksToCache = AddPacksToCache;
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
