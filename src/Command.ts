import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { UserInfo } from "./database/UserInfo";
import { ServerInfo } from "./database/ServerInfo";

export class Command {
	name;
	description;
	requireServerInfo;
	requireUserInfo;
	slashCommand;
	response;

	constructor(
		name: string,
		description: string,
		requireServerInfo: boolean,
		requireUserInfo: boolean,
		slashCommand: SlashCommandBuilder,
		response: (
			interaction: CommandInteraction,
			serverInfo: ServerInfo | undefined,
			userInfo: UserInfo | undefined
		) => void
	) {
		this.name = name;
		this.description = description;
		this.requireServerInfo = requireServerInfo;
		this.requireUserInfo = requireUserInfo;
		this.slashCommand = slashCommand;
		this.response = response;
	}
}
