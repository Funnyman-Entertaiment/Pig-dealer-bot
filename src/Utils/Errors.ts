import { Colors, EmbedBuilder } from "discord.js";

export function MakeErrorEmbed(title: string, ...descriptions: string[]){
    let description = "";

    descriptions.forEach(extraDescriptionLine => {
        description += "\n" + extraDescriptionLine;
    });

    if(description.length !== 0){
        description += "\n";
    }

    description += "Message anna or thicco inmediatly!!";

    const errorEmbed = new EmbedBuilder()
        .setTitle(`⚠${title}⚠`)
        .setDescription(description)
        .setColor(Colors.DarkRed);

    return errorEmbed;
}