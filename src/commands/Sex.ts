import { Client, CommandInteraction, SlashCommandBuilder } from "discord.js";
import { GetMsgInfoCacheForServer } from "../database/MessageInfo";
import { Command } from "../Command";

export const Sex = new Command(
    new SlashCommandBuilder()
    .setName("sex2")
    .setDescription("sex"),

    async (_client: Client, interaction: CommandInteraction) => {
        const content = `I'm not having sex with you right now ${interaction.user.username}.`;

        const server = interaction.guild;
        if(server !== null){
            console.log(GetMsgInfoCacheForServer(server.id).Elements);
        }

        await interaction.followUp({
            ephemeral: true,
            content
        });
    }
);