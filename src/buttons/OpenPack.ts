import { EmbedBuilder } from "@discordjs/builders";
import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, Colors, CommandInteraction, Embed, GuildChannel, Interaction, Message } from "discord.js";
import { Timestamp } from "firebase/firestore/lite";
import { Button } from "../Button";
import { SPECIAL_RARITIES_PER_PACK } from "../Constants/SpecialRaritiesPerPack";
import { PIG_RARITY_ORDER } from "../Constants/PigRarityOrder";
import { RARITIES_PER_PIG_COUNT } from "../Constants/RaritiesPerPigCount";
import { AddPigRenderToEmbed } from "../Utils/PigRenderer";
import { GOLDEN_PIG_CHANCE_PER_RARITY } from "../Constants/GoldenPigChancePerRarity";
import { MakeErrorEmbed } from "../Utils/Errors";
import { AddUserInfoToCache, GetUserInfo, UserInfo } from "../database/UserInfo";
import { AddMessageInfoToCache, GetMessageInfo, PigGalleryMessage, RandomPackMessage } from "../database/MessageInfo";
import { GetAllPigs, GetPig, GetPigsByRarity, GetPigsBySet, GetPigsWithTag, Pig } from "../database/Pigs";
import { GetServerInfo, ServerInfo } from "../database/ServerInfo";
import { GetNewYearsYear, IsChristmas, IsNewYear } from "../Utils/SeasonalEvents";
import { LogError, LogInfo, PrintChannel, PrintServer, PrintUser } from "../Utils/Log";
import { GetPack, Pack } from "../database/Packs";
import { existsSync } from "fs";
import { ASSEMBLY_NEW_YEAR_PIG, GOLDEN_PIG, STOCKING_PIG } from "../Constants/SignificantPigIDs";
import { STOCKING_PACK } from "../Constants/SignificantPackIDs";
import { CheckAndSendAssemblyPigEmbeds } from "../Utils/AssemblyyPigs";
import { GetAuthor } from "../Utils/GetAuthor";
import { Cooldowns } from "../Constants/Variables";

function GetEditedEmbed(embed: EmbedBuilder, pack: Pack) {
    let openedImg = `./img/packs/opened/${pack.ID}.png`;

    if (!existsSync(openedImg)) {
        return;
    }

    embed.setImage(`attachment://${pack.ID}.png`);

    return openedImg;
}

function CanUserOpenPack(interaction: ButtonInteraction, userInfo: UserInfo, msgInfo: RandomPackMessage) {
    if (msgInfo.User !== undefined && msgInfo.User !== userInfo.ID) {
        const notYourPackEmbed = new EmbedBuilder()
            .setTitle("This pack is not for you!")
            .setDescription("Wait for another pack to drop and open that one you greedy pig.")
            .setColor(Colors.Red);

        interaction.reply({
            embeds: [notYourPackEmbed],
            ephemeral: true
        })
        return false;
    }

    if (msgInfo.Opened) {
        const notYourPackEmbed = new EmbedBuilder()
            .setTitle("This pack has already been opened!")
            .setDescription("Give the message a moment to update and you'll see someone claimed it before you.")
            .setColor(Colors.Red);

        interaction.reply({
            embeds: [notYourPackEmbed],
            ephemeral: true
        })

        return false;
    }

    const lastTimeOpened = userInfo.LastTimeOpened;
    const currentTime = Timestamp.now();

    if (
        lastTimeOpened !== undefined &&
        currentTime.seconds - lastTimeOpened.seconds <= 60 * Cooldowns.MINUTES_PACK_OPENING_CD &&
        !msgInfo.IgnoreCooldown
    ) {
        const totalDiff = (60 * Cooldowns.MINUTES_PACK_OPENING_CD) - (currentTime.seconds - lastTimeOpened.seconds);
        const minutes = Math.floor(totalDiff / 60);
        const seconds = totalDiff % 60;

        const waitEmbed = new EmbedBuilder()
            .setColor(Colors.DarkRed)
            .setTitle(`You must wait for ${minutes}:${seconds.toString().padStart(2, "0")} minutes to open another pack`)
            .setAuthor(GetAuthor(interaction as any as CommandInteraction));

        interaction.reply({
            embeds: [waitEmbed],
            ephemeral: true,
            options: {
                ephemeral: true
            }
        });

        return false;
    }

    return true;
}

function EditEmbedWithOpenedPack(message: Message, pack: Pack, embed: Embed) {
    const editedEmbed = new EmbedBuilder(embed.data);
    const openedImg = GetEditedEmbed(editedEmbed, pack);

    const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('OpenPack')
                .setLabel('Open!')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(true),
        );

    if (openedImg === undefined) {
        message.edit({
            components: [row]
        });
    } else {
        message.edit({
            embeds: [editedEmbed],
            components: [row],
            files: [openedImg],
        });
    }
}

