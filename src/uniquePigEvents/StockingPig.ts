import { DropPack } from "../Utils/DropPack";
import { GetPack } from "../database/Packs";
import { GetServerInfo, ServerInfo } from "../database/ServerInfo";
import { UniquePigEvent } from "./UniquePigEvent";

export const StockingPigEvent = new UniquePigEvent(
	"306",
	async function (interaction) {
		const server = interaction.guild;
		const channel = interaction.channel;

		const pack = GetPack("16");

		if (pack !== undefined && channel !== null && server !== null) {
			const serverInfo = await GetServerInfo(server.id) as unknown as ServerInfo;
			DropPack(serverInfo, {
				pack: pack,
				title: `${interaction.user.username} found a stocking!`,
				userId: interaction.user.id,
				ignoreCooldown: true
			});
		}
	}
);