import { SlashCommandBuilder, EmbedBuilder, CommandInteractionOptionResolver } from "discord.js";
import { Command } from "../Command";
import { GetPack } from "../database/Packs";
import { COLOR_PER_PACK_RARITY } from "../Constants/ColorPerPackRarity";


export const TestPack = new Command(
    "",
    "",
    new SlashCommandBuilder()
    .setName("testpack")
    .addIntegerOption(option =>
		option.setName('id')
			.setDescription('Pack id')
			.setRequired(true))
    .setDescription("pack"),

    async (interaction) => {
        const rawId = (interaction.options as CommandInteractionOptionResolver).getInteger('id')
        let id: string = "0"
        if(rawId !== null){
            id = rawId.toString();
        }
        
        const pack = GetPack(id);

        if(pack === undefined){
            return;
        }

        let img = `${id}.png`;

        const packEmbed = new EmbedBuilder()
            .setTitle(pack.Name)
            .setDescription(pack.Rarity)
            .setImage(`attachment://${img}`)
            .setColor(COLOR_PER_PACK_RARITY[pack.Rarity]);

        await interaction.reply({
            embeds: [packEmbed],
            files: [`./img/packs/${img}`]
        });
    }
);