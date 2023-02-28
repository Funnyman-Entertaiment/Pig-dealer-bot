import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Colors, CommandInteraction, CommandInteractionOptionResolver, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { Command } from "../Command";
import { GetAllPigs, GetPig, Pig } from "../database/Pigs";
import { AddPigListRenderToEmbed } from "../Utils/PigRenderer";
import { AddMessageInfoToCache, PigListMessage } from "../database/MessageInfo";
import { LogInfo, PrintUser } from "../Utils/Log";

export const Catalogue = new Command(
    "catalogue",
    "Allows you to see all the pigs. Cool.",
    new SlashCommandBuilder()
        .setName("catalogue")
        .addStringOption(option =>
            option.setName("rarity")
                .setDescription("Filter pigs by rarity. Multiple rarities separated by commas."))
        .setDescription("Shows all pigs in the bot sorted by set")
        .setDMPermission(false),

    async (interaction: CommandInteraction) => {
        await interaction.deferReply();

        const serverId = interaction.guild?.id;

        if (serverId === undefined) {
            return;
        }

        const options = interaction.options as CommandInteractionOptionResolver;
        const rarities = options.getString('rarity') ?? "";
        const raritiesToFilter = rarities.split(',')
            .map(rarity => rarity.trim().toLowerCase())
            .filter(rarity => rarity.length > 0);

        let pigs = GetAllPigs();

        if (raritiesToFilter.length > 0) {
            pigs = pigs.filter(pig => {
                return raritiesToFilter.includes(pig.Rarity.toLowerCase())
            });
        }

        const pigsBySet: { [key: string]: string[] } = {};
        const sets: string[] = [];

        pigs.forEach(pig => {
            if (pig.Rarity.endsWith("(foil)")) { return; }

            if (pigsBySet[pig.Set] === undefined) {
                pigsBySet[pig.Set] = [];
            }

            pigsBySet[pig.Set].push(pig.ID);

            if (!sets.includes(pig.Set)) {
                sets.push(pig.Set);
            }
        });

        for (const set in pigsBySet) {
            const pigs = pigsBySet[set];
            pigsBySet[set] = pigs.sort((a, b) => {
                try {
                    const numA = parseInt(a);
                    const numB = parseInt(b);

                    return numA - numB;
                } catch {
                    return a.localeCompare(b);
                }
            });
        }

        sets.sort();

        const firstSet = sets[0];

        const catalogueEmbed = new EmbedBuilder()
            .setTitle("Pig Catalogue")
            .setDescription(`**${firstSet === "-" ? "Default" : firstSet}**`)
            .setColor(Colors.DarkVividPink);

        const firstPigsPage = pigsBySet[firstSet].slice(0, Math.min(pigsBySet[firstSet].length, 9));
        AddPigListRenderToEmbed(catalogueEmbed, {
            pigs: firstPigsPage.map(id => GetPig(id)).filter(pig => pig !== undefined) as any as Pig[],
            pigCounts: {}
        });

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('SetPrevious')
                    .setLabel('⏪ Prev. Set')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('ListPrevious')
                    .setLabel('Previous')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(true),
                new ButtonBuilder()
                    .setCustomId('ListNext')
                    .setLabel('Next')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(pigsBySet[firstSet].length <= 9),
                new ButtonBuilder()
                    .setCustomId('SetNext')
                    .setLabel('Next. Set ⏩')
                    .setStyle(ButtonStyle.Secondary),
            );

        LogInfo(`User ${PrintUser(interaction.user)} is checking the pig catalogue`);

        await interaction.followUp({
            ephemeral: true,
            embeds: [catalogueEmbed],
            components: [row]
        }).then(message => {
            const messageInfo = new PigListMessage(
                message.id,
                serverId,
                {},
                pigsBySet,
                [],
                [],
                firstSet,
                0,
                interaction.user.id
            );

            AddMessageInfoToCache(messageInfo);
        });
    }
);