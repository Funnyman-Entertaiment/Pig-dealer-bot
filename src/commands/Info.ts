import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Colors, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { Command } from "../Command";
import { client } from "../Bot";

export const Information = new Command(
    new SlashCommandBuilder()
        .setName("information")
        .setDescription("Sends you an invitation link so you can have Pig Dealer in your own server."),

    async (interaction) => {
        const botUser = client.user;

        if(botUser === null){ return; }

        const embed = new EmbedBuilder()
            .setTitle("Pig Dealer Bot")
            .setDescription("Pig Dealer might just very well be the greatest bot ever developed for Discord. Mudae, MEE6 and Rhythm tremble before the mighty tread of the pig.")
            .setColor(Colors.LuminousVividPink)
            .setFooter({
                text: "Invite the bot now!!!"
            })
            .setThumbnail(`attachment://pig_pfp.png`)
            .addFields([
                {
                    name: "Open Packs",
                    value: "\"Okay, but what does Pig Dealer actually do if it's so great?\" you might ask with a confused look in your beady eyes. Pig Dealer, once assigned to a channel will regularly drop packs of pigs for the fastest to claim and open, containing a handful of swine to add to your collection."
                },
                {
                    name: "Immense Swine Variety",
                    value: "Pig Dealer offers over 400 pigs to collect with multiple rarities to flaunt to your friends to prove your innate superiority with a pig version of Homer Simpson. Some of them are even holographic!"
                },
                {
                    name: "Seasonal events",
                    value: "Has all that not convinced you? I'm not surprised. Many people don't know a good thing from a hammer to their cranium. It's not your fault. Maybe this will convince you though: WE HAVE SEASONAL EVENTS!!!! New years? Christmas? Cinco De Mayo? Halloween? You bet your ASS!!!! All of these events offer unique, exclusive pigs which you can show off to your aforementioned friends throughout the year until they can even get the chance to acquire one and get on your level."
                },
                {
                    name: "Trading",
                    value: "What good is an extremely rare pig version of Jesus Christ if you can only show it off? The answer: NOT MUCH!!! THAT WOULD SUCK!\nTo avoid this issue, we have implemented the ability to trade pigs. Now, your Holographic Gustavo Fring Pig is not only cool, it also serves as extremely lucrative economical advantage and leverage over fellow users!"
                },
                {
                    name: "Can You Find The Golden Pig?",
                    value: "To close this off, I'll let you in on a secret: Legends whisper of an elusive, outrageously rare pig made of solid gold. No man has come accross it before, so will you be the first?\n\nSO WHAT ARE YOU WAITING FOR?? GIVE THAT HOLLOW SHELL OF UNFULFILLED AMBITION AND ROMANTIC DISSATISFACTION YOU CALL A LIFE THE MEANING IT LACKS: PIG COLLECTING. INVITE THE BOT TO YOUR LOCAL DISCORD SERVER TODAY!!! "
                },
            ]);
        
        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setLabel("Invite the bot!")
                .setStyle(ButtonStyle.Link)
                .setURL("https://discord.com/api/oauth2/authorize?client_id=1040735137228406884&permissions=268470272&scope=bot%20applications.commands")
        );

        interaction.reply({
            embeds: [embed],
            components: [row],
            files: ["./img/pig_pfp.png"]
        });
    }
);