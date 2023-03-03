import { SlashCommandBuilder, EmbedBuilder, CommandInteractionOptionResolver, ActionRowBuilder, ButtonBuilder, ButtonStyle, Colors } from "discord.js";
import { AddPigRenderToEmbed } from "../Utils/PigRenderer";
import { Command } from "../Command";
import { GetPig } from "../database/Pigs";
import { AddMessageInfoToCache, PigGalleryMessage } from "../database/MessageInfo";
import { LogError, LogInfo, PrintUser } from "../Utils/Log";
import { GetUserInfo, GetUserPigIDs } from "../database/UserInfo";
import { GetAuthor } from "../Utils/GetAuthor";

export const ShowBinder = new Command(
    "Binder",
    "Shows you the pigs you own, with an image for each. You can define a user to see someone else's binder, rarity, to only see pigs of a certain rarity. You can also set favourites to True to only see pigs you've favourited.\nWhen viewing someone else's binder, a checkmark will signify if you already own a pig from their collection.",
    false,
    true,
    new SlashCommandBuilder()
        .setName("binder")
        .addUserOption(option =>
            option.setName('user')
                .setDescription('user to check the binder of'))
        .addStringOption(option =>
            option.setName('rarity')
                .setDescription('filter pigs by rarity'))
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

        const rarities = options.getString('rarity') ?? "";
        const raritiesToFilter = rarities.split(',')
            .map(rarity => rarity.trim().toLowerCase())
            .filter(rarity => rarity.length > 0);

        let pigs = GetUserPigIDs(userInfo);

        if (userInfo === undefined) {
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

        if (raritiesToFilter.length > 0) {
            pigs = pigs.filter(pigID => {
                const pig = GetPig(pigID);

                if (pig === undefined) { return false; }

                return raritiesToFilter.includes(pig.Rarity.toLowerCase())
            });
        }

        const favouritePigs = userInfo.FavouritePigs;

        const onlyFavourites = options.getBoolean('favourites')?? false;
        if(onlyFavourites){
            pigs = pigs.filter(pig => favouritePigs.includes(pig));
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

        pigs.sort((a, b) => {
            try {
                const numA = parseInt(a);
                const numB = parseInt(b);

                return numA - numB;
            } catch {
                return a.localeCompare(b);
            }
        });

        const firstPigId = pigs[0];
        const firstPig = GetPig(firstPigId);

        if (firstPig === undefined) {
            LogError(`Couldn't find the first pig in the binder (${firstPigId})`);
            return;
        }

        const openedPackEmbed = new EmbedBuilder()
            .setTitle(`${author.name}'s pig binder`)
            .setDescription(`1/${pigs.length}`)
            .setAuthor(author);

        const interactionUserInfo = await GetUserInfo(interaction.user.id);
        const sharedPigs = GetUserPigIDs(interactionUserInfo);

        const imgPath = AddPigRenderToEmbed(openedPackEmbed, {
            pig: firstPig,
            count: userInfo?.Pigs[firstPig.ID] ?? 1,
            favourite: favouritePigs.includes(firstPig.ID),
            shared: userInfo.ID === interaction.user.id ? false : sharedPigs.includes(firstPig.ID)
        });

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('GalleryPrevious')
                    .setLabel('Previous')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(true),
                new ButtonBuilder()
                    .setCustomId('GalleryNext')
                    .setLabel('Next')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(pigs.length === 1)
            );

        if (userInfo.ID === interaction.user.id && !onlyFavourites) {
            if (!favouritePigs.includes(firstPig.ID)) {
                row.addComponents(
                    new ButtonBuilder()
                        .setCustomId('FavouritePig')
                        .setLabel('Favourite ⭐')
                        .setStyle(ButtonStyle.Secondary)
                );
            } else {
                row.addComponents(
                    new ButtonBuilder()
                        .setCustomId('UnfavouritePig')
                        .setLabel('Unfavourite ⭐')
                        .setStyle(ButtonStyle.Secondary)
                );
            }
        }

        await interaction.followUp({
            embeds: [openedPackEmbed],
            components: [row],
            files: [imgPath]
        }).then(message => {
            const newMessage = new PigGalleryMessage(
                message.id,
                server.id,
                0,
                userInfo === undefined ? {} : userInfo.Pigs,
                pigs,
                [],
                [],
                userInfo.FavouritePigs,
                userInfo.ID === interaction.user.id ? [] : sharedPigs,
                userInfo.ID === interaction.user.id && !onlyFavourites,
                interaction.user.id
            );

            AddMessageInfoToCache(newMessage);
        });
    }
);