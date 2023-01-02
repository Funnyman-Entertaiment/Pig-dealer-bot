import { SlashCommandBuilder, EmbedBuilder, CommandInteractionOptionResolver, ActionRowBuilder, ButtonBuilder, ButtonStyle, Colors } from "discord.js";
import { AddPigRenderToEmbed } from "../Utils/PigRenderer";
import { Command } from "../Command";
import { GetPig } from "../database/Pigs";
import { AddMessageInfoToCache, PigGalleryMessage } from "../database/MessageInfo";
import { LogError, LogInfo, PrintUser } from "../Utils/Log";
import { GetUserInfo, UserInfo } from "../database/UserInfo";
import { GetAuthor } from "../Utils/GetAuthor";

function GetUserPigs(userInfo?: UserInfo) {
    if(userInfo === undefined){ return []; }
    const userPigs: string[] = [];
    for (const pigId in userInfo.Pigs) {
        userPigs.push(pigId);
    }
    return userPigs;
}

export const ShowBinder = new Command(
    new SlashCommandBuilder()
        .setName("binder")
        .addUserOption(option =>
            option.setName('user')
                .setDescription('user to check the binder of'))
        .setDescription("Let's you check your own or someone else's pig binder")
        .setDMPermission(false),

    async (interaction) => {
        await interaction.deferReply();

        const server = interaction.guild;
        if(server === null) { return; }

        const user = (interaction.options as CommandInteractionOptionResolver).getUser('user');

        let userId: string;
        let author: {name: string, iconURL: string} | null;

        if(user === null){
            LogInfo(`User ${PrintUser(interaction.user)} is checking its own binder`)
            author = GetAuthor(interaction);

            if(author === null){
                return;
            }
            userId = interaction.user.id;
        }else{
            LogInfo(`User ${PrintUser(interaction.user)} is checking the binder of ${PrintUser(interaction.user)}`)
            userId = user.id;
            const username = user.username;
            const avatar = user.avatarURL();
    
            author = {name: username, iconURL: avatar === null? "" : avatar};
        }

        const userInfo = await GetUserInfo(userId);
        const pigs = GetUserPigs(userInfo);

        if(pigs.length === 0){
            const emptyEmbed = new EmbedBuilder()
                .setAuthor(author)
                .setColor(Colors.DarkRed)
                .setTitle("This user has no pigs!")
                .setDescription("Open some packs, loser");

            await interaction.followUp({
                embeds: [emptyEmbed]
            });
            return;
        }

        pigs.sort((a, b) =>{
            try{
                const numA = parseInt(a);
                const numB = parseInt(b);

                return numA - numB;
            } catch {
                return a.localeCompare(b);
            }
        });

        const firstPigId = pigs[0];
        const firstPig = GetPig(firstPigId);

        if(firstPig === undefined){
            LogError(`Couldn't find the first pig in the binder (${firstPigId})`);
            return;
        }

        const openedPackEmbed = new EmbedBuilder()
            .setTitle(`${author.name}'s pig bind`)
            .setDescription(`1/${pigs.length}`)
            .setAuthor(author);

        const imgPath = AddPigRenderToEmbed(openedPackEmbed, {
            pig: firstPig,
            count: userInfo?.Pigs[firstPig.ID]?? 1
        });

        const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('GalleryPrevious')
                .setLabel('Previous')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(true),
            new ButtonBuilder()
                .setCustomId('GalleryNext')
                .setLabel('Next')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(pigs.length === 1)
        );

        await interaction.followUp({
            embeds: [openedPackEmbed],
            components: [row],
            files: [imgPath]
        }).then(message => {
            const newMessage = new PigGalleryMessage(
                message.id,
                server.id,
                0,
                userInfo === undefined? {}: userInfo.Pigs,
                pigs,
                [],
                [],
                interaction.user.id
            );

            AddMessageInfoToCache(newMessage);
        });

        console.log("\n");
    }
);