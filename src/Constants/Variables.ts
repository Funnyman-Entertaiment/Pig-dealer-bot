import { Guild, GuildTextBasedChannel, TextChannel } from "discord.js";

export const Cooldowns = {
    MINUTES_BETWEEN_PACKS: 10,
    MINUTES_BETWEEN_5_PACKS: 180,
    MINUTES_BETWEEN_12_PACKS: 540,
    MINUTES_PACK_OPENING_CD: 15,

    MINUTES_BETWEEN_EGG_PACKS: 120,
}

interface DevSpace {
    Server: Guild,
    ReportChannel: TextChannel,
    LogChannel: TextChannel
}
export const DevSpace: DevSpace = {
    Server: undefined as any as Guild,
    ReportChannel: undefined as any as TextChannel,
    LogChannel: undefined as any as TextChannel
}

interface TradeServerSpace {
    Server: Guild,
    TradeBulletinChannel: TextChannel
}
export const TradeServerSpace: TradeServerSpace = {
    Server: undefined as any as Guild,
    TradeBulletinChannel: undefined as any as TextChannel
}