import { SlashCommandBuilder, SlashCommandStringOption, CommandInteraction, SlashCommandSubcommandBuilder, SlashCommandUserOption, CommandInteractionOptionResolver, EmbedBuilder, Colors, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { Command } from "../Command";
import { GetPig } from "../database/Pigs";
import { GetAuthor } from "../Utils/GetAuthor";
import { AddMessageInfoToCache, GetTradeOfferForUser, IsUserInTrade, PigTradeMessage, RemoveMessageInfoFromCache } from "../database/MessageInfo";
import { AddUserInfosToCache, GetUserInfo, UserInfo } from "../database/UserInfo";
import { client } from "../Bot";
import { MakeErrorEmbed } from "../Utils/Errors";

function ParseTradePigsString(interaction: CommandInteraction, pigsString: string) {
    const pigTokens = pigsString.split(',');

    const pigAmounts: { [key: string]: number } = {};

    let hasFoundNonPig: string | undefined = undefined;
    let hasFoundUnformattedPig: string | undefined = undefined;

    pigTokens.forEach(token => {
        if(hasFoundNonPig !== undefined){ return; }
        if(hasFoundUnformattedPig !== undefined){ return; }

        const pigID = token.split('(')[0].trim();

        const pig = GetPig(pigID);

        if (pig === undefined) {
            hasFoundNonPig = pigID;
            return;
        }

        const pigNumberStr = token.split('(')[1];
        let pigNumber = 1;

        if (pigNumberStr !== undefined) {
            pigNumber = parseInt(pigNumberStr.replace(')', '').trim());
        }

        if (Number.isNaN(pigNumber) || pigNumber <= 0) {
            hasFoundUnformattedPig = token;
            return;
        }

        if (pigAmounts[pigID] === undefined) {
            pigAmounts[pigID] = 0;
        }

        pigAmounts[pigID] += pigNumber;
    });

    if(hasFoundNonPig !== undefined){
        const errorEmbed = new EmbedBuilder()
            .setTitle("You're trying to give something that isn't a pig")
            .setDescription(`You need to type the pig's id, but you typed: ${hasFoundNonPig}`)
            .setColor(Colors.Red);
        interaction.reply({
            embeds: [errorEmbed],
            ephemeral: true
        });

        return undefined;
    }

    if(hasFoundUnformattedPig !== undefined){
        const errorEmbed = new EmbedBuilder()
            .setTitle("You typed something wrong")
            .setDescription(`The bot found some issue trying to figure out what pigs you wanted to give from here: ${hasFoundUnformattedPig}`)
            .setColor(Colors.Red);
        interaction.reply({
            embeds: [errorEmbed],
            ephemeral: true
        });

        return undefined;
    }

    return pigAmounts;
}

function GetFieldDescriptionFromPigAmounts(pigAmounts: { [key: string]: number }): string {
    const descriptionLines: string[] = [];

    for (const pigID in pigAmounts) {
        const amount = pigAmounts[pigID];
        const pig = GetPig(pigID);
        if (pig === undefined) { continue; }

        descriptionLines.push(`${pig.Name} #${pig.ID.padStart(3, "0")} (${amount})`);
    }

    if (descriptionLines.length === 0) {
        descriptionLines.push("Nothing");
    }

    return descriptionLines.join("\n");
}

async function NewTrade(interaction: CommandInteraction, options: CommandInteractionOptionResolver) {
    const tradeStarter = interaction.user;
    const tradeReceiver = options.getUser("user");
    if (tradeReceiver === null) { return; }
    const server = interaction.guild;
    if (server === null) { return; }
    const channel = interaction.channel;
    if (channel === null) { return; }

    if (tradeStarter.id === tradeReceiver.id) {
        const errorEmbed = new EmbedBuilder()
            .setTitle("You can't trade with yourself silly!")
            .setColor(Colors.Red);

        interaction.reply({
            ephemeral: true,
            embeds: [errorEmbed]
        });

        return;
    }

    if (IsUserInTrade(tradeStarter.id)) {
        const errorEmbed = new EmbedBuilder()
            .setTitle("You're already on a trade!")
            .setDescription("Finish that trade before starting a new one")
            .setColor(Colors.Red);

        interaction.reply({
            ephemeral: true,
            embeds: [errorEmbed]
        });

        return;
    }

    if (IsUserInTrade(tradeReceiver.id)) {
        const errorEmbed = new EmbedBuilder()
            .setTitle(`${tradeReceiver.username} already on a trade!`)
            .setDescription("Wait for them to finish their trade")
            .setColor(Colors.Red);

        interaction.reply({
            ephemeral: true,
            embeds: [errorEmbed]
        });

        return;
    }

    const starterInfo = await GetUserInfo(tradeStarter.id) ?? new UserInfo(
        tradeStarter.id,
        [],
        {}
    );
    const receiverInfo = await GetUserInfo(tradeReceiver.id) ?? new UserInfo(
        tradeReceiver.id,
        [],
        {}
    );
    await AddUserInfosToCache([starterInfo, receiverInfo]);

    const pigsString = options.getString("pigs") ?? "";

    const pigAmounts = ParseTradePigsString(interaction, pigsString);

    if(pigAmounts === undefined){
        return;
    }

    for (const pigID in pigAmounts) {
        const amount = pigAmounts[pigID];
        const owned = starterInfo.Pigs[pigID] ?? 0;

        if (amount > owned) {
            const errorEmbed = new EmbedBuilder()
                .setTitle("You're trying to offer more pigs than what you actually own!")
                .setDescription(`For pig #${pigID.padStart(3, '0')} you're offering ${amount} when you actually have ${owned}`)
                .setColor(Colors.Red);

            interaction.reply({
                ephemeral: true,
                embeds: [errorEmbed]
            });

            return;
        }
    }

    await interaction.deferReply();

    const tradeEmbed = new EmbedBuilder()
        .setTitle(`${tradeStarter.username} wants to trade with ${tradeReceiver.username}`)
        .setDescription(`${tradeReceiver.username} can now click deny to cancel the trade or use the \`trade offer\` command to give a counter offer.`)
        .setAuthor(GetAuthor(interaction))
        .setColor(Colors.DarkVividPink)
        .addFields([
            {
                name: `${tradeStarter.username}'s offer:`,
                value: GetFieldDescriptionFromPigAmounts(pigAmounts),
                inline: true
            },
            {
                name: `${tradeReceiver.username}'s offer:`,
                value: "...",
                inline: true
            }
        ]);

    const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId("CancelTrade")
                .setLabel("Deny")
                .setStyle(ButtonStyle.Danger)
        );

    interaction.followUp({
        embeds: [tradeEmbed],
        components: [row]
    }).then(message => {
        const messageInfo = new PigTradeMessage(
            message.id,
            server.id,
            tradeStarter.id,
            tradeReceiver.id,
            pigAmounts,
            {},
            channel.id
        );

        AddMessageInfoToCache(messageInfo);
    });
}

