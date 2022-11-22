import { EmbedBuilder } from "@discordjs/builders";
import { doc, getDoc, updateDoc } from "firebase/firestore/lite";
import { Button } from "../Button";
import fs from 'fs';
import { GalleryInteractions } from "./GalleryInteractions";
import { RenderPig } from "./PigRenderer";


export const NextGallery = new Button("GalleryNext",
    async (_, interaction, db) => {
        await interaction.deferUpdate();

        const server = interaction.guild;
        if(server === null) { return; }
        const message = interaction.message;

        const msgDoc = doc(db, `serverInfo/${server.id}/messages/${message.id}`);
        const msgInfo = await getDoc(msgDoc);

        const originalInteraction = GalleryInteractions[message.id];

        if(originalInteraction === undefined){ return; }

        if(!msgInfo.exists() || msgInfo.data().Type !== "PigGallery"){ return; }

        const msgInfoData = msgInfo.data();

        if(interaction.user.id !== msgInfoData.User){ return; }

        if(msgInfoData.CurrentPig == (msgInfoData.Pigs as string[]).length - 1){ return; }

        const pigToLoad = msgInfoData.Pigs[msgInfoData.CurrentPig+1];

        await updateDoc(msgDoc, {
            CurrentPig: msgInfoData.CurrentPig+1,
        });

        RenderPig(message, pigToLoad, db);
    }
);