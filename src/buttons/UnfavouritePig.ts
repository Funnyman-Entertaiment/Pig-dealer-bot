import { EmbedBuilder, Colors, GuildChannel, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { Button } from "../Button";
import { MakeErrorEmbed } from "../Utils/Errors";
import { GetMessageInfo, PigGalleryMessage } from "../database/MessageInfo";
import { GetUserInfo } from "../database/UserInfo";
import { LogError, PrintChannel, PrintServer } from "../Utils/Log";
import { AddPigRenderToEmbed } from "../Utils/PigRenderer";
import { GetPig } from "../database/Pigs";
import { DoesPigIdHaveUniqueEvent } from "../uniquePigEvents/UniquePigEvents";

export const UnfavouritePig = new Button("UnfavouritePig",
    async function(interaction){
        await interaction.deferUpdate();

        const server = interaction.guild;
        if(server === null) {
            const errorEmbed = MakeErrorEmbed(
                "Error fetching server from interaction",
                "Where did you find this message?"
            );

            await interaction.followUp({
                embeds: [errorEmbed]
            });

            return;
        }

        const message = interaction.message;
        const msgInfo = GetMessageInfo(server.id, message.id) as PigGalleryMessage;

        if(msgInfo === undefined){
            const errorEmbed = new EmbedBuilder()
                .setTitle("This message has expired")
                .setDescription("Messages expire after ~3 hours of being created.\nA message may also expire if the bot has been internally reset (sorry!).")
                .setColor(Colors.Red);
            
            interaction.reply({
                embeds: [errorEmbed],
                ephemeral: true
            });
    
            return;
        }

        if(msgInfo === undefined || msgInfo.Type !== "PigGallery"){ return; }

        if(msgInfo.User === undefined){
            const errorEmbed = MakeErrorEmbed(
                "This message doesn't have an associated user",
                `Server: ${server.id}`,
                `Message: ${message.id}`
            );

            await interaction.followUp({
                embeds: [errorEmbed]
            });

            return;
        }

        if(interaction.user.id !== msgInfo.User){ return; }

        const userInfo = await GetUserInfo(interaction.user.id);

        if(userInfo === undefined){
            const errorEmbed = MakeErrorEmbed(
                "This user has no information stored",
                `User: ${userInfo}`
            );

            await interaction.followUp({
                embeds: [errorEmbed]
            });

            return;
        }
        
        const currentPigID = msgInfo.Pigs[msgInfo.CurrentPig];

        if(msgInfo.FavouritePigs.includes(currentPigID)){
            const index = msgInfo.FavouritePigs.indexOf(currentPigID);
            msgInfo.FavouritePigs.splice(index, 1);
        }
        if(userInfo.FavouritePigs.includes(currentPigID)){
            const index = userInfo.FavouritePigs.indexOf(currentPigID);
            userInfo.FavouritePigs.splice(index, 1);
        }

        if(message.embeds[0] === undefined){
            LogError(`Couldn't get embed from message in channel ${PrintChannel(interaction.channel as any as GuildChannel)} in server ${PrintServer(server)}`)
            const errorEmbed = MakeErrorEmbed(`Couldn't get embed from message`, `Make sure the bot is able to send embeds`);
            interaction.followUp({
                embeds: [errorEmbed]
            });
            return;
        }

        const editedEmbed = new EmbedBuilder(message.embeds[0].data);

        const pig = GetPig(currentPigID);

        if(pig === undefined){
            const errorEmbed = MakeErrorEmbed(
                "Couldn't fetch pig",
                `Server: ${server.id}`,
                `Message: ${message.id}`,
                `Pig to Load: ${currentPigID}`
            )

            await interaction.followUp({
                embeds: [errorEmbed]
            });

            return;
        }

        const imgPath = AddPigRenderToEmbed(editedEmbed, {
            pig: pig,
            new: msgInfo.NewPigs.includes(pig.ID),
            showId: !DoesPigIdHaveUniqueEvent(currentPigID),
            count: msgInfo.PigCounts[pig.ID],
            favourite: msgInfo.FavouritePigs.includes(pig.ID),
            shared: msgInfo.SharedPigs.includes(pig.ID)
        });
        const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('GalleryPrevious')
                .setLabel('Previous')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(msgInfo.CurrentPig === 0),
            new ButtonBuilder()
                .setCustomId('GalleryNext')
                .setLabel('Next')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(msgInfo.CurrentPig === msgInfo.Pigs.length - 1)
        );

        if(msgInfo.ShowFavouriteButton){
            if(!msgInfo.FavouritePigs.includes(pig.ID)){
                row.addComponents(
                    new ButtonBuilder()
                        .setCustomId('FavouritePig')
                        .setLabel('Favourite ⭐')
                        .setStyle(ButtonStyle.Secondary)
                );
            }else{
                row.addComponents(
                    new ButtonBuilder()
                        .setCustomId('UnfavouritePig')
                        .setLabel('Unfavourite ⭐')
                        .setStyle(ButtonStyle.Secondary)
                );
            }
        }

        await message.edit({
            embeds: [editedEmbed],
            files: [imgPath],
            components: [row]
        });
    }
);