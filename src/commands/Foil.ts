import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Colors, CommandInteractionOptionResolver, EmbedBuilder, SlashCommandBooleanOption, SlashCommandBuilder, SlashCommandStringOption } from "discord.js";
import { Command } from "../Command";
import { GetAuthor } from "../Utils/GetAuthor";
import { GetAllPigs, GetPig } from "../database/Pigs";
import { PIGS_PER_FOIL_RARITY } from "../Constants/PigsPerFoilRarity";
import { AddMessageInfoToCache, PigFoilMessage } from "../database/MessageInfo";
import { MakeErrorEmbed } from "../Utils/Errors";

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

export const Foil = new Command(
    "Foil",
    "Used to craft a foil pig, using 100 common, 50 rare, 15 epic or 5 legendary pigs from the same set.\n`onlydupes` defines whether the bot only uses duped pigs for the process.\nYou will have the chance to review the pigs the bot has selected to use in the craft before it happens.\nIf you wish to manually select which pigs to use when crafting a foil pig, use `/foilpigs`",
    false,
    true,
    new SlashCommandBuilder()
        .setName("foil")
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
        .addBooleanOption(new SlashCommandBooleanOption()
            .setName("onlydupes")
            .setDescription("Whether to only use dupe pigs or not. Default is true."))
        .setDescription("Attempt to craft a foil pig using other random pigs for a set and rarity.")
        .setDMPermission(false),

    async function (interaction, _serverInfo, userInfo) {
        if(userInfo === undefined){ return; }
        const server = interaction.guild;
        if(server === null){ return; }

        const user = interaction.user;

        const options = (interaction.options as CommandInteractionOptionResolver);
        let targetSet = options.getString("set", true).toLowerCase();
        const targetRarity = options.getString("rarity", true);
        const onlydupes = options.getBoolean("onlydupes") ?? true;

        if(targetSet === "default"){
            targetSet = "-";
        }

        const pigs = GetAllPigs();
        const pigsOfSet = pigs.filter(pig => pig.Set.toLowerCase().trim() === targetSet.trim());
        if(pigsOfSet.length === 0){
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

        const neededPigs = PIGS_PER_FOIL_RARITY[targetRarity];

        const userPigs = userInfo.Pigs;
        let offeredPigs: {[key: string]: number} = {}
        let offeredPigsNum = 0;
        let enoughPigs = false;

        pigsOfSetAndRarity.forEach(pig => {
            if(enoughPigs){ return; }

            const num = userPigs[pig.ID];
            if(num === undefined){ return; }
            if(num <= 1){ return; }

            const givenAmount = Math.min(neededPigs - offeredPigsNum, num - 1);

            offeredPigsNum += givenAmount;
            offeredPigs[pig.ID] = givenAmount;

            if(offeredPigsNum >= neededPigs){
                enoughPigs = true;
            }
        });

        if(!enoughPigs && onlydupes){
            const emptyEmbed = new EmbedBuilder()
                .setAuthor(GetAuthor(interaction))
                .setColor(Colors.DarkRed)
                .setTitle("You don't have enough pigs that meet the requirements!")
                .setDescription(`You only have ${offeredPigsNum} when you actually need ${neededPigs}`);

            await interaction.reply({
                embeds: [emptyEmbed]
            });
            
            return;
        }else if(!enoughPigs){
            offeredPigs = {}
            offeredPigsNum = 0;
            enoughPigs = false;

            pigsOfSetAndRarity.forEach(pig => {
                if(enoughPigs){ return; }
    
                const num = userPigs[pig.ID];
                if(num === undefined){ return; }
                if(num <= 0){ return; }
    
                const givenAmount = Math.min(neededPigs - offeredPigsNum, num);
    
                offeredPigsNum += givenAmount;
                offeredPigs[pig.ID] = givenAmount;
    
                if(offeredPigsNum >= neededPigs){
                    enoughPigs = true;
                }
            });

            if(!enoughPigs){
                const emptyEmbed = new EmbedBuilder()
                    .setAuthor(GetAuthor(interaction))
                    .setColor(Colors.DarkRed)
                    .setTitle("You don't have enough pigs that meet the requirements!")
                    .setDescription(`You only have ${offeredPigsNum} when you actually need ${neededPigs}`);

                await interaction.reply({
                    embeds: [emptyEmbed]
                });
                
                return;
            }
        }

        let anyPigsInList = false;
        for (const _ in offeredPigs) {
            anyPigsInList = true;
            break;
        }

        if(!anyPigsInList){
            const errorEmbed = MakeErrorEmbed("The offered pigs list is empty", "You can still craft the pig foil tho");

            await interaction.followUp({
                embeds: [errorEmbed]
            });
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
                offeredPigs,
                targetSet,
                targetRarity
            ));
        });
    }
);