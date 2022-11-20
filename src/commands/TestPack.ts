import { SlashCommandBuilder, EmbedBuilder, CommandInteractionOptionResolver, Colors } from "discord.js";
import { doc, getDoc } from "firebase/firestore/lite";
import { Command } from "../Command";


export const TestPack = new Command(
    new SlashCommandBuilder()
    .setName("testpack")
    .addIntegerOption(option =>
		option.setName('id')
			.setDescription('Pack id')
			.setRequired(true))
    .setDescription("pack"),

    async (_, interaction, db) => {
        const rawId = (interaction.options as CommandInteractionOptionResolver).getInteger('id')
        let id: string = "0"
        if(rawId !== null){
            id = rawId.toString();
        }
        const docRef = doc(db, "packs", id);
        const packSnap = await getDoc(docRef);
        const packData = packSnap.data();

        if(packData === undefined){
            return;
        }

        let img = `${id}.png`;

        const packEmbed = new EmbedBuilder()
            .setTitle(packData.Name)
            .setDescription(packData.Rarity)
            .setImage(`attachment://${img}`);

        await interaction.followUp({
            ephemeral: true,
            embeds: [packEmbed],
            files: [`./img/packs/${img}`]
        });
    }
);