import { SlashCommandBuilder, EmbedBuilder, CommandInteractionOptionResolver } from "discord.js";
import { Command } from "../Command";
import { GetPig } from "../database/Pigs";
import { AddPigRenderToEmbed } from "../Utils/PigRenderer";


export const TestPig = new Command(
    "",
    "",
    false,
    false,
    new SlashCommandBuilder()
    .setName("testpig")
    .addStringOption(option =>
		option.setName('id')
			.setDescription('Pig id')
			.setRequired(true))
    .setDescription("pig"),

    async (interaction) => {
        const options = (interaction.options as CommandInteractionOptionResolver)
        const rawId = options.getString('id', true)
        const id = rawId.toString();

        const pig = GetPig(id);

        if(pig === undefined){
            const pigEmbed = new EmbedBuilder()
                .setTitle("No pig found")
                .setDescription("Yikes, you sure the id is right");

            await interaction.reply({
                ephemeral: true,
                embeds: [pigEmbed],
            });

            return;
        }

        const pigEmbed = new EmbedBuilder()
            .setTitle("Here's your pig");

        const img = AddPigRenderToEmbed(pigEmbed, {pig: pig});

        await interaction.reply({
            embeds: [pigEmbed],
            files: [img]
        });
    }
);