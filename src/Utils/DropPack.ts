import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, EmbedBuilder, Guild, GuildTextBasedChannel, roleMention } from "discord.js";
import { db, client } from "../Bot";
import { COLOR_PER_PACK_RARITY } from "../Constants/ColorPerPackRarity";
import { Pack } from "../database/Packs";
import { MakeErrorEmbed } from "./Errors";
import { ServerInfo } from "../database/ServerInfo";
import { RandomPackMessage, AddMessageInfoToCache } from "../database/MessageInfo";
import { LogInfo, LogWarn, PrintServer } from "./Log";
import { Timestamp } from "firebase/firestore/lite";


function SendNotEnoughPermissionsMsg(channel: GuildTextBasedChannel, server: Guild) {
    const channelName = channel.name;
    const serverName = server.name;

    const ownerId = server.ownerId;
    const owner = client.users.cache.get(ownerId);

    const errorEmbed = MakeErrorEmbed(
        "Pig dealer is missing permissions",
        "Pig dealer doesn't have enough permissions for",
        `the ${channelName} channel in the ${serverName} server.`
    );

    if (owner === undefined) {
        console.log(`No owner has been found`);
    } else {
        owner.send({
            embeds: [errorEmbed]
        });
    }
}


function SendGhostPing(channel: GuildTextBasedChannel, roleId: string) {
    try {
        channel.send(roleMention(roleId)).then(message => message.delete());
    } catch (error) {

    }
}


export async function DropPack(title: string, pack: Pack, channel: GuildTextBasedChannel, server: Guild, serverInfo: ServerInfo, userId?: string, ping = false) {
    if (channel.type !== ChannelType.GuildText) { return; }

    let img = `${pack.ID}.png`;

    const packEmbed = new EmbedBuilder()
        .setTitle(title)
        .setImage(`attachment://${img}`)
        .setColor(COLOR_PER_PACK_RARITY[pack.Rarity]);

    const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('OpenPack')
                .setLabel('Open!')
                .setStyle(ButtonStyle.Primary),
        );

    LogInfo(`Sending ${pack.Name} to server with id: ${PrintServer(server)}`);

    const permissions = server.members.me?.permissionsIn(channel);
    const timeoutedDate = server.members.me?.communicationDisabledUntil;

    if (timeoutedDate !== undefined && timeoutedDate !== null){
        const currentDate = Timestamp.now().toDate();

        if(currentDate < timeoutedDate){
            LogWarn(`Bot is timeouted in ${PrintServer(server)}`);
            return;
        }
    }

    if (permissions === undefined) { return; }

    if (!permissions.has("SendMessages") || !permissions.has("ViewChannel")) {
        LogWarn(`Not enough permissions to send messages in ${PrintServer(server)}`);
        SendNotEnoughPermissionsMsg(channel, server);
        return;
    }

    if (serverInfo.Role !== undefined && ping) {
        SendGhostPing(channel, serverInfo.Role);
    }

    try {
        channel.send({
            components: [row],
            embeds: [packEmbed],
            files: [`./img/packs/${img}`]
        }).then(async message => {
            const newMessage = new RandomPackMessage(
                message.id,
                server.id,
                pack.Name,
                pack.PigCount,
                pack.Set,
                pack.Tags,
                false,
                userId
            );

            AddMessageInfoToCache(newMessage, db);
        });
    } catch (error) {

    }
}