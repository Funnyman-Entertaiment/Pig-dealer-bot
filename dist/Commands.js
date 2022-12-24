"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DebugCommands = exports.Commands = void 0;
const Sex_1 = require("./commands/Sex");
const TestPig_1 = require("./commands/TestPig");
const TestPack_1 = require("./commands/TestPack");
const SetChannel_1 = require("./commands/SetChannel");
const Bind_1 = require("./commands/Bind");
const SetRole_1 = require("./commands/SetRole");
const Announcement_1 = require("./commands/Announcement");
const Report_1 = require("./commands/Report");
exports.Commands = [Sex_1.Sex, SetChannel_1.SetBotChannel, SetRole_1.SetBotRole, Bind_1.ShowBinder, Report_1.Report];
exports.DebugCommands = [TestPack_1.TestPack, TestPig_1.TestPig, Announcement_1.Announcement];
