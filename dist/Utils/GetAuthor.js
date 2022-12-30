"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAuthor = void 0;
function GetAuthor(interaction) {
    if (interaction.user === null) {
        return null;
    }
    const user = interaction.user;
    const username = user.username;
    const avatar = user.avatarURL();
    return { name: username, iconURL: avatar === null ? "" : avatar };
}
exports.GetAuthor = GetAuthor;
