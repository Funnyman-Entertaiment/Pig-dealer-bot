import { ActionRowBuilder, ButtonBuilder, Colors, EmbedBuilder, GuildChannel } from "discord.js";
import { Button } from "../Button";
import { MakeErrorEmbed } from "../Utils/Errors";
import { LogError, PrintChannel, PrintServer } from "../Utils/Log";
import { GetMessageInfo, PigListMessage } from "../database/MessageInfo";
import { AddPigListRenderToEmbed } from "../Utils/PigRenderer";
import { GetPig, Pig } from "../database/Pigs";

export const NextSet = new Button(
    "SetNext",
    true,
    true,
    false,
    async (interaction, serverInfo, messageInfo) => {
        if(serverInfo === undefined){ return; }
        if(messageInfo === undefined){ return; }

        await interaction.deferUpdate();

        const server = interaction.guild;
        if(server === null) { return; }

        const message = interaction.message;
        const msgInfo = messageInfo as PigListMessage;
        if(msgInfo === undefined){ return; }

        if(message.embeds[0] === undefined){
            LogError(`Couldn't get embed from message in channel ${PrintChannel(interaction.channel as any as GuildChannel)} in server ${PrintServer(server)}`)
            const errorEmbed = MakeErrorEmbed(`Couldn't get embed from message`, `Make sure the bot is able to send embeds`);
            interaction.followUp({
                embeds: [errorEmbed]
            });
            return;
        }

        const sets = [];

        for (const set in msgInfo.PigsBySet) {
            sets.push(set);
        }

        sets.sort();

        const currentSetIndex = sets.indexOf(msgInfo.CurrentSet);

        let newSet: string;
        if(currentSetIndex + 1 >= sets.length){
            newSet = sets[0];
        }else{
            newSet = sets[currentSetIndex + 1];
        }

        msgInfo.CurrentPage = 0;
        msgInfo.CurrentSet = newSet;

        const editedEmbed = new EmbedBuilder(message.embeds[0].data)
            .setDescription(`**${newSet === "-"? "Default": newSet}**`);

        const firstPigsPage = msgInfo.PigsBySet[newSet].slice(0, Math.min(msgInfo.PigsBySet[newSet].length, 9));
        AddPigListRenderToEmbed(editedEmbed, {
            pigs: firstPigsPage.map(id => GetPig(id)).filter(pig => pig !== undefined) as any as Pig[],
            safe: serverInfo.SafeMode,
            pigCounts: msgInfo.PigCounts,
            sharedPigs: msgInfo.SharedPigs,
            favouritePigs: msgInfo.FavouritePigs
        });

        const originalRow = message.components[0];
        const newRow = new ActionRowBuilder<ButtonBuilder>(message.components[0].data);

        originalRow.components.forEach(component => {
            if(component.customId === "ListNext"){
                newRow.addComponents([
                    new ButtonBuilder(component.data)
                        .setDisabled(msgInfo.PigsBySet[newSet].length <= 9)
                ]);
            }else if(component.customId === "ListPrevious"){
                newRow.addComponents([
                    new ButtonBuilder(component.data)
                        .setDisabled(true)
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