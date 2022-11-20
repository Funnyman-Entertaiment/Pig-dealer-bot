import { Client, Interaction, CommandInteraction, ButtonInteraction } from "discord.js";
import { Firestore } from "firebase/firestore/lite";
import { Buttons } from "../Buttons";
import { Commands } from "../Commands";

export default (client: Client, db: Firestore) => {
    client.on("interactionCreate", async (interaction: Interaction) => {
        if (interaction.isCommand() || interaction.isContextMenuCommand()) {
            await handleSlashCommand(client, interaction as CommandInteraction, db);
        }else if(interaction.isButton()){
            await handleButtonCommand(client, interaction as ButtonInteraction, db);
        }
    });
};

const handleSlashCommand = async (client: Client, interaction: CommandInteraction, db: Firestore) => {
    const slashCommand = Commands.find(c => c.slashCommand.name === interaction.commandName);

    if (!slashCommand) {
        await interaction.reply({ content: "An error has occurred" });
        return;
    }

    await interaction.deferReply();

    slashCommand.response(client, interaction, db);
};


const handleButtonCommand = async(client: Client, interaction: ButtonInteraction, db: Firestore) => {
    const button = Buttons.find(c => c.id === interaction.customId);

    if (!button) {
        await interaction.reply({ content: "An error has occurred" });
        return;
    }

    await interaction.deferReply();

    button.response(client, interaction, db);
}