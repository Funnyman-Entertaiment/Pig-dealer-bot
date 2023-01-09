import { GetUserInfo, UserInfo, AddUserInfosToCache } from "../database/UserInfo";
import { Button } from "../Button";
import { GetMessageInfo, PigTradeMessage, RemoveMessageInfoFromCache } from "../database/MessageInfo";
import { MakeErrorEmbed } from "../Utils/Errors";
import { EmbedBuilder } from "@discordjs/builders";
import { Colors } from "discord.js";
import { CheckAndSendAssemblyPigEmbeds } from "../Utils/AssemblyyPigs";
import { GetPig, Pig } from "../database/Pigs";

function RemoveOfferedPigsFromUser(userInfo: UserInfo, pigOffer: {[key: string]: number}){
    let hasAddedPig = false;
    for (const pigID in pigOffer) {
        hasAddedPig = true;

        const pigAmount = pigOffer[pigID];
        
        const originalAmount = userInfo.Pigs[pigID];

        userInfo.Pigs[pigID] = Math.max(0, originalAmount - pigAmount);

        if(userInfo.Pigs[pigID] <= 0){
            delete userInfo.Pigs[pigID];
        }
    }

    return hasAddedPig;
} 

function AddOfferedPigsToUser(userInfo: UserInfo, pigOffer: {[key: string]: number}){
    const pigsAdded: Pig[] = [];
    for (const pigID in pigOffer) {
        const pigAmount = pigOffer[pigID];
        
        const originalAmount = userInfo.Pigs[pigID]?? 0;

        userInfo.Pigs[pigID] = originalAmount + pigAmount;

        if(!pigsAdded.some(pig => pig.ID === pigID)){
            const pig = GetPig(pigID);
            if(pig !== undefined){
                pigsAdded.push(pig);
            }
        }
    }
    return pigsAdded;
} 

export const AcceptTrade = new Button("AcceptTrade",
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

        const starterInfo = await GetUserInfo(msgInfo.TradeStarterID) ?? new UserInfo(
            msgInfo.TradeStarterID,
            [],
            {},
            false
        );
        const receiverInfo = await GetUserInfo(msgInfo.TradeReceiverID) ?? new UserInfo(
            msgInfo.TradeReceiverID,
            [],
            {},
            false
        );
        await AddUserInfosToCache([starterInfo, receiverInfo]);

        const hasAddedPigToStarter = RemoveOfferedPigsFromUser(starterInfo, msgInfo.TradeStarterOffer);
        const hasAddedPigToReceiver = RemoveOfferedPigsFromUser(receiverInfo, msgInfo.TradeReceiverOffer);

        const pigsAddedToStarter = AddOfferedPigsToUser(starterInfo, msgInfo.TradeReceiverOffer);
        const pigsAddedToReceiver = AddOfferedPigsToUser(receiverInfo, msgInfo.TradeStarterOffer);

        RemoveMessageInfoFromCache(msgInfo);

        CheckAndSendAssemblyPigEmbeds(server.id, msgInfo.TradeStarterID, pigsAddedToStarter);
        CheckAndSendAssemblyPigEmbeds(server.id, msgInfo.TradeReceiverID, pigsAddedToReceiver);

        const embed = message.embeds[0];

        if(embed === undefined){
            const errorEmbed = MakeErrorEmbed(
                `Couldn't retrieve the embed from the trade message`,
                `Make sure the bot is able to send embeds in this server`,
                `(The trade has been succesful anyways)`
            );

            interaction.reply({
                embeds: [errorEmbed]
            });
        }

        const editedEmbed = new EmbedBuilder(embed.data)
            .setColor(Colors.Green);

        if(hasAddedPigToReceiver || hasAddedPigToStarter){
            editedEmbed.setDescription("The pigs have been succesfully traded!");
        }else{
            editedEmbed.setDescription("Trade done, but what did you accomplish with this");
        }

        message.edit({
            embeds: [editedEmbed],
            components: []
        })
    }
);