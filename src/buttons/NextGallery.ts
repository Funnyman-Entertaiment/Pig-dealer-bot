import { EmbedBuilder } from "@discordjs/builders";
import { doc, getDoc, updateDoc } from "firebase/firestore/lite";
import { Button } from "../Button";
import { AddPigRenderToEmbed } from "../Utils/PigRenderer";


export const NextGallery = new Button("GalleryNext",
    async (_, interaction, db) => {
        await interaction.deferUpdate();

        const server = interaction.guild;
        if(server === null) { return; }
        const message = interaction.message;

        const msgDoc = doc(db, `serverInfo/${server.id}/messages/${message.id}`);
        const msgInfo = await getDoc(msgDoc);

        if(!msgInfo.exists() || msgInfo.data().Type !== "PigGallery"){ return; }

        const msgInfoData = msgInfo.data();

        if(interaction.user.id !== msgInfoData.User){ return; }

        if(msgInfoData.CurrentPig == (msgInfoData.Pigs as string[]).length - 1){ return; }

        const pigToLoad = msgInfoData.Pigs[msgInfoData.CurrentPig+1];

        await updateDoc(msgDoc, {
            CurrentPig: msgInfoData.CurrentPig+1,
        });

        const editedEmbed = new EmbedBuilder(message.embeds[0].data);

        const pigDoc = doc(db, `pigs/${pigToLoad}`);
        const pig = await getDoc(pigDoc);

        const imgPath = AddPigRenderToEmbed(editedEmbed, pig, msgInfoData.NewPigs.includes(pig.id));

        if(imgPath === undefined){ return; }

        await message.edit({
            embeds: [editedEmbed],
            files: [imgPath]
        })
    }
);