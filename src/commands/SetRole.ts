import { SlashCommandBuilder, EmbedBuilder, CommandInteractionOptionResolver, Colors, PermissionFlagsBits } from "discord.js";
import { doc, setDoc } from "firebase/firestore/lite";
import { GetServerInfo, ServerInfo } from "../database/ServerInfo";
import { Command } from "../Command";

export const SetBotRole = new Command(
    new SlashCommandBuilder()
        .setName("setrole")
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('role that will get pinged when the bot drops a pack')
                .setRequired(true))
        .setDescription("Let's you choose what role the bot pings")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async (_, interaction, db) => {
        const role = (interaction.options as CommandInteractionOptionResolver).getRole('role')

        if (role === null) {
            return;
        }

        if (interaction.guildId === null) {
            const errorEmbed = new EmbedBuilder()
                .setTitle("There was an error fetching the server id.")
                .setColor(Colors.Red);

            await interaction.followUp({
                ephemeral: true,
                embeds: [errorEmbed]
            });

            return;
        }

        let serverInfo = await GetServerInfo(interaction.guildId, db);

        if(serverInfo === undefined){
            serverInfo = new ServerInfo(
                interaction.guildId,
                undefined,
                role.id,
                false
            );
        }else{
            serverInfo.Role = role.id;
        }

        //We need to update the db because we later get these with a direct query
        if(serverInfo.Role === undefined){
            await setDoc(doc(db, `serverInfo/${serverInfo.ID}`), {
                Channel: serverInfo.Channel,
                HasSpawnedGoldenPig: serverInfo.HasSpawnedGoldenPig
            });
        }else{
            await setDoc(doc(db, `serverInfo/${serverInfo.ID}`), serverInfo.GetData());
        }

        const successEmbed = new EmbedBuilder()
            .setTitle(`Role succesfully set to @${role.name}`)
            .setColor(Colors.Green);

        await interaction.followUp({
            ephemeral: true,
            embeds: [successEmbed],
        });
    }
);