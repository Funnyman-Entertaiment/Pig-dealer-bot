import { Client, GatewayIntentBits, Partials } from "discord.js";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore/lite"
import * as DotEnv from "dotenv";
import ready from "./listeners/Ready";
import interactionCreate from "./listeners/InteractionCreate";
import { PackDropper } from "./events/PackDropper";

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
const db = getFirestore(app);


//Initialize discord bot
const token = process.env.BOT_TOKEN;

const client = new Client({
    intents: [
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessageReactions
    ],
    partials: [Partials.Channel, Partials.Reaction, Partials.Message],
});

ready(client, db);
interactionCreate(client, db);

client.login(token);