import { Sex } from "./commands/Sex";
import { TestPig } from "./commands/TestPig";
import { TestPack } from "./commands/TestPack";
import { SetBotChannel } from "./commands/SetChannel";
import { ShowBinder } from "./commands/Bind";
import { SetBotRole } from "./commands/SetRole";
import { Announcement } from "./commands/Announcement";
import { Report } from "./commands/Report";
import { ReloadPigsPacks } from "./commands/ReloadPigsAndPacks";
import { SaveCache } from "./commands/SaveCache";
import { Catalogue } from "./commands/Catalogue";
import { ShowBinderList } from "./commands/BindList";
import { SpawnPack } from "./commands/SpawnPack";
import { SpawnPackUser } from "./commands/SpawnPackForUser";
import { GivePig } from "./commands/GivePig";
import { SearchPig } from "./commands/SearchPig";
import { Trade } from "./commands/Trade";
import { Change12PackCooldown, Change5PackCooldown, ChangeOpeningCooldown, ChangePackCooldown } from "./commands/ChangeCooldowns";
import { GreatWipe } from "./commands/GreatWipe";
import { ClearCooldown } from "./commands/ClearCooldown";
import { GetRole } from "./commands/GetRole";
import { RemoveRole } from "./commands/RemoveRole";
import { Invite } from "./commands/Invite";
import { Information } from "./commands/Info";
import { CheckPig } from "./commands/CheckPig";
import { FavouritePigCmd } from "./commands/FavouritePig";
import { SetAnnouncementChannel } from "./commands/SetAnnouncementChannel";
import { TradeBulletin } from "./commands/TradeBulletin";
import { ResetPackDropper } from "./commands/ResetPackDrops";
import { Foil } from "./commands/Foil";
import { client } from "./Bot";
import { FoilPigs } from "./commands/FoilPigs";

export const Commands = [
    // Sex,
    SetBotChannel,
    // SetBotRole,
    // SetAnnouncementChannel,
    ShowBinder,
    ShowBinderList,
    // Report,
    Catalogue,
    SearchPig,
    // Trade,
    // GetRole,
    // RemoveRole,
    // Invite,
    // Information,
    CheckPig,
    // FavouritePigCmd,
    Foil,
    FoilPigs
];

export const TradeServerCommands = [
    TradeBulletin
]

export const DebugCommands = [
    // TestPack,
    TestPig,
    // Announcement,
    // ReloadPigsPacks,
    SaveCache,
    SpawnPack,
    SpawnPackUser,
    GivePig,
    // ChangeOpeningCooldown,
    // ChangePackCooldown,
    // Change5PackCooldown,
    // Change12PackCooldown,
    // GreatWipe,
    ClearCooldown,
    // ResetPackDropper
];

export function SetCommands(){
    if(client.user === null){ return; }

    if(client.user.id === "1048616940194767009"){
        Commands.forEach(cmd => DebugCommands.push(cmd));
        TradeServerCommands.forEach(cmd => DebugCommands.push(cmd));

        Commands.splice(0, Commands.length);
        TradeServerCommands.splice(0, TradeServerCommands.length);
    }
}