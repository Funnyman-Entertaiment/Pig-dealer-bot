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

export const CancelFoil = new Button("CancelFoil",
    async (interaction) => {
        const server = interaction.guild;
        if (server === null) { return; }
        const message = interaction.message;
        const user = interaction.user;

        const msgInfo = GetMessageInfo(server.id, message.id) as PigFoilMessage | undefined;

        if (msgInfo === undefined) {
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

        if (msgInfo.Type !== "PigFoil") { return; }
        if (msgInfo.User !== user.id) { return; }

        const userInfo = await GetUserInfo(user.id);
        if (userInfo === undefined) { return; }

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