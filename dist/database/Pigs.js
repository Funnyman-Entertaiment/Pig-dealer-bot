"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAllPigs = exports.GetPigsWithTag = exports.GetPigsBySet = exports.GetPig = exports.AddPigsToCache = exports.AddPigToCache = exports.CreatePigFromData = exports.Pig = void 0;
const lite_1 = require("firebase/firestore/lite");
const DatabaseCacheList_1 = require("./DatabaseCacheList");
const DatabaseElement_1 = require("./DatabaseElement");
class Pig extends DatabaseElement_1.DatabaseElement {
    Name;
    Description;
    Rarity;
    Set;
    Tags;
    RequiredPigs;
    constructor(id, name, description, rarity, set, tags, requiredPigs) {
        super(id);
        this.Name = name;
        this.Description = description;
        this.Rarity = rarity;
        this.Set = set;
        this.Tags = tags;
        this.RequiredPigs = requiredPigs;
    }
    GetData() {
        return {
            Name: this.Name,
            Description: this.Description,
            Rarity: this.Rarity,
            Set: this.Set,
            Tags: this.Tags,
            RequiredPigs: this.RequiredPigs
        };
    }
}
exports.Pig = Pig;
let CachedPigs;
function GetCachedPigs() {
    if (CachedPigs === undefined) {
        CachedPigs = new DatabaseCacheList_1.DatabaseElementList();
    }
    return CachedPigs;
}
function CreatePigFromData(id, pigData) {
    const newPig = new Pig(id, pigData.Name, pigData.Description, pigData.Rarity, pigData.Set, pigData.Tags, pigData.RequiredPigs);
    return newPig;
}
exports.CreatePigFromData = CreatePigFromData;
async function AddPigToCache(pig, db) {
    await GetCachedPigs().Add(pig, db);
}
exports.AddPigToCache = AddPigToCache;
async function AddPigsToCache(pigs, db) {
    for (let i = 0; i < pigs.length; i++) {
        const pig = pigs[i];
        await AddPigToCache(pig, db);
    }
}
exports.AddPigsToCache = AddPigsToCache;
async function GetPig(id, db) {
    const cachedPig = GetCachedPigs().Get(id);
    if (cachedPig === undefined) {
        const pigDocument = (0, lite_1.doc)(db, `pigs/${id}`);
        const foundPig = await (0, lite_1.getDoc)(pigDocument);
        if (foundPig.exists()) {
            const pigData = foundPig.data();
            const newPig = CreatePigFromData(id, pigData);
            GetCachedPigs().Add(newPig, db);
            return newPig;
        }
        else {
            return undefined;
        }
    }
    else {
        return cachedPig;
    }
}
exports.GetPig = GetPig;
async function GetPigsBySet(set, db) {
    const pigsQuery = (0, lite_1.query)((0, lite_1.collection)(db, "pigs"), (0, lite_1.where)("Set", "==", set));
    const pigDocs = await (0, lite_1.getDocs)(pigsQuery);
    const pigs = [];
    pigDocs.forEach(pigDoc => {
        const pigData = pigDoc.data();
        const newPig = CreatePigFromData(pigDoc.id, pigData);
        pigs.push(newPig);
    });
    return pigs;
}
exports.GetPigsBySet = GetPigsBySet;
async function GetPigsWithTag(tag, db) {
    const pigsQuery = (0, lite_1.query)((0, lite_1.collection)(db, "pigs"), (0, lite_1.where)("Tags", "array-contains-any", tag));
    const pigDocs = await (0, lite_1.getDocs)(pigsQuery);
    const pigs = [];
    pigDocs.forEach(pigDoc => {
        const pigData = pigDoc.data();
        const newPig = CreatePigFromData(pigDoc.id, pigData);
        pigs.push(newPig);
    });
    return pigs;
}
exports.GetPigsWithTag = GetPigsWithTag;
async function GetAllPigs(db) {
    const pigsQuery = (0, lite_1.query)((0, lite_1.collection)(db, "pigs"));
    const pigDocs = await (0, lite_1.getDocs)(pigsQuery);
    const pigs = [];
    pigDocs.forEach(pigDoc => {
        const pigData = pigDoc.data();
        const newPig = CreatePigFromData(pigDoc.id, pigData);
        pigs.push(newPig);
    });
    return pigs;
}
exports.GetAllPigs = GetAllPigs;
