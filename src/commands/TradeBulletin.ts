import { SlashCommandBuilder, SlashCommandSubcommandBuilder, SlashCommandStringOption, CommandInteraction, CommandInteractionOptionResolver, EmbedBuilder, Colors, Message } from "discord.js";
import { Command } from "../Command";
import { TradeServerSpace } from "../Constants/Variables";
import { GetAuthor } from "../Utils/GetAuthor";
import { CreateNewDefaultUserInfo, GetUserInfo, UserInfo } from "../database/UserInfo";

async function AddTradeBulletin(interaction: CommandInteraction, userInfo: UserInfo, options: CommandInteractionOptionResolver){
    if (userInfo.BulletinMsgId !== undefined){
        const errorEmbed = new EmbedBuilder()
            .setTitle("You can only have one trade offer in the bulletin at the time!")
            .setColor(Colors.Red);
        interaction.reply({
            embeds: [errorEmbed],
            ephemeral: true
        });

        return;
    }

    const set = options.getString('set', true);

    const tradeBulletinEmbed = new EmbedBuilder()
        .setTitle(`${interaction.user.username} wants to trade!`)
        .setDescription(`They're looking for pigs in the ${set} set.`)
        .setColor(Colors.DarkVividPink)
        .setAuthor(GetAuthor(interaction));

    const message = await TradeServerSpace.TradeBulletinChannel.send({
        embeds: [tradeBulletinEmbed]
    });

    userInfo.BulletinMsgId = message.id;

    const successEmbed = new EmbedBuilder()
        .setTitle("Trade bulletin succesfully sent!")
        .setColor(Colors.Green);

    interaction.reply({
        embeds: [successEmbed]
    });
}

async function RemoveTradeBulletin(interaction: CommandInteraction, userInfo: UserInfo){
    if (userInfo.BulletinMsgId === undefined){
        const errorEmbed = new EmbedBuilder()
            .setTitle("You don't have a trade bulletin to delete!")
            .setColor(Colors.Red);
        interaction.reply({
            embeds: [errorEmbed],
            ephemeral: true
        });

        return;
    }

    let message: Message;
    try{
        message = await TradeServerSpace.TradeBulletinChannel.messages.fetch(userInfo.BulletinMsgId);

        message.delete();
    }catch{}

    userInfo.BulletinMsgId = undefined

    const successEmbed = new EmbedBuilder()
        .setTitle("Trade bulletin succesfully removed!")
        .setColor(Colors.Green);

    interaction.reply({
        embeds: [successEmbed]
    });
}

export const TradeBulletin = new Command(
    "Trade Bulletin",
    "Only available on the Pig Dealer Trading Forum.\n Use `/tradebulletin add` to post a text embed to the dedicated channel, used for finding trade partners.\nIf you wish to remove a bulletin, use `/tradebulletin` remove.",
    false,
    false,
    new SlashCommandBuilder()
        .setName("tradebulletin")
        .addSubcommand(new SlashCommandSubcommandBuilder()
            .setName("add")
            .addStringOption(new SlashCommandStringOption()
                .setName("set")
                .setDescription("Set you're interested in trading.")
                .setRequired(true))
            .setDescription("Post a trade offer in the bulletin."))
        .addSubcommand(new SlashCommandSubcommandBuilder()
            .setName("remove")
            .setDescription("Remove you trade offer from the bulletin."))
        .setDMPermission(false)
        .setDescription("Post offers in ."),

    async (interaction: CommandInteraction) => {
        const options = interaction.options as CommandInteractionOptionResolver;
        const subcommand = options.getSubcommand();

        if (subcommand === undefined) {
            return;
        }
    
        const userInfo = await GetUserInfo(interaction.user.id) ?? CreateNewDefaultUserInfo(interaction.user.id);

        switch (subcommand) {
            case ("add"):
                AddTradeBulletin(interaction, userInfo, options);
                break;
            case ("remove"):
                RemoveTradeBulletin(interaction, userInfo);
                break;
        }
    }
);