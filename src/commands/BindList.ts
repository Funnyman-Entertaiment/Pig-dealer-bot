import { SlashCommandBuilder, CommandInteractionOptionResolver, Colors, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { Command } from "../Command";
import { GetAuthor } from "../Utils/GetAuthor";
import { LogInfo, PrintUser } from "../Utils/Log";
import { GetPig, Pig } from "../database/Pigs";
import { GetUserInfo, UserInfo } from "../database/UserInfo";
import { AddPigListRenderToEmbed } from "../Utils/PigRenderer";
import { PigListMessage, AddMessageInfoToCache } from "../database/MessageInfo";

function GetUserPigs(userInfo?: UserInfo) {
    if (userInfo === undefined) { return []; }
    const userPigs: string[] = [];
    for (const pigId in userInfo.Pigs) {
        userPigs.push(pigId);
    }
    return userPigs;
}

export const ShowBinderList = new Command(
    new SlashCommandBuilder()
        .setName("binderlist")
        .addBooleanOption(option =>
            option.setName('set')
                .setDescription('whether to order the pigs by set or not'))
        .addUserOption(option =>
            option.setName('user')
                .setDescription('user to check the binder of'))
        .setDescription("Let's you check your own or someone else's pig binder")
        .setDMPermission(false),

    async (interaction) => {
        await interaction.deferReply();

        const server = interaction.guild;
        if (server === null) { return; }

        const user = (interaction.options as CommandInteractionOptionResolver).getUser('user');
        const orderBySet = (interaction.options as CommandInteractionOptionResolver).getBoolean('set') ?? false;

        let userId: string;
        let author: { name: string, iconURL: string } | null;

        if (user === null) {
            LogInfo(`User ${PrintUser(interaction.user)} is checking its own binder`)
            author = GetAuthor(interaction);

            if (author === null) {
                return;
            }
            userId = interaction.user.id;
        } else {
            LogInfo(`User ${PrintUser(interaction.user)} is checking the binder of ${PrintUser(interaction.user)}`)
            userId = user.id;
            const username = user.username;
            const avatar = user.avatarURL();

            author = { name: username, iconURL: avatar === null ? "" : avatar };
        }

        const userInfo = await GetUserInfo(userId);
        const pigs = GetUserPigs(userInfo).map(pigID => GetPig(pigID)).filter(pig => pig !== undefined) as any as Pig[];

        if (pigs.length === 0) {
            const emptyEmbed = new EmbedBuilder()
                .setAuthor(author)
                .setColor(Colors.DarkRed)
                .setTitle("This user has no pigs!")
                .setDescription("Open some packs, loser");

            await interaction.followUp({
                embeds: [emptyEmbed]
            });
            return;
        }

        const pigsBySet: { [key: string]: string[] } = {};
        const sets: string[] = [];

        if (orderBySet) {
            pigs.forEach(pig => {
                if (pigsBySet[pig.Set] === undefined) {
                    pigsBySet[pig.Set] = [];
                }

                pigsBySet[pig.Set].push(pig.ID);
            });
        } else {
            pigsBySet['Pigs'] = pigs.map(pig => pig.ID);
        }

        for (const set in pigsBySet) {
            if (!sets.includes(set)) {
                sets.push(set);
            }

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
            .setTitle(`${author.name}'s pig binder`)
            .setDescription(`**${firstSet === "-" ? "Default" : firstSet}**`)
            .setColor(Colors.DarkVividPink)
            .setAuthor(author);

        const firstPigsPage = pigsBySet[firstSet].slice(0, Math.min(pigsBySet[firstSet].length, 9));
        AddPigListRenderToEmbed(catalogueEmbed, {
            pigs: firstPigsPage.map(id => GetPig(id)).filter(pig => pig !== undefined) as any as Pig[]
        });

        const row = new ActionRowBuilder<ButtonBuilder>();

        if (orderBySet) {
            row.addComponents(
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
        } else {
            row.addComponents(
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
            );
        }

        await interaction.followUp({
            ephemeral: true,
            embeds: [catalogueEmbed],
            components: [row]
        }).then(message => {
            const messageInfo = new PigListMessage(
                message.id,
                server.id,
                pigsBySet,
                firstSet,
                0,
                interaction.user.id
            );

            AddMessageInfoToCache(messageInfo);
        });
    }
);