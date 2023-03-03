import { SlashCommandBuilder, CommandInteractionOptionResolver, Colors, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { Command } from "../Command";
import { GetAuthor } from "../Utils/GetAuthor";
import { LogInfo, PrintUser } from "../Utils/Log";
import { GetPig, Pig } from "../database/Pigs";
import { GetUserInfo, GetUserPigIDs, GetUserPigs } from "../database/UserInfo";
import { AddPigListRenderToEmbed } from "../Utils/PigRenderer";
import { PigListMessage, AddMessageInfoToCache } from "../database/MessageInfo";


export const ShowBinderList = new Command(
    "Binder List",
    "Shows you the pigs you own in list view. By default, it sorts them by set, but by setting that value to false it will sort them by ID.\nYou can also define a rarity and/or a user to only see pigs from only one rarity or another user, respectively.\nWhen viewing someone else's binder, a checkmark will signify if you already own a pig from their collection.",
    false,
    true,
    new SlashCommandBuilder()
        .setName("binderlist")
        .addBooleanOption(option =>
            option.setName('set')
                .setDescription('Whether to order the pigs by set or not.'))
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to check the binder of.'))
        .addStringOption(option =>
            option.setName('rarity')
                .setDescription('Filter pigs by rarity. Separate by commas to filter for several rarities.'))
        .addBooleanOption(option =>
            option.setName('favourites')
                .setDescription('show only favourite pigs'))
        .setDescription("Let's you check your own or someone else's pig binder")
        .setDMPermission(false),

    async (interaction, _serverInfo, userInfo) => {
        if(userInfo === undefined){ return; }

        await interaction.deferReply();

        const server = interaction.guild;
        if (server === null) { return; }

        const options = interaction.options as CommandInteractionOptionResolver;
        const user = options.getUser('user');
        const orderBySet = options.getBoolean('set') ?? false;
        const rarities = options.getString('rarity') ?? "";
        const raritiesToFilter = rarities.split(',')
            .map(rarity => rarity.trim().toLowerCase())
            .filter(rarity => rarity.length > 0);

        let author: { name: string, iconURL: string } | null;

        if (user === null) {
            LogInfo(`User ${PrintUser(interaction.user)} is checking its own binder`)
            author = GetAuthor(interaction);

            if (author === null) {
                return;
            }
        } else {
            LogInfo(`User ${PrintUser(interaction.user)} is checking the binder of ${PrintUser(user)}`)
            const username = user.username;
            const avatar = user.avatarURL();

            author = { name: username, iconURL: avatar === null ? "" : avatar };
        }

        let pigs = GetUserPigs(userInfo);

        if (raritiesToFilter.length > 0) {
            pigs = pigs.filter(pig => {
                return raritiesToFilter.includes(pig.Rarity.toLowerCase())
            });
        }

        const onlyFavourites = options.getBoolean('favourites') ?? false;
        if (onlyFavourites) {
            pigs = pigs.filter(pig => userInfo.FavouritePigs.includes(pig.ID));
        }

        if (userInfo === undefined || pigs.length === 0) {
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

        const interactionUserInfo = await GetUserInfo(interaction.user.id);
        const sharedPigs = GetUserPigIDs(interactionUserInfo);

        const firstPigsPage = pigsBySet[firstSet].slice(0, Math.min(pigsBySet[firstSet].length, 9));
        AddPigListRenderToEmbed(catalogueEmbed, {
            pigs: firstPigsPage.map(id => GetPig(id)).filter(pig => pig !== undefined) as any as Pig[],
            pigCounts: userInfo?.Pigs ?? {},
            favouritePigs: userInfo?.FavouritePigs ?? [],
            sharedPigs: userInfo.ID === interaction.user.id ? [] : sharedPigs
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
                userInfo === undefined ? {} : userInfo.Pigs,
                pigsBySet,
                userInfo?.FavouritePigs ?? [],
                userInfo.ID === interaction.user.id ? [] : sharedPigs,
                firstSet,
                0,
                interaction.user.id
            );

            AddMessageInfoToCache(messageInfo);
        });
    }
);