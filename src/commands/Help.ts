import { SlashCommandBuilder, CommandInteractionOptionResolver, EmbedBuilder, Colors } from "discord.js";
import { Command } from "../Command";
import { DebugCommands, TradeServerCommands } from "../Commands";
import { Commands } from "../Commands";
import { TradeServerSpace } from "../Constants/Variables";
import { client } from "../Bot";

export const Help = new Command(
    "Help",
    "Shows useful information about every command",
    false,
    false,
    new SlashCommandBuilder()
    .setName("help")
    .addStringOption(option =>
		option.setName('command')
			.setDescription('Name of the command to learn more about.')
			.setRequired(true))
    .setDescription("Shows useful information about every command."),

    async function(interaction){
        const commandName = (interaction.options as CommandInteractionOptionResolver).getString('command', true).toLowerCase();

        let allowTradeForumCommands = false;

        const server = interaction.guild;

        if(server !== null){
            allowTradeForumCommands = server.id === TradeServerSpace.Server.id;
        }

        let foundCommand = Commands.find(x => x.slashCommand.name.toLowerCase() === commandName);

        if(foundCommand === undefined && allowTradeForumCommands){
            foundCommand = TradeServerCommands.find(x => x.slashCommand.name.toLowerCase() === commandName);
        }

        if(client.user === null){ return; }
        if(client.user.id === "1048616940194767009"){
            foundCommand = DebugCommands.find(x => x.slashCommand.name.toLowerCase() === commandName);
        }

        if(foundCommand === undefined){
            const commandNotFoundEmbed = new EmbedBuilder()
                .setTitle("No matching command has been found")
                .setColor(Colors.DarkRed);

            interaction.reply({
                embeds: [commandNotFoundEmbed],
                ephemeral: true
            });

            return;
        }

        const commandInfoEmbed = new EmbedBuilder()
            .setTitle(foundCommand.name)
            .setDescription(foundCommand.description)
            .setColor(Colors.DarkVividPink);

        interaction.reply({
            embeds: [commandInfoEmbed],
            ephemeral: true
        });
    }
);