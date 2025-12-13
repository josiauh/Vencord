/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { definePluginSettings } from "@api/Settings";
import { Devs } from "@utils/constants";
import { Logger } from "@utils/Logger";
import definePlugin, { OptionType } from "@utils/types";
import { FluxDispatcher } from "@webpack/common";

const subscriptions = {
    msgCreate: undefined as any,
    channelSwitch: undefined as any,
};

export const settings = definePluginSettings({
    port: {
        type: OptionType.NUMBER,
        default: 8080,
        description: "Your websocket server's port",
    },
    simplifyEvents: {
        type: OptionType.BOOLEAN,
        default: false,
        description: "Sends simplified events, better for simple servers but you lose LOTS of data.",
    }
});

let socket: WebSocket | null = null;

const logger = new Logger("DiscSock", "purple");

function trimMsgCreateEvent(event: any) {
    return {
        "guildId": event.guildId,
        "channelId": event.channelId,
        "author": {
            "id": event.message.author.id || "",
            "username": event.message.author.username || "",
            "isBot": event.message.author.bot || false,
        },
        "content": event.message.content || "",
        "attachments": event.attachments || []
    };
}

export default definePlugin({
    name: "DiscSock",
    authors: [Devs.freesmart],
    description: "obs-websockets but discord",

    settings,

    start() {
        const { port, simplifyEvents } = settings.store;
        logger.info("currently starting up - connecting to ws");
        socket = new WebSocket(`ws://127.0.0.1:${port}`);

        logger.info("registered socket");
        socket.onopen = () => {
            logger.info("connected!");
            socket?.send(JSON.stringify({
                type: "HELO",
                data: "read if cute"
            }));
        };

        socket.onerror = er => {
            logger.error("WebSocket error:", er);
        };

        subscriptions.msgCreate = FluxDispatcher.subscribe("MESSAGE_CREATE", event => {
            if (socket?.readyState !== WebSocket.OPEN) return;

            try {
                logger.log(event); // log full event until we know what to do
                socket.send(JSON.stringify({
                    type: "message",
                    data: simplifyEvents ? trimMsgCreateEvent(event) : event,
                }));
            } catch (err) {
                logger.error("failure to send message!", err);
            }
        });

        subscriptions.channelSwitch = FluxDispatcher.subscribe("CHANNEL_SELECT", event => {
            if (socket?.readyState !== WebSocket.OPEN) return;

            try {
                socket.send(JSON.stringify({
                    type: "channelSwitch",
                    data: simplifyEvents ? {
                        channelId: event.channelId,
                        guildId: event.guildId,
                    } : event,
                }));
            } catch (err) {
                logger.error("failure to send channel switch!", err);
            }
        });
    },

    stop() {
        Object.values(subscriptions).forEach(unsub => unsub());
        socket?.close();
        socket = null;
    }
});
