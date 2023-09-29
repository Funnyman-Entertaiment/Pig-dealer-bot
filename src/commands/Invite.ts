import { SlashCommandBuilder } from "discord.js";
import { Command } from "../Command";
import { LogInfo, PrintUser } from "../Utils/Log";
import { BOT_INVITE_LINK } from "../Constants/Links";

export const Invite = new Command(
	"Invite",
	"Gives you the bot invite link.",
	false,
	false,
	new SlashCommandBuilder()
		.setName("invite")
		.setDescription("Sends you an invitation link so you can have Pig Dealer in your own server."),

	async (interaction) => {
		LogInfo(`Sending bot invite to user ${PrintUser(interaction.user)}`);

		if (interaction.guild === null) {
			interaction.reply(BOT_INVITE_LINK);
		} else {
			interaction.user.send(BOT_INVITE_LINK);
			interaction.reply({
				content: "Message sent!",
				ephemeral: true
			});
		}
	}
);