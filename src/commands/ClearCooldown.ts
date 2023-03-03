import { Colors, CommandInteractionOptionResolver, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { Command } from "../Command";
import { GetUserInfo } from "../database/UserInfo";

export const ClearCooldown = new Command(
    "",
    "",
    false,
    false,
    new SlashCommandBuilder()
        .setName("clearcooldown")
        .addStringOption(option =>
            option.setName('user')
                .setDescription('user to check the cooldown of')
                .setRequired(true))
        .setDescription("Clears the pack opening cooldown of a user")
        .setDMPermission(false),

    async function(interaction){
        const options = interaction.options as CommandInteractionOptionResolver;
        const userID = options.getString("user", true);

        const userInfo = await GetUserInfo(userID);

        if(userInfo === undefined){
            const errorEmbed = new EmbedBuilder()
                .setTitle("User not found in database")
                .setColor(Colors.Red);

            interaction.reply({
                embeds: [errorEmbed]
            });

            return;
        }

        userInfo.LastTimeOpened = undefined;
        userInfo.LastTimeOpened2Pack = undefined;

        const successEmbed = new EmbedBuilder()
            .setTitle("User's cooldown has been reset")
            .setColor(Colors.Green);

        interaction.reply({
            embeds: [successEmbed]
        });
    }
);