"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetPigsByRarity = exports.GetPigsWithTag = exports.GetPigsBySet = exports.GetAllPigs = exports.GetPig = exports.CreatePigFromData = exports.ClearPigs = exports.AddPig = exports.Pig = void 0;
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
let Pigs = [];
function AddPig(pig) {
    Pigs.push(pig);
}
exports.AddPig = AddPig;
function ClearPigs() {
    Pigs = [];
}
exports.ClearPigs = ClearPigs;
function CreatePigFromData(id, pigData) {
    const newPig = new Pig(id, pigData.Name, pigData.Description, pigData.Rarity, pigData.Set, pigData.Tags, pigData.RequiredPigs);
    return newPig;
}
exports.CreatePigFromData = CreatePigFromData;
function GetPig(id) {
    return Pigs.find(pig => {
        return pig.ID == id;
    });
}
exports.GetPig = GetPig;
function GetAllPigs() {
    return [...Pigs];
}
exports.GetAllPigs = GetAllPigs;
function GetPigsBySet(set) {
    return Pigs.filter(pig => {
        return pig.Set === set;
    });
}
exports.GetPigsBySet = GetPigsBySet;
function GetPigsWithTag(tags) {
    return Pigs.filter(pig => {
        let hasAllTags = true;
        for (let i = 0; i < tags.length; i++) {
            const tag = tags[i];
            if (!pig.Tags.includes(tag)) {
                hasAllTags = false;
            }
        }
        return hasAllTags;
    });
}
exports.GetPigsWithTag = GetPigsWithTag;
function GetPigsByRarity(rarity) {
    return Pigs.filter(pig => {
        return pig.Rarity === rarity;
    });
}
exports.GetPigsByRarity = GetPigsByRarity;
