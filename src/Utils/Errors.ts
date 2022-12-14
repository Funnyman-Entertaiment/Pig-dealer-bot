import { Colors, EmbedBuilder } from "discord.js";

export function MakeErrorEmbed(title: string, ...descriptions: string[]){
    let description = "Message anna or thicco inmediatly!!";

    descriptions.forEach(extraDescriptionLine => {
        description = extraDescriptionLine + "\n" + description;
    });

    const errorEmbed = new EmbedBuilder()
        .setTitle(`⚠${title}⚠`)
        .setDescription(description)
        .setColor(Colors.DarkRed);

    return errorEmbed;
}