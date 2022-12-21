import { SlashCommandBuilder, EmbedBuilder, CommandInteractionOptionResolver } from "discord.js";
import { Command } from "../Command";
import { GetPig } from "../database/Pigs";
import { AddPigRenderToEmbed } from "../Utils/PigRenderer";


export const TestPig = new Command(
    new SlashCommandBuilder()
    .setName("testpig")
    .addStringOption(option =>
		option.setName('id')
			.setDescription('Pig id')
			.setRequired(true))
    .setDescription("pig"),

    async (_, interaction, db) => {
        const rawId = (interaction.options as CommandInteractionOptionResolver).getString('id')
        let id: string = "0"
        if(rawId !== null){
            id = rawId.toString();
        }

        const pig = GetPig(id);

        if(pig === undefined){
            const pigEmbed = new EmbedBuilder()
                .setTitle("No pig found")
                .setDescription("Yikes, you sure the id is right");

            await interaction.followUp({
                ephemeral: true,
                embeds: [pigEmbed],
            });

            return;
        }

        const pigEmbed = new EmbedBuilder()
            .setTitle("Here's your pig");

        const img = AddPigRenderToEmbed(pigEmbed, pig, false);

        await interaction.followUp({
            ephemeral: true,
            embeds: [pigEmbed],
            files: [img]
        });
    }
);