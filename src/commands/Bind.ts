import { SlashCommandBuilder, EmbedBuilder, CommandInteractionOptionResolver, CommandInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { collection, doc, getDoc, getDocs, query, setDoc } from "firebase/firestore/lite";
import { AddPigRenderToEmbed } from "../Utils/PigRenderer";
import { Command } from "../Command";

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

        const user = (interaction.options as CommandInteractionOptionResolver).getUser('user')

        let userId: string;
        let author: {name: string, iconURL: string} | null;

        if(user === null){
            author = GetAuthor(interaction);

            if(author === null){
                return;
            }
            userId = interaction.user.id;
        }else{
            userId = user.id;
            const username = user.username;
            const avatar = user.avatarURL();
    
            author = {name: username, iconURL: avatar === null? "" : avatar}
        }

        const pigsQuery = query(collection(db, `serverInfo/${server.id}/users/${interaction.user.id}/pigs`))
        const pigs = await getDocs(pigsQuery);

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
        const firstPigDoc = doc(db, `pigs/${firstPigId}`);
        const firstPig = await getDoc(firstPigDoc);

        const openedPackEmbed = new EmbedBuilder()
            .setTitle(`${author.name}'s pig bind`)
            .setDescription(`1/${pigsSet.length}`)
            .setAuthor(author);

        const imgPath = AddPigRenderToEmbed(openedPackEmbed, firstPig, false);

        if(imgPath === undefined){ return; }

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
            const messageDoc = doc(db, `serverInfo/${server.id}/messages/${message.id}`);

            setDoc(messageDoc, {
                Type: "PigGallery",
                Pigs: pigsSet,
                NewPigs: [],
                CurrentPig: 0,
                User: interaction.user.id
            });
        });
    }
);