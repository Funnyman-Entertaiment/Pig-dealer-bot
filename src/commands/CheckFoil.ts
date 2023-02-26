import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Colors, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { Command } from "../Command";
import { GetUserInfo } from "../database/UserInfo";
import { GetAllPigs } from "../database/Pigs";
import { AddFoilChecksToEmbed } from "../Utils/PigRenderer";
import { AddMessageInfoToCache, FoilChecksMessage } from "../database/MessageInfo";

const FOILED_RARITIES = ["Common", "Rare", "Epic", "Legendary"];

export const CheckFoils = new Command(
    new SlashCommandBuilder()
        .setName("checkfoils")
        .setDescription("Gives you a list of all foils you can craft.")
        .setDMPermission(false),

    async function (interaction) {
        const user = interaction.user;
        const userInfo = await GetUserInfo(user.id);

        if (userInfo === undefined) {
            const noPigsEmbed = new EmbedBuilder()
                .setTitle("You have no pigs!")
                .setDescription("Open some packs loser!")
                .setColor(Colors.DarkRed);

            interaction.reply({
                embeds: [noPigsEmbed],
                ephemeral: true
            });

            return;
        }

        const userPigs = userInfo.Pigs;
        const pigAmountsPerSet: { [key: string]: { [key: string]: number } } = {};
        const pigs = GetAllPigs();

        pigs.forEach(pig => {
            if (!FOILED_RARITIES.includes(pig.Rarity)) { return; }

            const userAmount = userPigs[pig.ID] ?? 0;

            if (pigAmountsPerSet[pig.Set] === undefined) {
                pigAmountsPerSet[pig.Set] = {};
            }

            const pigAmountsPerRarity = pigAmountsPerSet[pig.Set];

            if (pigAmountsPerRarity[pig.Rarity] === undefined) {
                pigAmountsPerRarity[pig.Rarity] = 0;
            }

            pigAmountsPerRarity[pig.Rarity] += userAmount / 1;
        });

        const checkFoilsEmbed = new EmbedBuilder()
            .setTitle("List of set's you can craft foils of")
            .setColor(Colors.DarkVividPink);

        AddFoilChecksToEmbed(checkFoilsEmbed, {
            page: 0,
            pigAmountsPerSet: pigAmountsPerSet
        });

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("PreviousFoilCheck")
                    .setLabel("Previous")
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId("NextFoilCheck")
                    .setLabel("Next")
                    .setStyle(ButtonStyle.Primary)
            );

        await interaction.deferReply();

        interaction.followUp({
            embeds: [checkFoilsEmbed],
            components: [row]
        }).then(message => {
            const guild = message.guild;
            if (guild === null) { return; }

            AddMessageInfoToCache(new FoilChecksMessage(
                message.id,
                guild.id,
                user.id,
                pigAmountsPerSet
            ))
        });
    }
);