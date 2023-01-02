import { EmbedBuilder } from "@discordjs/builders";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, GuildChannel } from "discord.js";
import { GetMessageInfo, PigGalleryMessage } from "../database/MessageInfo";
import { GetPig } from "../database/Pigs";
import { MakeErrorEmbed } from "../Utils/Errors";
import { Button } from "../Button";
import { AddPigRenderToEmbed } from "../Utils/PigRenderer";
import { DoesPigIdHaveUniqueEvent, TriggerUniquePigEvent } from "../uniquePigEvents/UniquePigEvents";
import { LogError, PrintChannel, PrintServer } from "../Utils/Log";


export const NextGallery = new Button("GalleryNext",
    async (interaction) => {
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

        if(msgInfo.CurrentPig == msgInfo.Pigs.length - 1){ return; }

        const pigToLoad = msgInfo.Pigs[msgInfo.CurrentPig+1];

        msgInfo.CurrentPig++;

        if(message.embeds[0] === undefined){
            LogError(`Couldn't get embed from message in channel ${PrintChannel(interaction.channel as any as GuildChannel)} in server ${PrintServer(server)}`)
            const errorEmbed = MakeErrorEmbed(`Couldn't get embed from message`, `Make sure the bot is able to send embeds`);
            interaction.followUp({
                embeds: [errorEmbed]
            });
            return;
        }

        const editedEmbed = new EmbedBuilder(message.embeds[0].data)
            .setDescription(`${msgInfo.CurrentPig+1}/${msgInfo.Pigs.length}`);

        const pig = GetPig(pigToLoad);

        if(pig === undefined){
            const errorEmbed = MakeErrorEmbed(
                "Couldn't fetch pig",
                `Server: ${server.id}`,
                `Message: ${message.id}`,
                `Pig to Load: ${pigToLoad}`
            )

            await interaction.followUp({
                embeds: [errorEmbed]
            });

            return;
        }

        const imgPath = AddPigRenderToEmbed(editedEmbed, {
            pig: pig,
            new: msgInfo.NewPigs.includes(pig.ID),
            showId: !DoesPigIdHaveUniqueEvent(pigToLoad)
        });

        const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('GalleryPrevious')
                .setLabel('Previous')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(false),
            new ButtonBuilder()
                .setCustomId('GalleryNext')
                .setLabel('Next')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(msgInfo.CurrentPig == msgInfo.Pigs.length - 1)
        );

        await message.edit({
            embeds: [editedEmbed],
            files: [imgPath],
            components: [row]
        });

        if(!msgInfo.SeenPigs.includes(msgInfo.CurrentPig)){
            msgInfo.SeenPigs.push(msgInfo.CurrentPig);
            TriggerUniquePigEvent(pigToLoad, interaction);
        }
    }
);