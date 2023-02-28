import { SlashCommandBuilder, CommandInteraction, EmbedBuilder, Colors, APIEmbedField } from "discord.js";
import { collection, getDocs, query } from "firebase/firestore/lite";
import { client, db } from "../Bot";
import { Command } from "../Command";
import { TrySendMessageToChannel } from "../Utils/SendMessage";
import { AddUserInfoToCache, GetUserInfo, SaveAllUserInfo, UserInfo } from "../database/UserInfo";

export const GreatWipe = new Command(
    "",
    "",
    new SlashCommandBuilder()
        .setName("order66")
        .setDescription("Kill all the pigs"),

    async (interaction: CommandInteraction) => {
        await interaction.deferReply();

        const serverQuery = query(collection(db, "serverInfo"));
        const serverDocs = await getDocs(serverQuery);

        const serverIDs: string[] = [];
        const channelIDsPerServer: {[key: string]: string} = {};
        const userIDsPerServer: {[key: string]: string[]} = {};
        const maxPigCountForUser: {[key: string]: number} = {};

        serverDocs.forEach(serverDoc => {
            if(serverDoc.data().Channel !== undefined){
                channelIDsPerServer[serverDoc.id] = serverDoc.data().Channel;
                serverIDs.push(serverDoc.id);
            }
        });

        //Find all users
        for (let i = 0; i < serverIDs.length; i++) {
            const serverID = serverIDs[i];
            userIDsPerServer[serverID] = [];

            const userQuery = query(collection(db, `serverInfo/${serverID}/users`));
            const userDocs = await getDocs(userQuery);

            userDocs.forEach(userDoc => userIDsPerServer[serverID].push(userDoc.id));
        }

        //Find the max number of pigs each user had
        for (const serverID in userIDsPerServer) {
            const userIDs = userIDsPerServer[serverID];
            
            for (let i = 0; i < userIDs.length; i++) {
                const userID = userIDs[i];
                
                const pigsQuery = query(collection(db, `serverInfo/${serverID}/users/${userID}/pigs`));
                const pigDocs = await getDocs(pigsQuery);

                const pigSet: string[] = [];
                pigDocs.forEach(pig => {
                    const pigID = pig.data().PigId;

                    if(pigSet.includes(pigID)){return;}
                    pigSet.push(pigID);
                });

                const pigCount = pigSet.length;
                const previousPigCount = maxPigCountForUser[userID];

                if(previousPigCount === undefined || previousPigCount < pigCount){
                    maxPigCountForUser[userID] = pigCount;
                }
            }
        }

        //Test
        const orderedTiers = [
            "**TIER 4 TESTERS**",
            "**TIER 3 TESTERS**",
            "**TIER 2 TESTERS**",
            "**TIER 1 TESTERS**",
        ];

        serverIDs.forEach(async serverID =>{
            const usersPerRatPig: {[key: string]: string[]} = {}

            const usersInServer = userIDsPerServer[serverID];

            for (let i = 0; i < usersInServer.length; i++) {
                const userID = usersInServer[i];
                const user = await client.users.fetch(userID);
                const pigCount = maxPigCountForUser[userID];
                
                if(pigCount >= 200){
                    if(usersPerRatPig["**TIER 4 TESTERS**"] === undefined){
                        usersPerRatPig["**TIER 4 TESTERS**"] = [];
                    }
                    usersPerRatPig["**TIER 4 TESTERS**"].push(`-${user.username}: ${pigCount} pigs`);
                }else if(pigCount >= 100){
                    if(usersPerRatPig["**TIER 3 TESTERS**"] === undefined){
                        usersPerRatPig["**TIER 3 TESTERS**"] = [];
                    }
                    usersPerRatPig["**TIER 3 TESTERS**"].push(`-${user.username}: ${pigCount} pigs`);
                }else if(pigCount >= 50){
                    if(usersPerRatPig["**TIER 2 TESTERS**"] === undefined){
                        usersPerRatPig["**TIER 2 TESTERS**"] = [];
                    }
                    usersPerRatPig["**TIER 2 TESTERS**"].push(`-${user.username}: ${pigCount} pigs`);
                }else if(pigCount >= 0){
                    if(usersPerRatPig["**TIER 1 TESTERS**"] === undefined){
                        usersPerRatPig["**TIER 1 TESTERS**"] = [];
                    }
                    usersPerRatPig["**TIER 1 TESTERS**"].push(`-${user.username}: ${pigCount} pigs`);
                }
            }

            const fields: APIEmbedField[] = [];

            orderedTiers.forEach(tier => {
                if(usersPerRatPig[tier] !== undefined){
                    fields.push({
                        name: tier,
                        value: usersPerRatPig[tier].join("\n"),
                        inline: false
                    });
                }
            });

            const pigTestersEmbed = new EmbedBuilder()
                .setTitle("THE GREAT PIG BUTCHERING")
                .setDescription("This is it, the great butchering. All of your pigs have been sent to a beautiful farm in Romania. In exchange each of you will get a special pig depending on the amount of pigs you had before the butchering.")
                .setFields(fields)
                .setColor(Colors.DarkVividPink);

            TrySendMessageToChannel(serverID, channelIDsPerServer[serverID], {
                embeds: [pigTestersEmbed]
            })
        });

        for (const userID in maxPigCountForUser) {
            const pigCount = maxPigCountForUser[userID];
            const pigsToAdd: string[] = [];        
        
            if(pigCount >= 200){
                pigsToAdd.push("406");
            }

            if(pigCount >= 100){
                pigsToAdd.push("405");
            }

            if(pigCount >= 50){
                pigsToAdd.push("404");
            }

            if(pigCount >= 1){
                pigsToAdd.push("403");
            }

            const userInfo = await GetUserInfo(userID)?? new UserInfo(
                userID,
                [],
                {},
                false,
                []
            );
            AddUserInfoToCache(userInfo);

            pigsToAdd.forEach(pigToAdd =>{
                userInfo.Pigs[pigToAdd] = 1;
            });
        }

        SaveAllUserInfo();

        const descriptionLines: string[] = [];

        for (const userID in maxPigCountForUser) {
            const pigCount = maxPigCountForUser[userID];
            const user = await client.users.fetch(userID);
            
            descriptionLines.push(`${user.username} collected ${pigCount} pigs`);
        }

        const embed = new EmbedBuilder()
            .setTitle("Great Butchering Test")
            .setDescription(descriptionLines.join("\n"))
            .setColor(Colors.DarkGreen);

        interaction.followUp({
            embeds: [embed]
        });
    }
);