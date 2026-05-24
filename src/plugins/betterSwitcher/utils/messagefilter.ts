/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Message } from "@vencord/discord-types";
import { MessageFlags, MessageType } from "@vencord/discord-types/enums";

import { Filter } from "./types";

// Message functionality (all WIP)

export function filterHandlerMessage(filter: Filter, message: Message): boolean {
    const invert = filter.name.startsWith("not!");
    const filterName = invert ? filter.name.slice(4) : filter.name;

    switch (filterName) {
        case "is":
            return isFilterHandlerMessage(filter.value, message) === !invert;
        case "reaction":
            return reactionHandler(filter.value, message) === !invert;
    }

    return !invert; // if a filter doesn't exist, there's not really anything needed
}

function reactionHandler(value: string, message: Message) {
    return message.reactions.some(v => {
        return v.emoji.name === value || v.emoji.id === value;
    });
}

function isFilterHandlerMessage(value: string, message: Message) {
    switch (value) {
        case "reply":
            return message.type === MessageType.REPLY;
        case "edited":
            return message.isEdited();
        case "spawnThread":
            return (message.flags & MessageFlags.HAS_THREAD) !== 0;
    }

    return true;
}

