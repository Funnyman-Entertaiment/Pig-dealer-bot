import { SlashCommandBuilder, EmbedBuilder, CommandInteractionOptionResolver, ChannelType, Colors, PermissionFlagsBits } from "discord.js";
import { doc, setDoc } from "firebase/firestore/lite";
import { GetServerInfo, ServerInfo } from "../database/ServerInfo";
import { Command } from "../Command";

export const SetBotChannel = new Command(
    new SlashCommandBuilder()
        .setName("setchannel")
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('channel to send packs')
                .setRequired(true))
        .setDescription("Let's you choose what channel the bot sends packs to")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async (_, interaction, db) => {
        const channel = (interaction.options as CommandInteractionOptionResolver).getChannel('channel')

        if (channel === null) {
            return;
        }

        if (channel.type !== ChannelType.GuildText) {
            const errorEmbed = new EmbedBuilder()
                .setTitle("Channel must be a text channel.")
                .setColor(Colors.Red);

            await interaction.followUp({
                ephemeral: true,
                embeds: [errorEmbed]
            });

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
                channel.id,
                undefined,
                false
            );
        }else{
            serverInfo.Channel = channel.id;
        }

        if(serverInfo.Role === undefined){
            await setDoc(doc(db, `serverInfo/${serverInfo.ID}`), {
                Channel: serverInfo.Channel,
                HasSpawnedGoldenPig: serverInfo.HasSpawnedGoldenPig
            });
        }else{
            await setDoc(doc(db, `serverInfo/${serverInfo.ID}`), serverInfo.GetData());
        }


        //We need to update the db because we later get these with a direct query
        await setDoc(doc(db, `serverInfo/${serverInfo.ID}`), serverInfo.GetData());

        const successEmbed = new EmbedBuilder()
            .setTitle(`Channel succesfully set to ${channel.name}`)
            .setColor(Colors.Green)

        await interaction.followUp({
            ephemeral: true,
            embeds: [successEmbed],
        });
    }
);