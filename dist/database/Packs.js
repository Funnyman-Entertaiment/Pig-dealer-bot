"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetPacksByRarity = exports.GetPack = exports.AddPacksToCache = exports.AddPackToCache = exports.CreatePackFromData = exports.Pack = void 0;
const lite_1 = require("firebase/firestore/lite");
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
let CachedPacks;
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
async function GetPack(id, db) {
    const cachedPack = GetCachedPacks().Get(id);
    if (cachedPack === undefined) {
        const packDocument = (0, lite_1.doc)(db, `packs/${id}`);
        const foundPack = await (0, lite_1.getDoc)(packDocument);
        if (foundPack.exists()) {
            const packData = foundPack.data();
            const newPack = CreatePackFromData(id, packData);
            GetCachedPacks().Add(newPack, db);
            return newPack;
        }
        else {
            return undefined;
        }
    }
    else {
        return cachedPack;
    }
}
exports.GetPack = GetPack;
async function GetPacksByRarity(rarity, db) {
    const packsQuery = (0, lite_1.query)((0, lite_1.collection)(db, "packs"), (0, lite_1.where)("Rarity", "==", rarity));
    const packDocs = await (0, lite_1.getDocs)(packsQuery);
    const packs = [];
    packDocs.forEach(packDoc => {
        const packData = packDoc.data();
        const newPack = CreatePackFromData(packDoc.id, packData);
        packs.push(newPack);
    });
    return packs;
}
exports.GetPacksByRarity = GetPacksByRarity;
