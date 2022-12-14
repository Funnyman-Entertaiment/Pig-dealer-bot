import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, Client, EmbedBuilder } from "discord.js";
import { getDocs, query, collection, Firestore, where } from "firebase/firestore/lite"
import { AddMessageInfoToCache, RandomPackMessage } from "../database/MessageInfo";
import { COLOR_PER_PACK_RARITY } from "../Constants/ColorPerPackRarity";
import { CreatePackFromData, Pack } from "../database/Packs";
import { MakeErrorEmbed } from "../Utils/Errors";


async function DropPack(client: Client, db: Firestore) {
    const q = query(collection(db, "serverInfo"));
    const servers = await getDocs(q);

    servers.forEach(async server => {
        if (server.data().Channel === undefined) { return; }

        try {
            await client.channels.fetch(server.data().Channel).then(async channel => {
                if (channel === null) { return; }

                //Get Random pack
                let chosenRarity: string = "Default";

                if (Math.random() <= 0.08) {
                    const packChance = Math.random();

                    if (packChance <= 0.7) {
                        chosenRarity = "Common";
                    } else if (packChance <= 0.9) {
                        chosenRarity = "Rare"
                    } else {
                        chosenRarity = "Super Rare"
                    }
                }

                const packQuery = query(collection(db, "packs"), where("Rarity", "==", chosenRarity));
                const packs = await getDocs(packQuery);

                const possiblePacks: Pack[] = [];

                packs.forEach(pack => {
                    possiblePacks.push(CreatePackFromData(pack.id, pack.data()))
                });

                var pack = possiblePacks[Math.floor(Math.random() * possiblePacks.length)];

                if (channel.type === ChannelType.GuildText) {
                    let img = `${pack.ID}.png`;

                    const packEmbed = new EmbedBuilder()
                        .setTitle(`A ${pack.Name} HAS APPEARED!`)
                        .setImage(`attachment://${img}`)
                        .setColor(COLOR_PER_PACK_RARITY[pack.Rarity]);

                    const row = new ActionRowBuilder<ButtonBuilder>()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('OpenPack')
                                .setLabel('Open!')
                                .setStyle(ButtonStyle.Primary),
                        );

                    console.log(`Sending ${pack.Name} to server with id: ${server.id}`);

                    const permissions = channel.guild.members.me?.permissionsIn(channel);

                    if(permissions === undefined){ return; }

                    if(permissions.has("SendMessages") && permissions.has("ViewChannel")){
                        channel.send({
                            components: [row],
                            embeds: [packEmbed],
                            files: [`./img/packs/${img}`]
                        }).then(async message => {
                            const newMessage = new RandomPackMessage(
                                message.id,
                                server.id,
                                pack.Name,
                                pack.PigCount,
                                pack.Set,
                                pack.Tags,
                                false
                            );

                            AddMessageInfoToCache(newMessage, db);
                        });
                    }else{
                        console.log(`Not enough permissions to send messages in ${server.id}`);

                        const channelName = channel.name;
                        const serverName = channel.guild.name;

                        const ownerId = channel.guild.ownerId;
                        const owner = client.users.cache.get(ownerId);

                        const errorEmbed = MakeErrorEmbed(
                            "Pig dealer is missing permissions",
                            "Pig dealer doesn't have enough permissions for",
                            `the ${channelName} in the ${serverName} server.`
                        );

                        if(owner === undefined){
                            console.log(`No owner has been found`);
                        }else{
                            await owner.send({
                                embeds: [errorEmbed]
                            });
                        }
                    }
                }
            });
        } catch (error) {
            //console.log("THIS ERROR ISN'T REAL: " + error);
        }
    });
}


export const PackDropper = function (client: Client, db: Firestore) {
    setTimeout(async () => {
        DropPack(client, db);
    }, 1000 * 5);

    setInterval(async () => {
        await DropPack(client, db);
    }, 1000 * 60 * 10);
}