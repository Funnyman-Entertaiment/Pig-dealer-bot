import { ButtonInteraction } from "discord.js";

export class UniquePigEvent {
	PigId;
	Response;

	constructor(pigId: string, response: (interaction: ButtonInteraction) => void) {
		this.PigId = pigId;
		this.Response = response;
	}
}