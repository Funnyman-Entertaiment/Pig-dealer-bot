import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, Client, EmbedBuilder } from "discord.js";
import { getDocs, query, collection, Firestore, where, doc, setDoc } from "firebase/firestore/lite"
import { COLOR_PER_PACK_RARITY } from "../Constants/ColorPerPackRarity";


export const PackDropper = function (client: Client, db: Firestore) {
    setInterval(async () => {
        const q = query(collection(db, "serverInfo"));
        const servers = await getDocs(q);

        servers.forEach(server => {
            client.channels.fetch(server.data().Channel).then(async channel => {
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

                const possiblePacks: any[] = [];

                packs.forEach(pack => {
                    possiblePacks.push({
                        id: pack.id,
                        data: pack.data()
                    });
                });

                var pack = possiblePacks[Math.floor(Math.random()*possiblePacks.length)];

                if(channel.type === ChannelType.GuildText){
                    let img = `${pack.id}.png`;

                    const packEmbed = new EmbedBuilder()
                        .setTitle(`A ${pack.data.Name} HAS APPEARED!`)
                        .setImage(`attachment://${img}`)
                        .setColor(COLOR_PER_PACK_RARITY[pack.data.Rarity as string]);

                    const row = new ActionRowBuilder<ButtonBuilder>()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('OpenPack')
                                .setLabel('Open!')
                                .setStyle(ButtonStyle.Primary),
                        );

                    channel.send({
                        components: [row],
                        embeds: [packEmbed],
                        files: [`./img/packs/${img}`]
                    }).then(message => {
                        const messageDoc = doc(db, `serverInfo/${server.id}/messages/${message.id}`)

                        setDoc(messageDoc, {
                            Type: "RandomPack",
                            Name: pack.data.Name,
                            PigCount: pack.data.PigCount,
                            Set: pack.data.Set,
                            Tags: pack.data.Tags,
                            Opened: false,
                        })
                    })
                }
            });
        });
    }, 1000 * 60 * 15);
}