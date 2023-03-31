import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Colors, CommandInteraction, CommandInteractionOptionResolver, EmbedBuilder, SlashCommandBuilder, SlashCommandStringOption, makeError } from "discord.js";
import { Command } from "../Command";
import { GetAuthor } from "../Utils/GetAuthor";
import { GetAllPigs, GetPig } from "../database/Pigs";
import { PIGS_PER_FOIL_RARITY } from "../Constants/PigsPerFoilRarity";
import { AddMessageInfoToCache, PigFoilMessage } from "../database/MessageInfo";

function ParseTradePigsString(interaction: CommandInteraction, pigsString: string) {
    if (pigsString.trim() === "") {
        return {};
    }
    const pigTokens = pigsString.split(',');

    const pigAmounts: { [key: string]: number } = {};

    let hasFoundNonPig: string | undefined = undefined;
    let hasFoundUnformattedPig: string | undefined = undefined;

    pigTokens.forEach(token => {
        if (hasFoundNonPig !== undefined) { return; }
        if (hasFoundUnformattedPig !== undefined) { return; }

        const pigID = token.split('(')[0].trim();

        const pig = GetPig(pigID);

        if (pig === undefined) {
            hasFoundNonPig = pigID;
            return;
        }

        const pigNumberStr = token.split('(')[1];
        let pigNumber = 1;

        if (pigNumberStr !== undefined) {
            pigNumber = parseInt(pigNumberStr.replace(')', '').trim());
        }

        if (Number.isNaN(pigNumber) || pigNumber <= 0) {
            hasFoundUnformattedPig = token;
            return;
        }

        if (pigAmounts[pigID] === undefined) {
            pigAmounts[pigID] = 0;
        }

        pigAmounts[pigID] += pigNumber;
    });

    if (hasFoundNonPig !== undefined) {
        const errorEmbed = new EmbedBuilder()
            .setTitle("You're trying to give something that isn't a pig")
            .setDescription(`You need to type the pig's id, but you typed: ${hasFoundNonPig}`)
            .setColor(Colors.Red);
        interaction.reply({
            embeds: [errorEmbed],
            ephemeral: true
        });

        return undefined;
    }

    if (hasFoundUnformattedPig !== undefined) {
        const errorEmbed = new EmbedBuilder()
            .setTitle("You typed something wrong")
            .setDescription(`The bot found some issue trying to figure out what pigs you wanted to give from here: ${hasFoundUnformattedPig}`)
            .setColor(Colors.Red);
        interaction.reply({
            embeds: [errorEmbed],
            ephemeral: true
        });

        return undefined;
    }

    return pigAmounts;
}

function GetFieldDescriptionFromPigAmounts(pigAmounts: { [key: string]: number }): string {
    const descriptionLines: string[] = [];

    for (const pigID in pigAmounts) {
        const amount = pigAmounts[pigID];
        const pig = GetPig(pigID);
        if (pig === undefined) { continue; }

        descriptionLines.push(`${pig.Name} #${pig.ID.padStart(3, "0")} (${amount})`);
    }

    if (descriptionLines.length === 0) {
        descriptionLines.push("Nothing");
    }

    return descriptionLines.join("\n");
}

