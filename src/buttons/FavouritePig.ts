import { EmbedBuilder, Colors, GuildChannel, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { Button } from "../Button";
import { MakeErrorEmbed } from "../Utils/Errors";
import { GetMessageInfo, PigGalleryMessage } from "../database/MessageInfo";
import { GetUserInfo } from "../database/UserInfo";
import { LogError, PrintChannel, PrintServer } from "../Utils/Log";
import { AddPigRenderToEmbed } from "../Utils/PigRenderer";
import { GetPig } from "../database/Pigs";
import { DoesPigIdHaveUniqueEvent } from "../uniquePigEvents/UniquePigEvents";
import { GetServerInfo } from "../database/ServerInfo";

export const FavouritePig = new Button(
    "FavouritePig",
    true,
    true,
    true,
    async function (interaction, serverInfo, messageInfo, userInfo) {
        if (serverInfo === undefined) { return; }
        if (messageInfo === undefined) { return; }
        if (userInfo === undefined) { return; }

        const server = interaction.guild;
        if (server === null) { return; }
        const message = interaction.message;
        const msgInfo = messageInfo as PigGalleryMessage;
        if (msgInfo === undefined) { return; }

        await interaction.deferUpdate();

        const currentPigID = msgInfo.Pigs[msgInfo.CurrentPig];

        if (!msgInfo.FavouritePigs.includes(currentPigID)) {
            msgInfo.FavouritePigs.push(currentPigID);
        }
        if (!userInfo.FavouritePigs.includes(currentPigID)) {
            userInfo.FavouritePigs.push(currentPigID);
        }

        if (message.embeds[0] === undefined) {
            LogError(`Couldn't get embed from message in channel ${PrintChannel(interaction.channel as any as GuildChannel)} in server ${PrintServer(server)}`)
            const errorEmbed = MakeErrorEmbed(`Couldn't get embed from message`, `Make sure the bot is able to send embeds`);
            interaction.followUp({
                embeds: [errorEmbed]
            });
            return;
        }

        const editedEmbed = new EmbedBuilder(message.embeds[0].data);

        const pig = GetPig(currentPigID);

        if (pig === undefined) {
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
            safe: serverInfo.SafeMode,
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

        if (msgInfo.ShowFavouriteButton) {
            if (!msgInfo.FavouritePigs.includes(pig.ID)) {
                row.addComponents(
                    new ButtonBuilder()
                        .setCustomId('FavouritePig')
                        .setLabel('Favourite ⭐')
                        .setStyle(ButtonStyle.Secondary)
                );
            } else {
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