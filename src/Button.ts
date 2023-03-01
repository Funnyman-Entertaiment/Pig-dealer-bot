import { ButtonInteraction } from "discord.js";
import { MessageInfo } from "./database/MessageInfo";
import { ServerInfo } from "./database/ServerInfo";
import { UserInfo } from "./database/UserInfo";

export class Button {
    id;
    requireServerInfo;
    requireMessageInfo;
    requireUserInfo;
    response;

    constructor(
        id: string,
        requireServerInfo: boolean,
        requireMessageInfo: boolean,
        requireUserInfo: boolean,
        response: (
            interaction: ButtonInteraction,
            serverInfo: ServerInfo | undefined,
            messageInfo: MessageInfo | undefined,
            userInfo: UserInfo | undefined
        ) => void
    ) {
        this.id = id;
        this.requireServerInfo = requireServerInfo;
        this.requireMessageInfo = requireMessageInfo;
        this.requireUserInfo = requireUserInfo;
        this.response = response;
    }
}
