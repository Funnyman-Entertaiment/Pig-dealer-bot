import { APIEmbedField, Client, Colors, CommandInteraction, CommandInteractionOptionResolver, EmbedBuilder, GuildTextBasedChannel, SlashCommandBuilder, roleMention } from "discord.js";
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

    const q = query(collection(db, "serverInfo"));
    const servers = await getDocs(q);

    servers.forEach(async server => {
        if (server.data().Channel === undefined) { return; }

        try{
            await client.channels.fetch(server.data().Channel).then(async channel => {
                if (channel === null) { return; }

                const guild = await client.guilds.fetch(server.id);

                const permissions = guild.members.me?.permissionsIn(channel as GuildTextBasedChannel);

                if(permissions === undefined){ return; }

                if(!permissions.has("SendMessages") || !permissions.has("ViewChannel")){
                    return;
                }

                if(server.data().Role !== undefined){
                    (channel as GuildTextBasedChannel).send({
                        content: roleMention(server.data().Role),
                        embeds: [embed]
                    });
                }else{
                    (channel as GuildTextBasedChannel).send({
                        embeds: [embed]
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