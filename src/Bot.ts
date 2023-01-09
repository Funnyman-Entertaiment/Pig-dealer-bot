import { Client, GatewayIntentBits, Partials } from "discord.js";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore/lite"
import * as DotEnv from "dotenv";
import ready from "./listeners/Ready";
import interactionCreate from "./listeners/InteractionCreate";
import unhandledException from "./listeners/UnhandledException";
import guildJoin from "./listeners/GuildJoin";
import guildLeave from "./listeners/GuildLeave";

DotEnv.config();


//Initialize firebase
const firebaseConfig = {
    apiKey: process.env.FIREBASE_KEY,
    authDomain: "pigsdiscordbot.firebaseapp.com",
    projectId: "pigsdiscordbot",
    storageBucket: "pigsdiscordbot.appspot.com",
    messagingSenderId: process.env.FIREBASE_MSG_SENDER,
    appId: process.env.FIREBASE_API_ID,
    measurementId: "G-SLSDV1DJR9"
};
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);


//Initialize discord bot
const token = process.env.BOT_TOKEN;

export const client = new Client({
    intents: [
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessageReactions
    ],
    partials: [Partials.Channel, Partials.Reaction, Partials.Message],
});

ready();
interactionCreate();
unhandledException();
guildJoin();
guildLeave();

client.login(token);


export function GetClient(){
    return client;
}