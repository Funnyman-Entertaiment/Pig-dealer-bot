import { SlashCommandBuilder, EmbedBuilder, CommandInteractionOptionResolver, Colors } from "discord.js";
import { Command } from "../Command";
import { GetPig } from "../database/Pigs";
import { query, collection, getDocs } from "firebase/firestore/lite";
import { db } from "../Bot";
import { GetAuthor } from "../Utils/GetAuthor";
import { SaveAllUserInfo } from "../database/UserInfo";


export const SearchPig = new Command(
    new SlashCommandBuilder()
        .setName("searchpig")
        .addStringOption(option =>
            option.setName('id')
                .setDescription('Pig id')
                .setRequired(true))
        .setDescription("Searches for any users that have the specified pig.")
        .setDMPermission(false),

    async (interaction) => {
        const pigID = (interaction.options as CommandInteractionOptionResolver).getString('id');
        if (pigID === null) { return; }

        const pig = GetPig(pigID);

        if (pig === undefined) {
            const pigEmbed = new EmbedBuilder()
                .setTitle("No pig found with that id")
                .setDescription("Yikes, you sure the id is right\n(Number ids don't actually start with 0s)");

            await interaction.reply({
                ephemeral: true,
                embeds: [pigEmbed],
            });

            return;
        }

        const server = interaction.guild;
        const user = interaction.user;

        if (server === null) { return; }

        await interaction.deferReply();

        await SaveAllUserInfo();

        const q = query(collection(db, `users`));
        const userInfoDocs = await getDocs(q);

        const foundUsersWithPig: string[] = [];

        for (let i = 0; i < userInfoDocs.docs.length; i++) {
            const userInfoDoc = userInfoDocs.docs[i];
            const userInServer = await server.members.fetch(userInfoDoc.id);

            if (
                userInfoDoc.data().Pigs[pigID] !== undefined &&
                userInfoDoc.id !== user.id &&
                userInServer !== undefined
            ) {
                foundUsersWithPig.push(userInfoDoc.id);
            }
        }

        if (foundUsersWithPig.length === 0) {
            const noUsersFoundEmbed = new EmbedBuilder()
                .setTitle("No users have been found that have that pig")
                .setColor(Colors.Red)
                .setAuthor(GetAuthor(interaction));

            interaction.followUp({
                embeds: [noUsersFoundEmbed]
            });

            return;
        }

        const descriptionLines: string[] = [];

        server.approximateMemberCount

        for (let i = 0; i < foundUsersWithPig.length; i++) {
            const foundUserID = foundUsersWithPig[i];
            const foundMember = await server.members.fetch(foundUserID);

            if (foundMember === undefined) { continue; }

            if (foundMember.nickname === null) {
                descriptionLines.push(`-${foundMember.user.username}`);
            } else {
                descriptionLines.push(`-${foundMember.nickname} (${foundMember.user.username})`);
            }
        }

        const foundUsersEmbed = new EmbedBuilder()
            .setTitle(`Found users with pig #${pig.ID.padStart(3, "0")}:`)
            .setDescription(descriptionLines.join("\n"))
            .setColor(Colors.Green);

        interaction.followUp({
            embeds: [foundUsersEmbed]
        });
    }
);