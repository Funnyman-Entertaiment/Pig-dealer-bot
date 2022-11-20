import { ChannelType, Client, EmbedBuilder } from "discord.js";
import { getDocs, query, collection, Firestore, where } from "firebase/firestore/lite"


export const PackDropper = function (client: Client, db: Firestore) {
    setInterval(async () => {
        const q = query(collection(db, "serverInfo"));
        const servers = await getDocs(q);

        servers.forEach(server => {
            client.channels.fetch(server.data().Channel).then(async channel => {
                if(channel === null){ return; }

                //Get Random pack
                const packChance = Math.random();
                let chosenRarity: string;

                if(packChance <= 0.7){
                    chosenRarity = "Common";
                }else if(packChance <= 0.9){
                    chosenRarity = "Rare"
                }else{
                    chosenRarity = "Super Rare"
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
                        .setTitle(pack.data.Name)
                        .setImage(`attachment://${img}`);

                    channel.send({
                        embeds: [packEmbed],
                        files: [`./img/packs/${img}`]
                    })
                }
            });
        });
    }, 5000);
}