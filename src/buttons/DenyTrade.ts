import { GetMessageInfo, PigTradeMessage, RemoveMessageInfoFromCache } from "../database/MessageInfo";
import { Button } from "../Button";
import { MakeErrorEmbed } from "../Utils/Errors";
import { EmbedBuilder } from "@discordjs/builders";
import { Colors } from "discord.js";

export const DenyTrade = new Button("CancelTrade",
    async (interaction) => {
        const server = interaction.guild;
        if(server === null){return;}
        const message = interaction.message;
        const user = interaction.user;

        const msgInfo = GetMessageInfo(server.id, message.id) as PigTradeMessage | undefined;

        if(msgInfo === undefined){
            const errorEmbed = new EmbedBuilder()
                .setTitle("This message has expired")
                .setDescription("Trade messages expire after ~15 minutes of being created.\nA message may also expire if the bot has been internally reset (sorry!).")
                .setColor(Colors.Red);
            
            interaction.reply({
                embeds: [errorEmbed],
                ephemeral: true
            });
    
            return;
        }

        if(msgInfo.Type !== "PigTrade"){ return; }
        if(msgInfo.User !== user.id){ return; }

        interaction.deferUpdate();

        RemoveMessageInfoFromCache(msgInfo);

        const embed = message.embeds[0];

        if(embed === undefined){
            const errorEmbed = MakeErrorEmbed("Couldn't retreive the embed for this message!");
            interaction.followUp({
                embeds: [errorEmbed]
            });
        }

        const editedEmbed = new EmbedBuilder(embed.data)
            .setDescription(`The trade has been cancelled by ${user.username}`)
            .setColor(Colors.Red);

        message.edit({
            embeds: [editedEmbed],
            components: []
        });
    }
);