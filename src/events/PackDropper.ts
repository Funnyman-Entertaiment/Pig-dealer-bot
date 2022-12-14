import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, Client, EmbedBuilder } from "discord.js";
import { getDocs, query, collection, Firestore, where, doc, setDoc } from "firebase/firestore/lite"
import { AddMessageInfoToCache, RandomPackMessage } from "../database/MessageInfo";
import { COLOR_PER_PACK_RARITY } from "../Constants/ColorPerPackRarity";
import { CreatePackFromData, Pack } from "../database/Packs";


export const PackDropper = function (client: Client, db: Firestore) {
    setTimeout(async () => {
        const q = query(collection(db, "serverInfo"));
        const servers = await getDocs(q);

        servers.forEach(async server => {
            if(server.data().Channel === undefined) { return; }

            try {
                await client.channels.fetch(server.data().Channel).then(async channel => {
                    if(channel === null){ return; }

                    //Get Random pack
                    let chosenRarity: string = "Default";

                    if(Math.random() <= 0.08){
                        const packChance = Math.random();

                        if(packChance <= 0.7){
                            chosenRarity = "Common";
                        }else if(packChance <= 0.9){
                            chosenRarity = "Rare"
                        }else{
                            chosenRarity = "Super Rare"
                        }
                    }

                    const packQuery = query(collection(db, "packs"), where("Rarity", "==", chosenRarity));
                    const packs = await getDocs(packQuery);

                    const possiblePacks: Pack[] = [];

                    packs.forEach(pack => {
                        possiblePacks.push(CreatePackFromData(pack.id, pack.data()))
                    });

                    var pack = possiblePacks[Math.floor(Math.random()*possiblePacks.length)];

                    if(channel.type === ChannelType.GuildText){
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

                        console.log(`Sending ${pack.Name} to server with id: ${server.id}`)

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
                            )
                
                            AddMessageInfoToCache(newMessage, db);
                        });
                    }
                });
            }catch(error){
                //console.log(error);
            }
        });
    }, 1000 * 60 * 10);
}