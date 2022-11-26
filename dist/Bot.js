"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const discord_js_1 = require("discord.js");
const app_1 = require("firebase/app");
const lite_1 = require("firebase/firestore/lite");
const DotEnv = tslib_1.__importStar(require("dotenv"));
const Ready_1 = tslib_1.__importDefault(require("./listeners/Ready"));
const InteractionCreate_1 = tslib_1.__importDefault(require("./listeners/InteractionCreate"));
const PackDropper_1 = require("./events/PackDropper");
DotEnv.config();
const firebaseConfig = {
    apiKey: process.env.FIREBASE_KEY,
    authDomain: "pigsdiscordbot.firebaseapp.com",
    projectId: "pigsdiscordbot",
    storageBucket: "pigsdiscordbot.appspot.com",
    messagingSenderId: process.env.FIREBASE_MSG_SENDER,
    appId: process.env.FIREBASE_API_ID,
    measurementId: "G-SLSDV1DJR9"
};
const app = (0, app_1.initializeApp)(firebaseConfig);
const db = (0, lite_1.getFirestore)(app);
const token = process.env.BOT_TOKEN;
const client = new discord_js_1.Client({
    intents: [
        discord_js_1.GatewayIntentBits.GuildMessages,
        discord_js_1.GatewayIntentBits.Guilds,
        discord_js_1.GatewayIntentBits.GuildMessageReactions
    ],
    partials: [discord_js_1.Partials.Channel, discord_js_1.Partials.Reaction, discord_js_1.Partials.Message],
});
(0, Ready_1.default)(client);
(0, InteractionCreate_1.default)(client, db);
client.login(token);
(0, PackDropper_1.PackDropper)(client, db);
