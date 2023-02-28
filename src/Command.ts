import { CommandInteraction, SlashCommandBuilder } from "discord.js";

export class Command {
    name;
    description;
    slashCommand;
    response;

    constructor(
        name: string,
        description: string,
        slashCommand: SlashCommandBuilder,
        response: (interaction: CommandInteraction) => void
    ) {
        this.name = name;
        this.description = description;
        this.slashCommand = slashCommand;
        this.response = response
    }
}
