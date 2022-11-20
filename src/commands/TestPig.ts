import { SlashCommandBuilder, EmbedBuilder, CommandInteractionOptionResolver, Colors } from "discord.js";
import { doc, getDoc } from "firebase/firestore/lite";
import { Command } from "../Command";
import fs from 'fs';


export const TestPig = new Command(
    new SlashCommandBuilder()
    .setName("testpig")
    .addIntegerOption(option =>
		option.setName('id')
			.setDescription('Pig id')
			.setRequired(true))
    .setDescription("pig"),

    async (_, interaction, db) => {
        const rawId = (interaction.options as CommandInteractionOptionResolver).getInteger('id')
        let id: string = "0"
        if(rawId !== null){
            id = rawId.toString();
        }
        const docRef = doc(db, "pigs", id);
        const pigSnap = await getDoc(docRef);
        const pigData = pigSnap.data();

        if(pigData === undefined){
            return;
        }

        let img = `${id}.png`;
        if((pigData.Tags as string[]).includes("gif")){
            img = `${id}.gif`;
        }

        if(!fs.existsSync(`./img/pigs/${img}`)){
            img = `none.png`;
        }

        const pigEmbed = new EmbedBuilder()
            .setTitle(pigData.Name)
            .setDescription(pigData.Description.length > 0? pigData.Description : "...")
            .setImage(`attachment://${img}`)
            .setColor(Colors.LuminousVividPink);

        await interaction.followUp({
            ephemeral: true,
            embeds: [pigEmbed],
            files: [`./img/pigs/${img}`]
        });
    }
);