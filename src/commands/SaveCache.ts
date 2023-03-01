import { Colors, CommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { Command } from "../Command";
import { SaveAllUserInfo } from "../database/UserInfo";
import { SaveAllServerInfo } from "../database/ServerInfo";

export const SaveCache = new Command(
    "",
    "",
    false,
    false,
    new SlashCommandBuilder()
        .setName("savecache")
        .setDescription("Saves all cache to the db"),

    async (interaction: CommandInteraction) => {
        await interaction.deferReply();

        SaveAllServerInfo();
        SaveAllUserInfo();
        
        const successEmbed = new EmbedBuilder()
            .setTitle("Caches saved correctly")
            .setColor(Colors.Green);

        await interaction.followUp({
            embeds: [successEmbed]
        });
    }
);