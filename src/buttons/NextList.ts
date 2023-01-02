import { ActionRowBuilder, ButtonBuilder, ComponentType, EmbedBuilder, GuildChannel } from "discord.js";
import { Button } from "../Button";
import { MakeErrorEmbed } from "../Utils/Errors";
import { LogError, PrintChannel, PrintServer } from "../Utils/Log";
import { AddPigListRenderToEmbed } from "../Utils/PigRenderer";
import { GetMessageInfo, PigListMessage } from "../database/MessageInfo";
import { GetPig, Pig } from "../database/Pigs";

export const NextList = new Button("ListNext",
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
        const msgInfo = GetMessageInfo(server.id, message.id) as PigListMessage;

        if(msgInfo === undefined || msgInfo.Type !== "PigList"){ return; }

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

        if(message.embeds[0] === undefined){
            LogError(`Couldn't get embed from message in channel ${PrintChannel(interaction.channel as any as GuildChannel)} in server ${PrintServer(server)}`)
            const errorEmbed = MakeErrorEmbed(`Couldn't get embed from message`, `Make sure the bot is able to send embeds`);
            interaction.followUp({
                embeds: [errorEmbed]
            });
            return;
        }

        msgInfo.CurrentPage++;

        const pigList = msgInfo.PigsBySet[msgInfo.CurrentSet];

        const pageStart = msgInfo.CurrentPage * 9;
        const pageEnd = Math.min(pigList.length, msgInfo.CurrentPage * 9 + 9);

        if(pageStart >= pigList.length){
            msgInfo.CurrentPage--;
            return;
        }

        const editedEmbed = new EmbedBuilder(message.embeds[0].data);

        const firstPigsPage = pigList.slice(pageStart, pageEnd);
        AddPigListRenderToEmbed(editedEmbed, {
            pigs: firstPigsPage.map(id => GetPig(id)).filter(pig => pig !== undefined) as any as Pig[],
            pigCounts: msgInfo.PigCounts
        });

        const originalRow = message.components[0];
        const newRow = new ActionRowBuilder<ButtonBuilder>(message.components[0].data);

        originalRow.components.forEach(component => {
            if(component.customId === "ListNext"){
                newRow.addComponents([
                    new ButtonBuilder(component.data)
                        .setDisabled(pageEnd === pigList.length)
                ]);
            }else if(component.customId === "ListPrevious"){
                newRow.addComponents([
                    new ButtonBuilder(component.data)
                        .setDisabled(false)
                ]);
            }else{
                newRow.addComponents([
                    new ButtonBuilder(component.data)
                ]);
            }
        });

        await message.edit({
            embeds: [editedEmbed],
            components: [newRow]
        });
    }
);