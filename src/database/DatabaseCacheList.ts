import { doc, DocumentData, DocumentReference, setDoc } from "firebase/firestore/lite";
import { DatabaseElement } from "./DatabaseElement";
import { MessageInfo } from "./MessageInfo";
import { Pack } from "./Packs";
import { Pig } from "./Pigs";
import { ServerInfo } from "./ServerInfo";
import { UserInfo } from "./UserInfo";
import { db } from "../Bot";

const MAX_CACHE_SIZE = 300;

interface SaveData {
    doc: DocumentReference<DocumentData>
    data: object
}
const saveQueue: SaveData[] = [];

export function SaveItems(){
    const saveData = saveQueue.shift();

    if(saveData !== undefined){
        setDoc(saveData.doc, saveData.data);
    }
}

function GetDocumentReference(element: DatabaseElement): DocumentReference | undefined {
    if (element instanceof Pig) {
        return doc(db, `pigs/${element.ID}`);
    } else if (element instanceof Pack) {
        return doc(db, `packs/${element.ID}`);
    } else if (element instanceof ServerInfo){
        return doc(db, `serverInfo/${element.ID}`);
    } else if (element instanceof UserInfo) {
        return doc(db, `users/${element.ID}`);
    } else if (element instanceof MessageInfo) {
        return doc(db, `serverInfo/${element.ServerId}/messages/${element.ID}`);
    }

    return undefined;
}

export class DatabaseElementList<T extends DatabaseElement> {
    Elements: T[];

    constructor() {
        this.Elements = [];
    }

    async Add(element: T) {
        let foundElement = this.Get(element.ID)
        if(foundElement !== undefined){
            //The element is already on the list, replace it
            //so the newer changes get properly applied
            let foundIndex = this.Elements.indexOf(foundElement);
            this.Elements[foundIndex] = element;

            return;
        }

        if (this.Elements.length >= MAX_CACHE_SIZE) {
            const firstElement = this.Elements.shift();

            if (firstElement !== undefined) {
                const document = GetDocumentReference(firstElement);

                if (document !== undefined) {
                    saveQueue.push({
                        doc: document,
                        data: firstElement.GetData()
                    });
                }
            }
        }

        this.Elements.push(element);
    }

    async SaveAll(){
        this.Elements.forEach(async element => {
            const document = GetDocumentReference(element);

            if (document !== undefined) {
                await setDoc(document, element.GetData());
                await new Promise(r => setTimeout(r, 100)); 
            }
        });
    }

    Get(id: string): T | undefined {
        for (let i = 0; i < this.Elements.length; i++) {
            const element = this.Elements[i];

            if (element.ID === id) {
                this.Elements.splice(i, 1);
                this.Elements.push(element);

                return element;
            }
        }

        return undefined;
    }

    ForEach(callbackFn: (elem: T) => void) {
        this.Elements.forEach(callbackFn);   
    }

    Filter(filterFn: (elem: T) => boolean): T[]{
        const filteredElements: T[] = []

        this.ForEach(elem => {
            if(filterFn(elem)){
                filteredElements.push(elem);
            }
        });

        return filteredElements;
    }
}