export const FoilPigs = new Command(
    "Foil Pigs",
    "Used to craft a foil pig, using 100 common, 50 rare, 15 epic or 5 legendary pigs from the same set.\nAllows you to manually input the IDs of the selected pigs, following the same syntax as all other ID defining commands: pigs:1,2,3,4.\nNote that the 0 digits at the start of lower digit IDs are purely cosmetic and are not needed when searching by ID. E.G. ACAB Pig (001) becomes only 1 when putting it into a command.",
    false,
    true,
    new SlashCommandBuilder()
        .setName("foilpigs")
        .addStringOption(new SlashCommandStringOption()
            .setName("set")
            .setDescription("Set to build the foil for.")
            .setRequired(true))
        .addStringOption(new SlashCommandStringOption()
            .setName("rarity")
            .setDescription("Rarity of the foil to build")
            .setChoices(
                {
                    name: "Common",
                    value: "Common"
                },
                {
                    name: "Rare",
                    value: "Rare"
                },
                {
                    name: "Epic",
                    value: "Epic"
                },
                {
                    name: "Legendary",
                    value: "Legendary"
                }
            )
            .setRequired(true))
        .addStringOption(new SlashCommandStringOption()
            .setName("pigs")
            .setDescription("Pigs used to craft. Put their ids separated by commas.")
            .setRequired(true))
        .setDescription("Attempt to craft a foil pig using other random pigs for a set and rarity.")
        .setDMPermission(false),

    async function (interaction, _serverInfo, userInfo) {
        if(userInfo === undefined){ return; }

        const server = interaction.guild;
        if (server === null) { return; }

        const user = interaction.user;

        const options = (interaction.options as CommandInteractionOptionResolver);
        let targetSet = options.getString("set", true).toLowerCase().trim();
        const targetRarity = options.getString("rarity", true);
        const unparsedOfferedPigs = options.getString("pigs", true);
        const offeredPigs = ParseTradePigsString(interaction, unparsedOfferedPigs);

        if (offeredPigs === undefined) {
            return;
        }

        if (targetSet === "default") {
            targetSet = "-";
        }

        const pigs = GetAllPigs();
        const pigsOfSet = pigs.filter(pig => pig.Set.toLowerCase().trim() === targetSet.trim());
        if (pigsOfSet.length === 0) {
            const emptyEmbed = new EmbedBuilder()
                .setAuthor(GetAuthor(interaction))
                .setColor(Colors.DarkRed)
                .setTitle("This set doesn't exist!")
                .setDescription("Make sure you spelled it correctly.");

            await interaction.reply({
                embeds: [emptyEmbed]
            });
            return;
        }
        const pigsOfSetAndRarity = pigsOfSet.filter(pig => pig.Rarity === targetRarity);
        if (pigsOfSetAndRarity.length === 0) {
            const emptyEmbed = new EmbedBuilder()
                .setAuthor(GetAuthor(interaction))
                .setColor(Colors.DarkRed)
                .setTitle("This set doesn't have pigs of that rarity!");

            await interaction.reply({
                embeds: [emptyEmbed]
            });
            return;
        }

        const userPigs = userInfo.Pigs;
        const neededPigs = PIGS_PER_FOIL_RARITY[targetRarity];
        let givenPigsNum = 0;
        const actualOfferedPigs: { [key: string]: number } = {};

        for (const id in offeredPigs) {
            const amount = offeredPigs[id];
            const actualAmount = userPigs[id] ?? 0;

            if (amount > actualAmount) {
                const errorEmbed = new EmbedBuilder()
                    .setTitle("You're trying to offer more pigs than you have")
                    .setDescription(`You're offering ${amount} of #${id.padStart(3, '0')} when you actually have ${actualAmount}.`)
                    .setColor(Colors.DarkRed)
                    .setAuthor(GetAuthor(interaction));

                interaction.reply({
                    embeds: [errorEmbed],
                    ephemeral: true
                });

                return;
            }

            if (pigsOfSetAndRarity.find(p => p.ID === id) === undefined) {
                const errorEmbed = new EmbedBuilder()
                    .setTitle("You're trying to offer a pig that doesn't meet the requirements!")
                    .setDescription(`You're offering #${id.padStart(3, '0')} but its set or rarity don't match.`)
                    .setColor(Colors.DarkRed)
                    .setAuthor(GetAuthor(interaction));

                interaction.reply({
                    embeds: [errorEmbed],
                    ephemeral: true
                });

                return;
            }

            const offeredAmount = Math.min(neededPigs - givenPigsNum, amount);
            actualOfferedPigs[id] = offeredAmount;
            givenPigsNum += offeredAmount;

            if (givenPigsNum >= neededPigs) {
                break;
            }
        }

        if (givenPigsNum < neededPigs) {
            const errorEmbed = new EmbedBuilder()
                .setTitle("You need to offer more pigs!")
                .setDescription(`You're offering ${givenPigsNum} pigs when you actually need to offer ${neededPigs}.`)
                .setColor(Colors.DarkRed)
                .setAuthor(GetAuthor(interaction));

            interaction.reply({
                embeds: [errorEmbed],
                ephemeral: true
            });

            return;
        }

        const successEmbed = new EmbedBuilder()
            .setTitle(`${user.username} is trying to craft a ${targetRarity} foil!`)
            .setDescription("All these pigs will be taken from you to craft the foil.")
            .addFields({
                name: "**Offered Pigs**",
                value: GetFieldDescriptionFromPigAmounts(offeredPigs)
            })
            .setAuthor(GetAuthor(interaction))
            .setColor(Colors.DarkVividPink);

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("AcceptFoil")
                    .setLabel("Accept")
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId("CancelFoil")
                    .setLabel("Cancel")
                    .setStyle(ButtonStyle.Danger)
            );

        await interaction.deferReply();

        await interaction.followUp({
            embeds: [successEmbed],
            components: [row]
        }).then(message => {
            AddMessageInfoToCache(new PigFoilMessage(
                message.id,
                server.id,
                user.id,
                actualOfferedPigs,
                targetSet,
                targetRarity
            ));
        });
    }
);