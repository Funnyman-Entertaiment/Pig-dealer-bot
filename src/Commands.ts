import { Sex } from "./commands/Sex";
import { TestPig } from "./commands/TestPig";
import { TestPack } from "./commands/TestPack";
import { SetBotChannel } from "./commands/SetChannel";
import { ShowBinder } from "./commands/Bind";
import { SetBotRole } from "./commands/SetRole";
import { Announcement } from "./commands/Announcement";

export const Commands = [Sex, SetBotChannel, SetBotRole, ShowBinder];

export const DebugCommands = [TestPack, TestPig, Announcement];