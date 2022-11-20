import { Client, Interaction, CommandInteraction } from "discord.js";
import { Firestore } from "firebase/firestore/lite";
import { Commands } from "../Commands";

export default (client: Client, db: Firestore) => {
    client.on("interactionCreate", async (interaction: Interaction) => {
        if (interaction.isCommand() || interaction.isContextMenuCommand()) {
            await handleSlashCommand(client, interaction as CommandInteraction, db);
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