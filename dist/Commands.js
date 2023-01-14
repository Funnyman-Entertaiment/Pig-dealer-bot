"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DebugCommands = exports.TradeServerCommands = exports.Commands = void 0;
const Sex_1 = require("./commands/Sex");
const TestPig_1 = require("./commands/TestPig");
const TestPack_1 = require("./commands/TestPack");
const SetChannel_1 = require("./commands/SetChannel");
const Bind_1 = require("./commands/Bind");
const SetRole_1 = require("./commands/SetRole");
const Announcement_1 = require("./commands/Announcement");
const Report_1 = require("./commands/Report");
const ReloadPigsAndPacks_1 = require("./commands/ReloadPigsAndPacks");
const SaveCache_1 = require("./commands/SaveCache");
const Catalogue_1 = require("./commands/Catalogue");
const BindList_1 = require("./commands/BindList");
const SpawnPack_1 = require("./commands/SpawnPack");
const SpawnPackForUser_1 = require("./commands/SpawnPackForUser");
const GivePig_1 = require("./commands/GivePig");
const SearchPig_1 = require("./commands/SearchPig");
const Trade_1 = require("./commands/Trade");
const ChangeCooldowns_1 = require("./commands/ChangeCooldowns");
const GreatWipe_1 = require("./commands/GreatWipe");
const ClearCooldown_1 = require("./commands/ClearCooldown");
const GetRole_1 = require("./commands/GetRole");
const RemoveRole_1 = require("./commands/RemoveRole");
const Invite_1 = require("./commands/Invite");
const Info_1 = require("./commands/Info");
const CheckPig_1 = require("./commands/CheckPig");
const FavouritePig_1 = require("./commands/FavouritePig");
const SetAnnouncementChannel_1 = require("./commands/SetAnnouncementChannel");
const TradeBulletin_1 = require("./commands/TradeBulletin");
exports.Commands = [
    Sex_1.Sex,
    SetChannel_1.SetBotChannel,
    SetRole_1.SetBotRole,
    SetAnnouncementChannel_1.SetAnnouncementChannel,
    Bind_1.ShowBinder,
    BindList_1.ShowBinderList,
    Report_1.Report,
    Catalogue_1.Catalogue,
    SearchPig_1.SearchPig,
    Trade_1.Trade,
    GetRole_1.GetRole,
    RemoveRole_1.RemoveRole,
    Invite_1.Invite,
    Info_1.Information,
    CheckPig_1.CheckPig,
    FavouritePig_1.FavouritePigCmd
];
exports.TradeServerCommands = [
    TradeBulletin_1.TradeBulletin
];
exports.DebugCommands = [
    TestPack_1.TestPack,
    TestPig_1.TestPig,
    Announcement_1.Announcement,
    ReloadPigsAndPacks_1.ReloadPigsPacks,
    SaveCache_1.SaveCache,
    SpawnPack_1.SpawnPack,
    SpawnPackForUser_1.SpawnPackUser,
    GivePig_1.GivePig,
    ChangeCooldowns_1.ChangeOpeningCooldown,
    ChangeCooldowns_1.ChangePackCooldown,
    ChangeCooldowns_1.Change5PackCooldown,
    ChangeCooldowns_1.Change12PackCooldown,
    GreatWipe_1.GreatWipe,
    ClearCooldown_1.ClearCooldown
];
