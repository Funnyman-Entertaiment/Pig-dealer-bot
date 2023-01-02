import { Interaction, CommandInteraction, ButtonInteraction } from "discord.js";
import { Buttons } from "../Buttons";
import { Commands, DebugCommands } from "../Commands";
import { client } from "../Bot";

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
        slashCommand = DebugCommands.find(c => c.slashCommand.name === interaction.commandName);
    }

    if(slashCommand === undefined){
        await interaction.reply({ content: "An error has occurred" });
        return;
    }

    slashCommand.response(interaction);
};


const handleButtonCommand = async(interaction: ButtonInteraction) => {
    const button = Buttons.find(b => b.id === interaction.customId);

    if (!button) {
        await interaction.reply({ content: "An error has occurred" });
        return;
    }

    button.response(interaction);
}