import { SlashCommandBuilder, EmbedBuilder, CommandInteractionOptionResolver, Colors } from "discord.js";
import { Command } from "../Command";
import { GetPig } from "../database/Pigs";
import { GetUserInfo, GetUserPigIDs } from "../database/UserInfo";
import { GetAuthor } from "../Utils/GetAuthor";


export const FavouritePigCmd = new Command(
    new SlashCommandBuilder()
        .setName("favourite")
        .addStringOption(option =>
            option.setName('id')
                .setDescription('ID of the pig you wanna favourite.')
                .setRequired(true))
        .setDescription("Favourites a pig. If the pig was already favourite, it unfavourites it"),

    async function (interaction) {
        const pigID = (interaction.options as CommandInteractionOptionResolver).getString('id', true);

        const pig = GetPig(pigID);

        if (pig === undefined) {
            const errorEmbed = new EmbedBuilder()
                .setTitle("This pig doesn't exist!")
                .setColor("Red");

            interaction.reply({
                embeds: [errorEmbed],
                ephemeral: true
            });

            return;
        }

        const userInfo = await GetUserInfo(interaction.user.id);

        const userPigs = GetUserPigIDs(userInfo);

        if (userInfo === undefined || !userPigs.includes(pigID)) {
            const errorEmbed = new EmbedBuilder()
                .setTitle("You don't have this pig!")
                .setColor("Red");

            interaction.reply({
                embeds: [errorEmbed],
                ephemeral: true
            });

            return;
        }

        if (userInfo.FavouritePigs.includes(pigID)) {
            const index = userInfo.FavouritePigs.indexOf(pigID);
            userInfo.FavouritePigs.splice(index, 1);

            const successEmbed = new EmbedBuilder()
                .setTitle(`Pig #${pigID.padStart(3, '0')} succesfully unfavourited!`)
                .setColor(Colors.Green)
                .setAuthor(GetAuthor(interaction));

            interaction.reply({
                embeds: [successEmbed],
                ephemeral: true
            });
        } else {
            userInfo.FavouritePigs.push(pigID);

            const successEmbed = new EmbedBuilder()
                .setTitle(`Pig #${pigID.padStart(3, '0')} succesfully favourited!`)
                .setColor(Colors.Green)
                .setAuthor(GetAuthor(interaction));

            interaction.reply({
                embeds: [successEmbed],
                ephemeral: true
            });
        }
    }
);