async function CounterOfferTrade(interaction: CommandInteraction, options: CommandInteractionOptionResolver) {
    const tradeReceiver = interaction.user;

    const msgInfo = GetTradeOfferForUser(tradeReceiver.id);

    if (msgInfo === undefined) {
        const errorEmbed = new EmbedBuilder()
            .setTitle("You don't have a trade offer pending!")
            .setDescription("You can only use this command if you make a counter offer to an existing trade")
            .setColor(Colors.Red);

        interaction.reply({
            embeds: [errorEmbed],
            ephemeral: true
        });
        return;
    }

    const starterInfo = await GetUserInfo(msgInfo.TradeStarterID) ?? new UserInfo(
        msgInfo.TradeStarterID,
        [],
        {}
    );
    const receiverInfo = await GetUserInfo(msgInfo.TradeReceiverID) ?? new UserInfo(
        msgInfo.TradeReceiverID,
        [],
        {}
    );
    await AddUserInfosToCache([starterInfo, receiverInfo]);

    const pigsString = options.getString("pigs") ?? "";

    const pigAmounts = ParseTradePigsString(interaction, pigsString);

    if(pigAmounts === undefined){
        return;
    }

    for (const pigID in pigAmounts) {
        const amount = pigAmounts[pigID];
        const owned = receiverInfo.Pigs[pigID] ?? 0;

        if (amount > owned) {
            const errorEmbed = new EmbedBuilder()
                .setTitle("You're trying to offer more pigs than what you actually own!")
                .setDescription(`For pig #${pigID.padStart(3, '0')} you're offering ${amount} when you actually have ${owned}`)
                .setColor(Colors.Red);

            interaction.reply({
                ephemeral: true,
                embeds: [errorEmbed]
            });

            return;
        }
    }

    msgInfo.TradeReceiverOffer = pigAmounts;

    const tradeServer = await client.guilds.fetch(msgInfo.ServerId);
    const tradeChannel = await tradeServer.channels.fetch(msgInfo.ChannelSentID);
    if (tradeChannel === null || !tradeChannel.isTextBased()) {
        const errorEmbed = MakeErrorEmbed(
            `Error fetching original channel of trade`,
            `The trade will be forcefully cancelled`,
            `Server: ${msgInfo.ServerId}`,
            `Channel: ${msgInfo.ChannelSentID}`
        );

        RemoveMessageInfoFromCache(msgInfo);

        interaction.reply({
            embeds: [errorEmbed],
            ephemeral: true
        });

        return;
    }
    const tradeMessage = await tradeChannel.messages.fetch(msgInfo.ID);
    if (tradeMessage === null || tradeMessage === undefined) {
        const errorEmbed = MakeErrorEmbed(
            `Error fetching original trade message`,
            `If the message has been deleted this is expected`,
            `The trade will be forcefully cancelled`,
            `Server: ${msgInfo.ServerId}`,
            `Channel: ${msgInfo.ChannelSentID}`,
            `Message: ${msgInfo.ID}`
        );

        RemoveMessageInfoFromCache(msgInfo);

        interaction.reply({
            embeds: [errorEmbed],
            ephemeral: true
        });

        return;
    }

    const tradeStarter = await tradeServer.members.fetch(msgInfo.TradeStarterID)

    if(tradeStarter === undefined){
        const errorEmbed = MakeErrorEmbed(
            `Error fetching trade starter`,
            `The trade will be forcefully cancelled`,
            `Server: ${msgInfo.ServerId}`,
            `User: ${msgInfo.TradeStarterID}`
        );

        RemoveMessageInfoFromCache(msgInfo);

        interaction.reply({
            embeds: [errorEmbed],
            ephemeral: true
        });

        return;
    }

    const originalEmbed = tradeMessage.embeds[0];

    if (originalEmbed === undefined) {
        const errorEmbed = MakeErrorEmbed(
            `Error fetching original trade embed`,
            `The trade will be forcefully cancelled`,
            `Server: ${msgInfo.ServerId}`,
            `Channel: ${msgInfo.ChannelSentID}`,
            `Message: ${msgInfo.ID}`
        );

        RemoveMessageInfoFromCache(msgInfo);

        interaction.reply({
            embeds: [errorEmbed],
            ephemeral: true
        });

        return;
    }

    const editedEmbed = new EmbedBuilder(originalEmbed.data)
        .setDescription(`${tradeStarter.user.username} can now either accept or decline the counter offer.`)
        .setFields([
            {
                name: originalEmbed.fields[0].name,
                value: originalEmbed.fields[0].value,
                inline: true
            },
            {
                name: originalEmbed.fields[1].name,
                value: GetFieldDescriptionFromPigAmounts(pigAmounts),
                inline: true
            }
        ]);

    const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId("CancelTrade")
                .setLabel("Deny")
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId("AcceptTrade")
                .setLabel("Accept")
                .setStyle(ButtonStyle.Success)
        );

    tradeMessage.edit({
        embeds: [editedEmbed],
        components: [row]
    }).then(() => {
        msgInfo.User = msgInfo.TradeStarterID;
    });

    const successEmbed = new EmbedBuilder()
        .setTitle("Counter offer succesfully sent!")
        .setColor(Colors.Green)
        .setAuthor(GetAuthor(interaction));

    interaction.reply({
        embeds: [successEmbed],
        ephemeral: true
    });
}

export const Trade = new Command(
    new SlashCommandBuilder()
        .setName("trade")
        .addSubcommand(new SlashCommandSubcommandBuilder()
            .setName("start")
            .addUserOption(new SlashCommandUserOption()
                .setName("user")
                .setDescription("User to trade with.")
                .setRequired(true))
            .addStringOption(new SlashCommandStringOption()
                .setName("pigs")
                .setDescription("Pigs that you offer."))
            .setDescription("Starts a trade with another user."))
        .addSubcommand(new SlashCommandSubcommandBuilder()
            .setName("offer")
            .addStringOption(new SlashCommandStringOption()
                .setName("pigs")
                .setDescription("Pigs that you offer."))
            .setDescription("Make a counter offer to an existing trade."))
        .setDMPermission(false)
        .setDescription("Trade pigs with other users."),

    async (interaction: CommandInteraction) => {
        const options = interaction.options as CommandInteractionOptionResolver
        const subcommand = options.getSubcommand();

        if (subcommand === undefined) {
            return;
        }

        switch (subcommand) {
            case ("start"):
                NewTrade(interaction, options);
                break;
            case ("offer"):
                CounterOfferTrade(interaction, options);
                break;
        }
    }
);