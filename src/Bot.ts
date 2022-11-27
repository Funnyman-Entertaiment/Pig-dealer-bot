import { Client, GatewayIntentBits, Partials } from "discord.js";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore/lite"
import * as DotEnv from "dotenv";
import ready from "./listeners/Ready";
import interactionCreate from "./listeners/InteractionCreate";
import { PackDropper } from "./events/PackDropper";
import * as http from "http";

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hola Mundo');
});

server.listen(port, hostname, () => {
  console.log(`El servidor se está ejecutando en http://${hostname}:${port}/`);
});

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

ready(client);
interactionCreate(client, db);

client.login(token);

PackDropper(client, db)