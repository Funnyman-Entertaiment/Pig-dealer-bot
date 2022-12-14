"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PackDropper = void 0;
const discord_js_1 = require("discord.js");
const lite_1 = require("firebase/firestore/lite");
const MessageInfo_1 = require("../database/MessageInfo");
const ColorPerPackRarity_1 = require("../Constants/ColorPerPackRarity");
const Packs_1 = require("../database/Packs");
const Errors_1 = require("../Utils/Errors");
async function DropPack(client, db) {
    const q = (0, lite_1.query)((0, lite_1.collection)(db, "serverInfo"));
    const servers = await (0, lite_1.getDocs)(q);
    servers.forEach(async (server) => {
        if (server.data().Channel === undefined) {
            return;
        }
        try {
            await client.channels.fetch(server.data().Channel).then(async (channel) => {
                if (channel === null) {
                    return;
                }
                const guild = await client.guilds.fetch(server.id);
                let chosenRarity = "Default";
                if (Math.random() <= 0.08) {
                    const packChance = Math.random();
                    if (packChance <= 0.7) {
                        chosenRarity = "Common";
                    }
                    else if (packChance <= 0.9) {
                        chosenRarity = "Rare";
                    }
                    else {
                        chosenRarity = "Super Rare";
                    }
                }
                const packQuery = (0, lite_1.query)((0, lite_1.collection)(db, "packs"), (0, lite_1.where)("Rarity", "==", chosenRarity));
                const packs = await (0, lite_1.getDocs)(packQuery);
                const possiblePacks = [];
                packs.forEach(pack => {
                    possiblePacks.push((0, Packs_1.CreatePackFromData)(pack.id, pack.data()));
                });
                var pack = possiblePacks[Math.floor(Math.random() * possiblePacks.length)];
                if (channel.type === discord_js_1.ChannelType.GuildText) {
                    let img = `${pack.ID}.png`;
                    const packEmbed = new discord_js_1.EmbedBuilder()
                        .setTitle(`A ${pack.Name} HAS APPEARED!`)
                        .setImage(`attachment://${img}`)
                        .setColor(ColorPerPackRarity_1.COLOR_PER_PACK_RARITY[pack.Rarity]);
                    const row = new discord_js_1.ActionRowBuilder()
                        .addComponents(new discord_js_1.ButtonBuilder()
                        .setCustomId('OpenPack')
                        .setLabel('Open!')
                        .setStyle(discord_js_1.ButtonStyle.Primary));
                    console.log(`Sending ${pack.Name} to server with id: ${server.id} (${guild.name})`);
                    const permissions = channel.guild.members.me?.permissionsIn(channel);
                    if (permissions === undefined) {
                        return;
                    }
                    if (permissions.has("SendMessages") && permissions.has("ViewChannel")) {
                        channel.send({
                            components: [row],
                            embeds: [packEmbed],
                            files: [`./img/packs/${img}`]
                        }).then(async (message) => {
                            const newMessage = new MessageInfo_1.RandomPackMessage(message.id, server.id, pack.Name, pack.PigCount, pack.Set, pack.Tags, false);
                            (0, MessageInfo_1.AddMessageInfoToCache)(newMessage, db);
                        });
                    }
                    else {
                        console.log(`Not enough permissions to send messages in ${server.id} (${guild.name})`);
                        const channelName = channel.name;
                        const serverName = guild.name;
                        const ownerId = guild.ownerId;
                        const owner = client.users.cache.get(ownerId);
                        const errorEmbed = (0, Errors_1.MakeErrorEmbed)("Pig dealer is missing permissions", "Pig dealer doesn't have enough permissions for", `the ${channelName} in the ${serverName} server.`);
                        if (owner === undefined) {
                            console.log(`No owner has been found`);
                        }
                        else {
                            await owner.send({
                                embeds: [errorEmbed]
                            });
                        }
                    }
                }
            });
        }
        catch (error) {
        }
    });
}
const PackDropper = function (client, db) {
    setTimeout(async () => {
        DropPack(client, db);
    }, 1000 * 5);
    setInterval(async () => {
        await DropPack(client, db);
    }, 1000 * 60 * 10);
};
exports.PackDropper = PackDropper;
