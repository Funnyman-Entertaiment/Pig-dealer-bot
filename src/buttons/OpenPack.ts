import { Button } from "../Button";

export const OpenPack = new Button("OpenPack",
    async (_, interaction, db) => {
        const content = `I'm not having sex with you right now ${interaction.user.username}.`;

        await interaction.followUp({
            ephemeral: true,
            content
        });
    }
);