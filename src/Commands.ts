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

export const Commands = [
    Sex,
    SetBotChannel,
    SetBotRole,
    ShowBinder,
    ShowBinderList,
    Report,
    Catalogue,
    SearchPig,
    Trade,
    GetRole,
    RemoveRole
];

export const DebugCommands = [
    TestPack,
    TestPig,
    Announcement,
    ReloadPigsPacks,
    SaveCache,
    SpawnPack,
    SpawnPackUser,
    GivePig,
    ChangeOpeningCooldown,
    ChangePackCooldown,
    Change5PackCooldown,
    Change12PackCooldown,
    GreatWipe,
    ClearCooldown
];