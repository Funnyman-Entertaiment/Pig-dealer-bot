import { APIEmbedField, ActionRowBuilder, ButtonBuilder, ButtonStyle, Client, Colors, CommandInteraction, CommandInteractionOptionResolver, EmbedBuilder, GuildTextBasedChannel, SlashCommandBuilder, TextChannel, roleMention } from "discord.js";
import { Command } from "../Command";
import { query, collection, getDocs } from "firebase/firestore/lite";
import { client, db } from "../Bot";


let announcementEmbed: EmbedBuilder | undefined;
let annoucementFields: APIEmbedField[] = []


function NewAnnouncement(interaction: CommandInteraction, options: CommandInteractionOptionResolver){
    const title = options.getString("title");
    const description = options.getString("description");

    if(title === null){
        return;
    }

    if(description === null){
        return;
    }

    announcementEmbed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor(Colors.LuminousVividPink);

    annoucementFields = [];

    const successEmbed = new EmbedBuilder()
        .setTitle("Succesfully created new annoucement")
        .setColor(Colors.Green);

    interaction.followUp({
        embeds: [successEmbed]
    })
}


function AddField(interaction: CommandInteraction, options: CommandInteractionOptionResolver){
    if(announcementEmbed === undefined){
        const errorEmbed = new EmbedBuilder()
            .setTitle("Create a new annoucement first")
            .setColor(Colors.Red);

        interaction.followUp({
            embeds: [errorEmbed]
        });

        return;
    }

    const title = options.getString("title");
    const description = options.getString("description");

    if(title === null){
        return;
    }

    if(description === null){
        return;
    }

    annoucementFields.push({
        name: title,
        value: description,
        inline: false
    });

    announcementEmbed.setFields(annoucementFields);

    const successEmbed = new EmbedBuilder()
        .setTitle("Succesfully added new field")
        .setColor(Colors.Green);

    interaction.followUp({
        embeds: [successEmbed]
    });
}


function ClearField(interaction: CommandInteraction){
    if(announcementEmbed === undefined){
        const errorEmbed = new EmbedBuilder()
            .setTitle("Create a new annoucement first")
            .setColor(Colors.Red);

        interaction.followUp({
            embeds: [errorEmbed]
        });

        return;
    }

    annoucementFields.pop();

    announcementEmbed.setFields(annoucementFields);

    const successEmbed = new EmbedBuilder()
        .setTitle("Succesfully removed last field")
        .setColor(Colors.Green);

    interaction.followUp({
        embeds: [successEmbed]
    });
}


function RemoveAnnoucement(interaction: CommandInteraction){
    announcementEmbed = undefined;
    annoucementFields = [];

    const successEmbed = new EmbedBuilder()
        .setTitle("Succesfully removed the announcement embed")
        .setColor(Colors.Green);

    interaction.followUp({
        embeds: [successEmbed]
    });
}


function ShowAnnoucement(interaction: CommandInteraction){
    if(announcementEmbed === undefined){
        const errorEmbed = new EmbedBuilder()
            .setTitle("Create a new annoucement first")
            .setColor(Colors.Red);

        interaction.followUp({
            embeds: [errorEmbed]
        });

        return;
    }

    interaction.followUp({
        embeds: [announcementEmbed]
    });
}


async function SendAnnouncement(interaction: CommandInteraction){
    if(announcementEmbed === undefined){
        const errorEmbed = new EmbedBuilder()
            .setTitle("Create a new annoucement first")
            .setColor(Colors.Red);

        interaction.followUp({
            embeds: [errorEmbed]
        });

        return;
    }

    const embed = new EmbedBuilder(announcementEmbed?.data);
    embed.addFields({
        name: "JOIN THE DISCORD",
        value: "In case you didn't know, we have a Discord server dedicated to collecting and trading pigs, with pig emotes, exclusive features and a lovely community! Make sure to stop by, we'd love to see you there!"
    });

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
            .setLabel("Invite the bot!")
            .setStyle(ButtonStyle.Link)
            .setURL("https://discord.com/api/oauth2/authorize?client_id=1040735137228406884&permissions=268470272&scope=bot%20applications.commands"),
        new ButtonBuilder()
            .setLabel("Join the server!")
            .setStyle(ButtonStyle.Link)
            .setURL("https://discord.gg/wnAnhRyKjM")
    );

    const q = query(collection(db, "serverInfo"));
    const servers = await getDocs(q);

    servers.forEach(async server => {
        if (server.data().Channel === undefined && server.data().AnnouncementChannel === undefined) { return; }

        try{
            const channelID = server.data().AnnouncementChannel?? server.data().Channel

            await client.channels.fetch(channelID).then(async channel => {
                if (channel === null) { return; }

                const guild = await client.guilds.fetch(server.id);

                const permissions = guild.members.me?.permissionsIn(channel as TextChannel);

                if(permissions === undefined){ return; }

                if(!permissions.has("SendMessages") || !permissions.has("ViewChannel")){
                    return;
                }

                if(server.data().Role !== undefined){
                    (channel as TextChannel).send({
                        content: roleMention(server.data().Role),
                        embeds: [embed],
                        components: [row]
                    });
                }else{
                    (channel as TextChannel).send({
                        embeds: [embed],
                        components: [row]
                    });
                }

                
            });
        } catch (error) {
            
        }
    });

    announcementEmbed = undefined;
    annoucementFields = [];

    const successEmbed = new EmbedBuilder()
        .setTitle("Succesfully sent announcement")
        .setColor(Colors.Green);

    interaction.followUp({
        embeds: [successEmbed]
    });
}


export const Announcement = new Command(
    "",
    "",
    new SlashCommandBuilder()
        .setName("announcement")
        .addSubcommand(subcommand =>
            subcommand
                .setName("new")
                .setDescription("Creates a new announcement")
                .addStringOption(option =>
                    option
                        .setName("title")
                        .setDescription("The title the announcement embed will have")
                        .setRequired(true))
                .addStringOption(option =>
                    option
                        .setName("description")
                        .setDescription("The description the announcement embed will have")
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName("addfield")
                .setDescription("Adds a new field")
                .addStringOption(option =>
                    option
                        .setName("title")
                        .setDescription("The title the new field will have")
                        .setRequired(true))
                .addStringOption(option =>
                    option
                        .setName("description")
                        .setDescription("The description the new field will have")
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName("clearfield")
                .setDescription("Removes the last field"))
        .addSubcommand(subcommand =>
            subcommand
                .setName("remove")
                .setDescription("Removes the whole announcement embed"))
        .addSubcommand(subcommand =>
            subcommand
                .setName("show")
                .setDescription("Displays the current annoucement embed"))
        .addSubcommand(subcommand => 
            subcommand
                .setName("send")
                .setDescription("Sends the embed announcement to every server the bot is in"))
        .setDescription("Manages everything about announcements"),

    async (interaction: CommandInteraction) => {
        await interaction.deferReply();

        const subcommand = (interaction.options as CommandInteractionOptionResolver).getSubcommand();

        if(subcommand === undefined){
            return;
        }

        switch(subcommand){
            case("new"):
                NewAnnouncement(interaction, interaction.options as CommandInteractionOptionResolver);
                break;
            case("addfield"):
                AddField(interaction, interaction.options as CommandInteractionOptionResolver);
                break;
            case("clearfield"):
                ClearField(interaction);
                break;
            case("remove"):
                RemoveAnnoucement(interaction);
                break;
            case("show"):
                ShowAnnoucement(interaction);
                break;
            case("send"):
                SendAnnouncement(interaction);
                break;
        }
    }
)