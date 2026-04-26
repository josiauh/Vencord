/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Message } from "@vencord/discord-types";
import { MessageFlags } from "@vencord/discord-types/enums";

export type Filter = {
    name: string,
    value: string;
};

export function filterHandlerMessage(filter: Filter, message: Message): boolean {
    let invert = false;

    if (filter.name.startsWith("not!")) {
        console.log("Inverting!");
        invert = true;
        filter.name = filter.name.slice(4);
        console.log(filter.name);
    }

    switch (filter.name) {
        case "is":
            return isFilterHandlerMessage(filter.value, message) === !invert;
        case "reaction":
            return reactionHandler(filter.value, message) === !invert;
    }

    return true; // if a filter doesn't exist, there's not really anything needed
}

function reactionHandler(value: string, message: Message) {
    return message.reactions.some(v => {
        v.emoji.name === value || v.emoji.id === value;
    });
}

//             const privileged = [
//                 PermissionsBits.MANAGE_MESSAGES, PermissionsBits.VIEW_AUDIT_LOG, PermissionsBits.MANAGE_WEBHOOKS
//             ];

function isFilterHandlerMessage(value: string, message: Message) {
    switch (value) {
        case "reply":
            return message.messageReference !== null;
        case "edited":
            return message.isEdited();
        case "spawnThread":
            return (message.flags & MessageFlags.HAS_THREAD) !== 0;
    }

    return true;
}
