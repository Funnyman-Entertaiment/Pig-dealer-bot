import { SlashCommandBuilder, EmbedBuilder, CommandInteractionOptionResolver } from "discord.js";
import { Command } from "../Command";
import { GetPig } from "../database/Pigs";
import { AddPigRenderToEmbed } from "../Utils/PigRenderer";
import { GetUserInfo, GetUserPigIDs } from "../database/UserInfo";
import { GetAuthor } from "../Utils/GetAuthor";
import { LogInfo, PrintUser } from "../Utils/Log";


export const CheckPig = new Command(
    "CheckPig",
    "Shows a single pig in your collection",
    new SlashCommandBuilder()
    .setName("checkpig")
    .addStringOption(option =>
		option.setName('id')
			.setDescription('ID of the pig you wanna check.')
			.setRequired(true))
    .setDescription("Shows you a single pig you own."),

    async function(interaction){
        const pigID = (interaction.options as CommandInteractionOptionResolver).getString('id', true);

        const pig = GetPig(pigID);

        if(pig === undefined){
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

        if(!userPigs.includes(pigID)){
            const errorEmbed = new EmbedBuilder()
                .setTitle("You don't have this pig!")
                .setColor("Red");
            
            interaction.reply({
                embeds: [errorEmbed],
                ephemeral: true
            });

            return;
        }

        LogInfo(`User ${PrintUser(interaction.user)} is checking it's pig #${pig.ID.padStart(3, '0')}`);

        const pigEmbed = new EmbedBuilder()
            .setTitle("Here is your pig!")
            .setAuthor(GetAuthor(interaction));

        const img = AddPigRenderToEmbed(pigEmbed, {
            pig: pig,
            favourite: userInfo?.FavouritePigs.includes(pigID),
            count: userInfo?.Pigs[pigID]
        });

        interaction.reply({
            embeds: [pigEmbed],
            files: [img]
        });
    }
);