"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetTradeOfferForUser = exports.RemoveMessageInfoFromCache = exports.IsUserInTrade = exports.GetMessageInfo = exports.AddMessageInfosToCache = exports.AddMessageInfoToCache = exports.GetMessageInfoFromCache = exports.GetMsgInfoCacheForServer = exports.CachedMessageInfosPerServer = exports.FoilChecksMessage = exports.PigFoilMessage = exports.PigTradeMessage = exports.PigListMessage = exports.PigGalleryMessage = exports.RandomPackMessage = exports.MessageInfo = void 0;
const lite_1 = require("firebase/firestore/lite");
const DatabaseElement_1 = require("./DatabaseElement");
class MessageInfo extends DatabaseElement_1.DatabaseElement {
    ServerId;
    Type;
    User;
    TimeSent;
    constructor(id, serverId, type, user, timeSent) {
        super(id);
        this.ServerId = serverId;
        this.Type = type;
        this.User = user;
        this.TimeSent = timeSent ?? lite_1.Timestamp.now();
    }
}
exports.MessageInfo = MessageInfo;
class RandomPackMessage extends MessageInfo {
    Pack;
    Opened;
    IgnoreCooldown;
    BeingOpenedBy;
    constructor(id, serverId, pack, opened, ignoreCooldown, user, timeSent) {
        super(id, serverId, "RandomPack", user, timeSent);
        this.Pack = pack;
        this.Opened = opened;
        this.IgnoreCooldown = ignoreCooldown;
        this.BeingOpenedBy = undefined;
    }
    GetData() {
        if (this.User === undefined) {
            return {
                Type: this.Type,
                Opened: this.Opened,
                Pack: this.Pack
            };
        }
        else {
            return {
                Type: this.Type,
                User: this.User,
                Opened: this.Opened,
                Pack: this.Pack
            };
        }
    }
}
exports.RandomPackMessage = RandomPackMessage;
class PigGalleryMessage extends MessageInfo {
    CurrentPig;
    PigCounts;
    Pigs;
    NewPigs;
    SeenPigs;
    FavouritePigs;
    SharedPigs;
    ShowFavouriteButton;
    ShowSet;
    constructor(id, serverId, currentPig, pigCounts, pigs, newPigs, seenPigs, favouritePigs, sharedPigs, showFavouriteButton, showSet, user, timeSent) {
        super(id, serverId, "PigGallery", user, timeSent);
        this.CurrentPig = currentPig;
        this.PigCounts = pigCounts;
        this.Pigs = pigs;
        this.NewPigs = newPigs;
        this.SeenPigs = seenPigs;
        this.FavouritePigs = favouritePigs;
        this.SharedPigs = sharedPigs;
        this.ShowFavouriteButton = showFavouriteButton;
        this.ShowSet = showSet;
    }
    GetData() {
        if (this.User === undefined) {
            return {
                Type: this.Type,
                CurrentPig: this.CurrentPig,
                Pigs: this.Pigs,
                NewPigs: this.NewPigs
            };
        }
        else {
            return {
                Type: this.Type,
                User: this.User,
                CurrentPig: this.CurrentPig,
                Pigs: this.Pigs,
                NewPigs: this.NewPigs
            };
        }
    }
}
exports.PigGalleryMessage = PigGalleryMessage;
class PigListMessage extends MessageInfo {
    PigCounts;
    PigsBySet;
    FavouritePigs;
    SharedPigs;
    CurrentSet;
    CurrentPage;
    constructor(id, serverId, pigCounts, pigsBySet, favouritePigs, sharedPigs, currentSet, currentPage, user, timeSent) {
        super(id, serverId, "PigList", user, timeSent);
        this.PigCounts = pigCounts;
        this.PigsBySet = pigsBySet;
        this.FavouritePigs = favouritePigs;
        this.SharedPigs = sharedPigs;
        this.CurrentSet = currentSet;
        this.CurrentPage = currentPage;
    }
}
exports.PigListMessage = PigListMessage;
class PigTradeMessage extends MessageInfo {
    TradeStarterID;
    TradeReceiverID;
    TradeStarterOffer;
    TradeReceiverOffer;
    ChannelSentID;
    constructor(id, serverId, tradeStarterId, tradeReceiverId, tradeStarterOffer, tradeReceiverOffer, channelSentID) {
        super(id, serverId, "PigTrade", tradeReceiverId);
        this.TradeStarterID = tradeStarterId;
        this.TradeReceiverID = tradeReceiverId;
        this.TradeStarterOffer = tradeStarterOffer;
        this.TradeReceiverOffer = tradeReceiverOffer;
        this.ChannelSentID = channelSentID;
    }
}
exports.PigTradeMessage = PigTradeMessage;
class PigFoilMessage extends MessageInfo {
    OfferedPigs;
    Set;
    Rarity;
    constructor(id, serverId, user, offeredPigs, set, rarity) {
        super(id, serverId, "PigFoil", user);
        this.OfferedPigs = offeredPigs;
        this.Set = set;
        this.Rarity = rarity;
    }
}
exports.PigFoilMessage = PigFoilMessage;
class FoilChecksMessage extends MessageInfo {
    PigAmountsPerSet;
    CurrentPage;
    constructor(id, serverId, user, pigAmountsPerSet) {
        super(id, serverId, "FoilChecks", user);
        this.PigAmountsPerSet = pigAmountsPerSet;
        this.CurrentPage = 0;
    }
}
exports.FoilChecksMessage = FoilChecksMessage;
exports.CachedMessageInfosPerServer = {};
function GetMsgInfoCacheForServer(serverId) {
    let msgInfoCacheForServer = exports.CachedMessageInfosPerServer[serverId];
    if (msgInfoCacheForServer === undefined) {
        exports.CachedMessageInfosPerServer[serverId] = [];
        msgInfoCacheForServer = exports.CachedMessageInfosPerServer[serverId];
    }
    return msgInfoCacheForServer;
}
exports.GetMsgInfoCacheForServer = GetMsgInfoCacheForServer;
function GetMessageInfoFromCache(serverId, msgId) {
    const cachedMessageInfos = GetMsgInfoCacheForServer(serverId);
    const found = cachedMessageInfos.find(msg => msg.ID === msgId);
    return found;
}
exports.GetMessageInfoFromCache = GetMessageInfoFromCache;
function AddMessageInfoToCache(msgInfo) {
    const cachedMessageInfos = GetMsgInfoCacheForServer(msgInfo.ServerId);
    cachedMessageInfos.push(msgInfo);
}
exports.AddMessageInfoToCache = AddMessageInfoToCache;
function AddMessageInfosToCache(packs) {
    for (let i = 0; i < packs.length; i++) {
        const pack = packs[i];
        AddMessageInfoToCache(pack);
    }
}
exports.AddMessageInfosToCache = AddMessageInfosToCache;
function GetMessageInfo(serverId, msgId) {
    const cachedMsgInfo = GetMessageInfoFromCache(serverId, msgId);
    return cachedMsgInfo;
}
exports.GetMessageInfo = GetMessageInfo;
function IsUserInTrade(userId) {
    for (const serverID in exports.CachedMessageInfosPerServer) {
        const cachedMessages = exports.CachedMessageInfosPerServer[serverID];
        const isInTrade = cachedMessages.some(m => {
            const message = m;
            return message.Type === "PigTrade" &&
                (message.TradeStarterID === userId || message.TradeReceiverID === userId);
        });
        if (isInTrade) {
            return true;
        }
    }
    return false;
}
exports.IsUserInTrade = IsUserInTrade;
function RemoveMessageInfoFromCache(msgInfo) {
    const msgInfoCache = GetMsgInfoCacheForServer(msgInfo.ServerId);
    const index = msgInfoCache.indexOf(msgInfo);
    msgInfoCache.splice(index, 1);
}
exports.RemoveMessageInfoFromCache = RemoveMessageInfoFromCache;
function GetTradeOfferForUser(userID) {
    for (const serverID in exports.CachedMessageInfosPerServer) {
        const messagesCache = exports.CachedMessageInfosPerServer[serverID];
        const foundTrade = messagesCache.find(m => {
            const message = m;
            return message.Type === "PigTrade" && message.TradeReceiverID === userID;
        });
        if (foundTrade !== undefined) {
            return foundTrade;
        }
    }
    return undefined;
}
exports.GetTradeOfferForUser = GetTradeOfferForUser;
