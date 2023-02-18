import { SlashCommandBuilder, EmbedBuilder, CommandInteractionOptionResolver, Colors } from "discord.js";
import { Command } from "../Command";
import { GetPig } from "../database/Pigs";
import { query, collection, getDocs } from "firebase/firestore/lite";
import { db } from "../Bot";
import { GetAuthor } from "../Utils/GetAuthor";
import { SaveAllUserInfo } from "../database/UserInfo";
import { LogInfo, PrintServer, PrintUser } from "../Utils/Log";


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
        const pigID = (interaction.options as CommandInteractionOptionResolver).getString('id', true);

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

        LogInfo(`User ${PrintUser(user)} is looking for pig #${pigID.padStart(3, '0')} in server ${PrintServer(server)}`);

        await interaction.deferReply();

        await SaveAllUserInfo();

        const q = query(collection(db, `users`));
        const userInfoDocs = await getDocs(q);

        const userIDsWithPig: string[] = [];
        const foundUsersWithPig: { [key: string]: number } = {};

        for (let i = 0; i < userInfoDocs.docs.length; i++) {
            const userInfoDoc = userInfoDocs.docs[i];
            if (userInfoDoc.id === user.id) {
                continue;
            }

            const amountOfPigs = userInfoDoc.data().Pigs[pigID]

            if (amountOfPigs === undefined || amountOfPigs <= 0) {
                continue;
            }

            try {
                if (server.members.cache.has(userInfoDoc.id)) {
                    userIDsWithPig.push(userInfoDoc.id);
                    foundUsersWithPig[userInfoDoc.id] = amountOfPigs;
                    continue;
                }

                const userInServer = await server.members.fetch(userInfoDoc.id);

                if (userInServer !== undefined) {
                    userIDsWithPig.push(userInfoDoc.id)
                    foundUsersWithPig[userInfoDoc.id] = amountOfPigs;
                }
            } catch {
            }
        }

        if (userIDsWithPig.length === 0) {
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

        for (let i = 0; i < userIDsWithPig.length; i++) {
            const foundUserID = userIDsWithPig[i];

            if (!server.members.cache.has(foundUserID)) { continue; }
            const foundMember = await server.members.fetch(foundUserID);
            const pigNum = foundUsersWithPig[foundUserID];

            if (foundMember.nickname === null) {
                descriptionLines.push(`-${foundMember.user.username} -> ${pigNum} pig${pigNum > 1 ? "s" : ""}`);
            } else {
                descriptionLines.push(`-${foundMember.nickname} (${foundMember.user.username}) -> ${pigNum} pig${pigNum > 1 ? "s" : ""}`);
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