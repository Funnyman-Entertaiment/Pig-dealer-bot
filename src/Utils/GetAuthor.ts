import { CommandInteraction } from "discord.js";

export function GetAuthor(interaction: CommandInteraction){
    if(interaction.user === null){
        return null;
    }

    const user = interaction.user;
    const username = user.username;
    const avatar = user.avatarURL();
    
    return {name: username, iconURL: avatar === null? "" : avatar}
}