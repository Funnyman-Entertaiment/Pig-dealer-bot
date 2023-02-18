"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Buttons = void 0;
const AcceptTrade_1 = require("./buttons/AcceptTrade");
const DenyTrade_1 = require("./buttons/DenyTrade");
const FavouritePig_1 = require("./buttons/FavouritePig");
const NextGallery_1 = require("./buttons/NextGallery");
const NextList_1 = require("./buttons/NextList");
const NextSet_1 = require("./buttons/NextSet");
const OpenPack_1 = require("./buttons/OpenPack");
const PrevGallery_1 = require("./buttons/PrevGallery");
const PrevList_1 = require("./buttons/PrevList");
const PrevSet_1 = require("./buttons/PrevSet");
const UnfavouritePig_1 = require("./buttons/UnfavouritePig");
exports.Buttons = [
    OpenPack_1.OpenPack,
    NextGallery_1.NextGallery,
    PrevGallery_1.PrevGallery,
    NextSet_1.NextSet,
    PrevSet_1.PreviousSet,
    NextList_1.NextList,
    PrevList_1.PreviousList,
    DenyTrade_1.DenyTrade,
    AcceptTrade_1.AcceptTrade,
    FavouritePig_1.FavouritePig,
    UnfavouritePig_1.UnfavouritePig
];