function GetUserPigs(userInfo: UserInfo) {
    const userPigs: string[] = [];
    for (const pigId in userInfo.Pigs) {
        userPigs.push(pigId);
    }
    return userPigs;
}

function GetAvailablePigsFromPack(pack: Pack) {
    let pigs: Pig[];

    if (pack.Set.length !== 0) {
        pigs = GetPigsBySet(pack.Set);
    } else if ((pack.Tags as string[]).length !== 0) {
        pigs = GetPigsWithTag(pack.Tags);
    } else {
        pigs = GetAllPigs();
    }

    const pigsPerRarity: { [key: string]: Pig[] } = {}

    pigs.forEach(pig => {
        if (pigsPerRarity[pig.Rarity] === undefined) {
            pigsPerRarity[pig.Rarity] = [];
        }

        const pigsOfRarity = pigsPerRarity[pig.Rarity];
        pigsOfRarity.push(pig);
    });

    return pigsPerRarity;
}

function GetPigRaritiesFromPack(pack: Pack) {
    if (SPECIAL_RARITIES_PER_PACK[pack.Name] === undefined) {
        return RARITIES_PER_PIG_COUNT[pack.PigCount];
    }

    return SPECIAL_RARITIES_PER_PACK[pack.Name];
}

function GetRandomRarityFromWeightedList(rarities: { readonly [key: string]: number }) {
    let rarity = "";

    for (const possibleRarity in rarities) {
        const chance = rarities[possibleRarity];

        if (Math.random() > chance) {
            break;
        }

        rarity = possibleRarity;
    }

    return rarity;
}

function ChooseRandomPigFromList(pigs: Pig[]): Pig {
    return pigs[Math.floor(Math.random() * pigs.length)]
}

function ChoosePigs(serverInfo: ServerInfo, pack: Pack) {
    const availablePigsForPack = GetAvailablePigsFromPack(pack);
    const pigRaritiesForPack = GetPigRaritiesFromPack(pack);

    let allowGoldenPig: boolean = !serverInfo.HasSpawnedGoldenPig;

    const chosenPigs: Pig[] = [];

    pigRaritiesForPack.forEach(async rarities => {
        const rarity: string = GetRandomRarityFromWeightedList(rarities);

        const pigsOfRarity = availablePigsForPack[rarity];
        let chosenPig: Pig;

        do {
            chosenPig = ChooseRandomPigFromList(pigsOfRarity);
        } while (chosenPigs.includes(chosenPig));

        const goldenPigChance = GOLDEN_PIG_CHANCE_PER_RARITY[rarity] ?? 0

        if (Math.random() <= goldenPigChance && allowGoldenPig) {
            const goldenPig = GetPig(GOLDEN_PIG);
            if (goldenPig !== undefined) {
                chosenPigs.push(goldenPig);
                allowGoldenPig = false;
            }
        } else {
            chosenPigs.push(chosenPig);
        }
    });

    serverInfo.HasSpawnedGoldenPig = !allowGoldenPig;

    chosenPigs.sort((a, b) => {
        const aOrder = PIG_RARITY_ORDER[a.Rarity];
        const bOrder = PIG_RARITY_ORDER[b.Rarity];

        return aOrder - bOrder;
    });

    return chosenPigs;
}

function ChristmasEvent(chosenPigs: Pig[], pigsToShowInPack: Pig[], pack: Pack) {
    if (!IsChristmas()) { return; }
    if (pack.ID === STOCKING_PACK) { return; }

    if (Math.random() < 0.05) {
        const stockingPig = GetPig(STOCKING_PIG);
        if (stockingPig !== undefined) { pigsToShowInPack.push(stockingPig); }
    } else if (Math.random() < 0.1) {
        const christmasPigs = GetPigsByRarity("Christmas");
        const chosenChristmasPig = ChooseRandomPigFromList(christmasPigs);
        chosenPigs.push(chosenChristmasPig);
    }
}

function NewYearEvent(chosenPigs: Pig[], serverInfo: ServerInfo) {
    return;
    if (!IsNewYear()) { return; }

    const currentYear = GetNewYearsYear();

    if (!serverInfo.YearsSpawnedAllNewYearDeco.includes(currentYear) && Math.random() < 0.1) {
        const newYearPigs: Pig[] = GetPigsByRarity("New Year");
        const chosenNewYearPigs = newYearPigs[Math.floor(Math.random() * newYearPigs.length)];
        chosenPigs.push(chosenNewYearPigs);
    }
}

