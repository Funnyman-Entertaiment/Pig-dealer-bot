import { EmbedBuilder, Colors } from "discord.js";
import { Button } from "../Button";
import { GetMessageInfo, PigFoilMessage, RemoveMessageInfoFromCache } from "../database/MessageInfo";
import { Pig } from "../database/Pigs";
import { GetUserInfo } from "../database/UserInfo";

function ChooseRandomPigFromList(pigs: Pig[]): Pig {
    return pigs[Math.floor(Math.random() * pigs.length)]
}

export const CancelFoil = new Button(
    "CancelFoil",
    true,
    true,
    true,
    async (interaction, serverInfo, messageInfo, userInfo) => {
        if(serverInfo === undefined){ return; }
        if(messageInfo === undefined){ return; }
        if(userInfo === undefined){ return; }

        const user = interaction.user;
        const message = interaction.message;

        const msgInfo = messageInfo as PigFoilMessage;
        if(msgInfo === undefined){ return; }

        RemoveMessageInfoFromCache(msgInfo);

        const notEnoughPigsEmbed = new EmbedBuilder()
            .setTitle("This foil crafting has been cancelled")
            .setAuthor({
                name: user.username,
                iconURL: user.avatarURL() ?? user.defaultAvatarURL
            })
            .setColor(Colors.DarkRed);

        message.edit({
            embeds: [notEnoughPigsEmbed],
            components: []
        });

        interaction.deferUpdate();
    }
);