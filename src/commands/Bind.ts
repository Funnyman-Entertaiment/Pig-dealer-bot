import { SlashCommandBuilder, EmbedBuilder, CommandInteractionOptionResolver, CommandInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle, Colors } from "discord.js";
import { collection, getDocs, query } from "firebase/firestore/lite";
import { AddPigRenderToEmbed } from "../Utils/PigRenderer";
import { Command } from "../Command";
import { GetPig } from "../database/Pigs";
import { AddMessageInfoToCache, PigGalleryMessage } from "../database/MessageInfo";
import { LogError, LogInfo, PrintUser } from "../Utils/Log";

function GetAuthor(interaction: CommandInteraction){
    if(interaction.user === null){
        return null;
    }

    const user = interaction.user;
    const username = user.username;
    const avatar = user.avatarURL();
    
    return {name: username, iconURL: avatar === null? "" : avatar}
}

export const ShowBinder = new Command(
    new SlashCommandBuilder()
        .setName("binder")
        .addUserOption(option =>
            option.setName('user')
                .setDescription('user to check the binder of'))
        .setDescription("Let's you check your own or someone else's pig binder"),

    async (_, interaction, db) => {
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

        const pigsQuery = query(collection(db, `serverInfo/${server.id}/users/${userId}/pigs`));
        const pigs = await getDocs(pigsQuery);

        if(pigs.empty){
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

        const pigsSet: string[] = [];

        pigs.forEach(pig =>{
            if(!pigsSet.includes(pig.data().PigId)){
                pigsSet.push(pig.data().PigId);
            }
        })

        pigsSet.sort((a, b) => {
            return parseInt(a) - parseInt(b);
        })

        const firstPigId = pigsSet[0];
        const firstPig = GetPig(firstPigId);

        if(firstPig === undefined){
            LogError(`Couldn't find the first pig in the binder (${firstPigId})`);
            return;
        }

        const openedPackEmbed = new EmbedBuilder()
            .setTitle(`${author.name}'s pig bind`)
            .setDescription(`1/${pigsSet.length}`)
            .setAuthor(author);

        const imgPath = AddPigRenderToEmbed(openedPackEmbed, firstPig, false, true);

        const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('GalleryPrevious')
                .setLabel('Previous')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('GalleryNext')
                .setLabel('Next')
                .setStyle(ButtonStyle.Primary)
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
                pigsSet,
                [],
                [],
                interaction.user.id
            );

            AddMessageInfoToCache(newMessage, db);
        });

        console.log("\n");
    }
);