function GetOpenPackFollowUp(packName: string, chosenPigs: Pig[], newPigs: string[], interaction: Interaction) {
    const openedPackEmbed = new EmbedBuilder()
        .setTitle(`You've opened a ${packName}`)
        .setDescription(`1/${chosenPigs.length}`);

    const imgPath = AddPigRenderToEmbed(openedPackEmbed, {
        pig: chosenPigs[0],
        new: newPigs.includes(chosenPigs[0].ID),
        count: 1
    });

    if (imgPath === undefined) { return; }

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
        );

    const author = GetAuthor(interaction as any as CommandInteraction);
    if (author !== null) {
        openedPackEmbed.setAuthor(author);
    }

    return {
        embeds: [openedPackEmbed],
        components: [row],
        files: [imgPath]
    }
}

function SendOpenPackFollowUp(userInfo: UserInfo, chosenPigs: Pig[], pigsToShowInPack: Pig[], pack: Pack, serverId: string, interaction: ButtonInteraction) {
    const userPigs = GetUserPigs(userInfo);

    const newPigs = chosenPigs.filter(pig => !userPigs.includes(pig.ID)).map(pig => pig.ID);

    const packFollowUp = GetOpenPackFollowUp(pack.Name, pigsToShowInPack, newPigs, interaction);

    if (packFollowUp === undefined) {
        return;
    }

    interaction.followUp(packFollowUp).then(message => {
        if (message === null) { return; }

        const newMsgInfo = new PigGalleryMessage(
            message.id,
            serverId,
            0,
            {},
            pigsToShowInPack.map(pig => pig.ID),
            newPigs,
            [],
            interaction.user.id
        );
        AddMessageInfoToCache(newMsgInfo);
    });
}

function AddPigsToUser(chosenPigs: Pig[], userInfo: UserInfo) {
    chosenPigs.forEach(pig => {
        const count = userInfo.Pigs[pig.ID];

        if (count === undefined) {
            userInfo.Pigs[pig.ID] = 1;
        } else {
            userInfo.Pigs[pig.ID] = count + 1;
        }
    })
}

export const OpenPack = new Button("OpenPack",
    async (interaction) => {
        if (interaction.guild === null) {
            return;
        }

        const server = interaction.guild;
        const user = interaction.user;
        const message = interaction.message;

        const serverID = server.id;
        const userID = user.id;
        const msgID = message.id;

        const serverInfo = await GetServerInfo(serverID) as any as ServerInfo;
        const userInfo = await GetUserInfo(userID) ?? new UserInfo(
            userID,
            [],
            {}
        );
        AddUserInfoToCache(userInfo);
        const msgInfo = GetMessageInfo(serverID, msgID) as any as RandomPackMessage;

        const pack = GetPack(msgInfo.Pack);

        if (pack === undefined) {
            const errorEmbed = MakeErrorEmbed("Could't find pack for this message", `Pack Id: ${msgInfo.Pack}`);

            interaction.reply({
                embeds: [errorEmbed],
                ephemeral: true,
            });

            return;
        }

        if (!CanUserOpenPack(interaction, userInfo, msgInfo)) {
            return;
        }

        await interaction.deferReply();

        msgInfo.Opened = true;
        if (!msgInfo.IgnoreCooldown) {
            userInfo.LastTimeOpened = Timestamp.now();
            if (server.memberCount <= 5) {
                userInfo.LastTimeOpened = Timestamp.fromMillis(userInfo.LastTimeOpened.toMillis() + 1000 * 60 * 60 * 96);
            }
        }

        const embed = message.embeds[0];

        if (embed === undefined) {
            LogError(`Couldn't get embed from message in channel ${PrintChannel(interaction.channel as any as GuildChannel)} in server ${PrintServer(server)}`)
            const errorEmbed = MakeErrorEmbed(`Couldn't get embed from message`, `Make sure the bot is able to send embeds`);
            interaction.reply({
                ephemeral: true,
                embeds: [errorEmbed]
            });
            return;
        }

        EditEmbedWithOpenedPack(message, pack, embed);

        LogInfo(`User ${PrintUser(interaction.user)} opened ${pack.Name} pack in server ${PrintServer(server)}`);

        const chosenPigs = ChoosePigs(serverInfo, pack).filter(x => x !== undefined);
        const pigsToShowInPack = [...chosenPigs];

        ChristmasEvent(chosenPigs, pigsToShowInPack, pack);
        NewYearEvent(chosenPigs, serverInfo);

        SendOpenPackFollowUp(userInfo, chosenPigs, pigsToShowInPack, pack, serverID, interaction);

        AddPigsToUser(chosenPigs, userInfo);

        const assembledPigs = await CheckAndSendAssemblyPigEmbeds(serverID, userID, chosenPigs);

        if (assembledPigs === undefined) { return; }

        if (assembledPigs.some(pig => pig.ID === ASSEMBLY_NEW_YEAR_PIG)) {
            const serverInfo = await GetServerInfo(server.id) as any as ServerInfo;
            const currentYear = GetNewYearsYear();

            serverInfo.YearsSpawnedAllNewYearDeco.push(currentYear);
        }
    }
);