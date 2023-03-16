import { Interaction, CommandInteraction, ButtonInteraction, EmbedBuilder, Colors } from "discord.js";
import { Buttons } from "../Buttons";
import { Commands, DebugCommands, TradeServerCommands } from "../Commands";
import { client } from "../Bot";
import { GetServerInfo, ServerInfo } from "../database/ServerInfo";
import { MakeErrorEmbed } from "../Utils/Errors";
import { GetUserInfo, UserInfo } from "../database/UserInfo";
import { GetMessageInfo, MessageInfo } from "../database/MessageInfo";

export default () => {
    client.on("interactionCreate", async (interaction: Interaction) => {
        if (interaction.isCommand() || interaction.isContextMenuCommand()) {
            await handleSlashCommand(interaction as CommandInteraction);
        }else if(interaction.isButton()){
            await handleButtonCommand(interaction as ButtonInteraction);
        }
    });
};

const handleSlashCommand = async (interaction: CommandInteraction) => {
    let slashCommand = Commands.find(c => c.slashCommand.name === interaction.commandName);

    if (slashCommand === undefined) {
        slashCommand = TradeServerCommands.find(c => c.slashCommand.name === interaction.commandName);
    }

    if (slashCommand === undefined) {
        slashCommand = DebugCommands.find(c => c.slashCommand.name === interaction.commandName);
    }

    if(slashCommand === undefined){
        await interaction.reply({ content: "An error has occurred" });
        return;
    }

    let serverInfo: ServerInfo | undefined = undefined;

    if(slashCommand.requireServerInfo){
        const serverId = interaction.guildId;

        if(serverId === null){
            const errorEmbed = MakeErrorEmbed("Couldn't fetch server id", "Where did you use this command?")

            await interaction.reply({
                embeds: [errorEmbed]
            });

            return;
        }

        serverInfo = await GetServerInfo(serverId);

        if(serverInfo === undefined){
            const errorEmbed = new EmbedBuilder()
                .setTitle("This server is not properly set up")
                .setDescription("An admin may need to use /setchannel before this feature can work properly")
                .setColor(Colors.DarkRed);

            await interaction.reply({
                embeds: [errorEmbed]
            });

            return;
        }
    }

    let userInfo: UserInfo | undefined = undefined;

    if(slashCommand.requireUserInfo){
        const userId = interaction.user.id;

        userInfo = await GetUserInfo(userId);

        if(userInfo === undefined){
            const errorEmbed = new EmbedBuilder()
                .setTitle("You have no pigs!")
                .setDescription("Open some packs loser")
                .setColor(Colors.DarkRed);

            await interaction.reply({
                embeds: [errorEmbed]
            });

            return;
        }
    }

    slashCommand.response(interaction, serverInfo, userInfo);
};


const handleButtonCommand = async(interaction: ButtonInteraction) => {
    const button = Buttons.find(b => b.id === interaction.customId);

    if (!button) {
        await interaction.reply({ content: "An error has occurred" });
        return;
    }

    let serverInfo: ServerInfo | undefined = undefined;

    if(button.requireServerInfo){
        const serverId = interaction.guildId;

        if(serverId === null){
            const errorEmbed = MakeErrorEmbed("Couldn't fetch server id", "Where did you use this command?")

            await interaction.reply({
                embeds: [errorEmbed]
            });

            return;
        }

        serverInfo = await GetServerInfo(serverId);

        if(serverInfo === undefined){
            const errorEmbed = new EmbedBuilder()
                .setTitle("This server is not properly set up")
                .setDescription("An admin may need to use /setchannel before this command can work properly")
                .setColor(Colors.DarkRed);

            await interaction.reply({
                embeds: [errorEmbed]
            });

            return;
        }
    }

    let messageInfo: MessageInfo | undefined = undefined;

    if(button.requireMessageInfo){
        const serverId = interaction.guildId;

        if(serverId === null){
            const errorEmbed = MakeErrorEmbed("Couldn't fetch server id", "Where did you use this command?")

            await interaction.reply({
                embeds: [errorEmbed]
            });

            return;
        }

        const messageId = interaction.message.id;

        messageInfo = GetMessageInfo(serverId, messageId);

        if(messageInfo === undefined){
            let errorEmbed = new EmbedBuilder()
                .setTitle("This message has expired")
                .setDescription("Messages expire after ~3 hours of being created.\nA message may also expire if the bot has been internally reset (sorry!).")
                .setColor(Colors.Red);

            if(button.id === "AcceptTrade" || button.id === "CancelTrade"){
                errorEmbed = new EmbedBuilder()
                    .setTitle("This message has expired")
                    .setDescription("Trade messages expire after ~15 minutes of being created.\nA message may also expire if the bot has been internally reset (sorry!).")
                    .setColor(Colors.Red);
            }
            
            interaction.reply({
                embeds: [errorEmbed],
                ephemeral: true
            });
    
            return;
        }

        const userId = interaction.user.id;

        if(
            messageInfo.User !== undefined &&
            messageInfo.User !== userId
        ) {
            const errorEmbed = new EmbedBuilder()
                .setTitle("This isn't for you!")
                .setDescription("Shoo shoo!")
                .setColor(Colors.Red);
            
            interaction.reply({
                embeds: [errorEmbed],
                ephemeral: true
            });
    
            return;
        }
    }

    let userInfo: UserInfo | undefined = undefined;

    if(button.requireUserInfo){
        const userId = interaction.user.id;

        userInfo = await GetUserInfo(userId);

        if(userInfo === undefined){
            const errorEmbed = new EmbedBuilder()
                .setTitle("You have no pigs!")
                .setDescription("Open some packs loser")
                .setColor(Colors.DarkRed);

            await interaction.reply({
                embeds: [errorEmbed]
            });

            return;
        }
    }

    button.response(interaction, serverInfo, messageInfo, userInfo);
}