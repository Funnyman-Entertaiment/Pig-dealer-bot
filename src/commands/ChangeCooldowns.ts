import { SlashCommandBuilder, CommandInteraction, SlashCommandIntegerOption, CommandInteractionOptionResolver, EmbedBuilder, Colors } from "discord.js";
import { Command } from "../Command";
import { Cooldowns } from "../Constants/Variables";

export const ChangeOpeningCooldown = new Command(
	"",
	"",
	false,
	false,
	new SlashCommandBuilder()
		.setName("setopeningcooldown")
		.addIntegerOption(new SlashCommandIntegerOption()
			.setName("cooldown")
			.setDescription("new cooldown in minutes")
			.setRequired(true))
		.setDescription("Changes the cooldown between each pack opening."),

	async (interaction: CommandInteraction) => {
		const options = interaction.options as CommandInteractionOptionResolver;
		const newCooldown = options.getInteger("cooldown", true);

		Cooldowns.MINUTES_PACK_OPENING_CD = newCooldown;

		const successEmbed = new EmbedBuilder()
			.setTitle(`Cooldown succesfully set to ${newCooldown} minutes`)
			.setColor(Colors.Green);

		interaction.reply({
			embeds: [successEmbed]
		});
	}
);


export const ChangePackCooldown = new Command(
	"",
	"",
	false,
	false,
	new SlashCommandBuilder()
		.setName("setpackcooldown")
		.addIntegerOption(new SlashCommandIntegerOption()
			.setName("cooldown")
			.setDescription("new cooldown in minutes")
			.setRequired(true))
		.setDescription("Changes the cooldown between each pack drop (default is 10)."),

	async (interaction: CommandInteraction) => {
		const options = interaction.options as CommandInteractionOptionResolver;
		const newCooldown = options.getInteger("cooldown", true);

		Cooldowns.MINUTES_BETWEEN_PACKS = newCooldown;

		const successEmbed = new EmbedBuilder()
			.setTitle(`Cooldown succesfully set to ${newCooldown} minutes`)
			.setColor(Colors.Green);

		interaction.reply({
			embeds: [successEmbed]
		});
	}
);


export const Change5PackCooldown = new Command(
	"",
	"",
	false,
	false,
	new SlashCommandBuilder()
		.setName("set5packinterval")
		.addIntegerOption(new SlashCommandIntegerOption()
			.setName("cooldown")
			.setDescription("new cooldown in minutes")
			.setRequired(true))
		.setDescription("Changes the interval for 5 pack drop (default is 180)."),

	async (interaction: CommandInteraction) => {
		const options = interaction.options as CommandInteractionOptionResolver;
		const newCooldown = options.getInteger("cooldown", true);

		Cooldowns.MINUTES_BETWEEN_5_PACKS = newCooldown;

		const successEmbed = new EmbedBuilder()
			.setTitle(`Cooldown succesfully set to ${newCooldown} minutes`)
			.setColor(Colors.Green);

		interaction.reply({
			embeds: [successEmbed]
		});
	}
);


export const Change12PackCooldown = new Command(
	"",
	"",
	false,
	false,
	new SlashCommandBuilder()
		.setName("set12packinterval")
		.addIntegerOption(new SlashCommandIntegerOption()
			.setName("cooldown")
			.setDescription("new cooldown in minutes")
			.setRequired(true))
		.setDescription("Changes the interval for 12 pack drop (default is 540)."),

	async (interaction: CommandInteraction) => {
		const options = interaction.options as CommandInteractionOptionResolver;
		const newCooldown = options.getInteger("cooldown", true);

		Cooldowns.MINUTES_BETWEEN_12_PACKS = newCooldown;

		const successEmbed = new EmbedBuilder()
			.setTitle(`Cooldown succesfully set to ${newCooldown} minutes`)
			.setColor(Colors.Green);

		interaction.reply({
			embeds: [successEmbed]
		});
	}
);