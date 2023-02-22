"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetClient = exports.client = exports.db = void 0;
const tslib_1 = require("tslib");
const discord_js_1 = require("discord.js");
const app_1 = require("firebase/app");
const lite_1 = require("firebase/firestore/lite");
const DotEnv = tslib_1.__importStar(require("dotenv"));
const Ready_1 = tslib_1.__importDefault(require("./listeners/Ready"));
const InteractionCreate_1 = tslib_1.__importDefault(require("./listeners/InteractionCreate"));
const UnhandledException_1 = tslib_1.__importDefault(require("./listeners/UnhandledException"));
const GuildJoin_1 = tslib_1.__importDefault(require("./listeners/GuildJoin"));
const GuildLeave_1 = tslib_1.__importDefault(require("./listeners/GuildLeave"));
DotEnv.config();
const projectID = process.env.FIREBASE_PROJECT_ID;
const firebaseConfig = {
    apiKey: process.env.FIREBASE_KEY,
    authDomain: `${projectID}.firebaseapp.com`,
    projectId: `${projectID}`,
    storageBucket: `${projectID}.appspot.com`,
    messagingSenderId: process.env.FIREBASE_MSG_SENDER,
    appId: process.env.FIREBASE_API_ID,
    measurementId: "G-SLSDV1DJR9"
};
const app = (0, app_1.initializeApp)(firebaseConfig);
exports.db = (0, lite_1.getFirestore)(app);
const token = process.env.BOT_TOKEN;
exports.client = new discord_js_1.Client({
    intents: [
        discord_js_1.GatewayIntentBits.GuildMessages,
        discord_js_1.GatewayIntentBits.Guilds,
        discord_js_1.GatewayIntentBits.GuildMessageReactions
    ],
    partials: [discord_js_1.Partials.Channel, discord_js_1.Partials.Reaction, discord_js_1.Partials.Message],
});
(0, Ready_1.default)();
(0, InteractionCreate_1.default)();
(0, UnhandledException_1.default)();
(0, GuildJoin_1.default)();
(0, GuildLeave_1.default)();
exports.client.login(token);
function GetClient() {
    return exports.client;
}
exports.GetClient = GetClient;
