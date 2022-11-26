"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PackDropper = void 0;
const discord_js_1 = require("discord.js");
const lite_1 = require("firebase/firestore/lite");
const ColorPerPackRarity_1 = require("../Constants/ColorPerPackRarity");
const PackDropper = function (client, db) {
    setInterval(async () => {
        const q = (0, lite_1.query)((0, lite_1.collection)(db, "serverInfo"));
        const servers = await (0, lite_1.getDocs)(q);
        servers.forEach(server => {
            client.channels.fetch(server.data().Channel).then(async (channel) => {
                if (channel === null) {
                    return;
                }
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
                    possiblePacks.push({
                        id: pack.id,
                        data: pack.data()
                    });
                });
                var pack = possiblePacks[Math.floor(Math.random() * possiblePacks.length)];
                if (channel.type === discord_js_1.ChannelType.GuildText) {
                    let img = `${pack.id}.png`;
                    const packEmbed = new discord_js_1.EmbedBuilder()
                        .setTitle(`A ${pack.data.Name} HAS APPEARED!`)
                        .setImage(`attachment://${img}`)
                        .setColor(ColorPerPackRarity_1.COLOR_PER_PACK_RARITY[pack.data.Rarity]);
                    const row = new discord_js_1.ActionRowBuilder()
                        .addComponents(new discord_js_1.ButtonBuilder()
                        .setCustomId('OpenPack')
                        .setLabel('Open!')
                        .setStyle(discord_js_1.ButtonStyle.Primary));
                    channel.send({
                        components: [row],
                        embeds: [packEmbed],
                        files: [`./img/packs/${img}`]
                    }).then(message => {
                        const messageDoc = (0, lite_1.doc)(db, `serverInfo/${server.id}/messages/${message.id}`);
                        (0, lite_1.setDoc)(messageDoc, {
                            Type: "RandomPack",
                            Name: pack.data.Name,
                            PigCount: pack.data.PigCount,
                            Set: pack.data.Set,
                            Tags: pack.data.Tags,
                            Opened: false,
                        });
                    });
                }
            });
        });
    }, 1000 * 60 * 15);
};
exports.PackDropper = PackDropper;
