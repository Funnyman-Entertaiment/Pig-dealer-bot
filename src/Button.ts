import { ButtonInteraction, Client } from "discord.js";
import { Firestore } from "firebase/firestore/lite";

export class Button{
    id;
    response;

    constructor(id: string, 
    response: (client: Client, interaction: ButtonInteraction, db: Firestore) => void){
        this.id = id;
        this.response = response
    }
}
