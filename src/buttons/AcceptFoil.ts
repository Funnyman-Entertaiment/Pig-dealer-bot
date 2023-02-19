import { EmbedBuilder, Colors, Embed } from "discord.js";
import { Button } from "../Button";
import { AddPigRenderToEmbed } from "../Utils/PigRenderer";
import { GetMessageInfo, PigFoilMessage, PigTradeMessage, RemoveMessageInfoFromCache } from "../database/MessageInfo";
import { GetAllPigs, Pig } from "../database/Pigs";
import { GetUserInfo } from "../database/UserInfo";
import { GetAuthor } from "src/Utils/GetAuthor";

function ChooseRandomPigFromList(pigs: Pig[]): Pig {
    return pigs[Math.floor(Math.random() * pigs.length)]
}

export const AcceptFoil = new Button("AcceptFoil",
    async (interaction) => {
        const server = interaction.guild;
        if(server === null){return;}
        const message = interaction.message;
        const user = interaction.user;

        const msgInfo = GetMessageInfo(server.id, message.id) as PigFoilMessage | undefined;

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

        if(msgInfo.Type !== "PigFoil"){ return; }
        if(msgInfo.User !== user.id){ return; }

        const userInfo = await GetUserInfo(user.id);
        if(userInfo === undefined){ return; }

        RemoveMessageInfoFromCache(msgInfo);

        const userPigs = userInfo.Pigs;
        const offeredPigs = msgInfo.OfferedPigs;
        let hasEnoughPigs = true
        
        for (const id in offeredPigs) {
            const offeredAmount = offeredPigs[id];
            const userAmount = userPigs[id] ?? 0;
            if(offeredAmount > userAmount){
                hasEnoughPigs = false;
            }
        }

        if(!hasEnoughPigs){
            const notEnoughPigsEmbed = new EmbedBuilder()
                .setTitle("You don't have enough pigs!")
                .setDescription("Did you complete a trade before crafting this foil?")
                .setAuthor({
                    name: user.username,
                    iconURL: user.avatarURL() ?? user.defaultAvatarURL
                })
                .setColor(Colors.DarkRed);

            message.edit({
                embeds: [notEnoughPigsEmbed]
            });

            return;
        }

        for (const id in offeredPigs) {
            const offeredAmount = offeredPigs[id];
            const userAmount = userPigs[id] ?? 0;

            const newAmount = userAmount - offeredAmount;
            if(newAmount <= 0){
                delete userPigs[id];
            }else{
                userPigs[id] = newAmount;
            }
        }

        const pigs = GetAllPigs();
        const pigsOfSet = pigs.filter(pig => pig.Set.toLowerCase().trim() === msgInfo.Set.toLowerCase().trim());
        const pigsOfSetAndRarity = pigsOfSet.filter(pig => pig.Rarity === `${msgInfo.Rarity} (foil)`);
        const chosenFoil = ChooseRandomPigFromList(pigsOfSetAndRarity);

        const prevAmount = userPigs[chosenFoil.ID] ?? 0;
        userPigs[chosenFoil.ID] = prevAmount + 1;

        const foilPigEmbed = new EmbedBuilder()
            .setTitle(`${user.username} has crafted a foil pig!`)
            .setAuthor({
                name: user.username,
                iconURL: user.avatarURL() ?? user.defaultAvatarURL
            });
        const imgPath = AddPigRenderToEmbed(foilPigEmbed, {
            pig: chosenFoil,
            count: prevAmount + 1,
            favourite: userInfo.FavouritePigs.includes(chosenFoil.ID),
            new: prevAmount == 0
        });

        interaction.reply({
            embeds: [foilPigEmbed],
            files: [imgPath]
        });

        message.edit({
            components: []
        });
    }
);