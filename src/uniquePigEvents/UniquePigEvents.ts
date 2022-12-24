import { ButtonInteraction } from "discord.js";
import { UniquePigEvent } from "./UniquePigEvent";
import {StockingPigEvent} from "./StockingPig";

const UniquePigEvents: UniquePigEvent[] = [StockingPigEvent];


export function DoesPigIdHaveUniqueEvent(pigId: string){
    return UniquePigEvents.some(x => x.PigId === pigId);
}


export function TriggerUniquePigEvent(pigId: string, interaction: ButtonInteraction){
    const event = UniquePigEvents.find(x => x.PigId === pigId);

    if(event !== undefined){
        event.Response(interaction);
    }
}