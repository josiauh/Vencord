/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Filter } from "@plugins/betterSwitcher/utils/types";
import { Message } from "@vencord/discord-types";
import { MessageFlags, MessageType } from "@vencord/discord-types/enums";
import { GuildMemberStore, SelectedGuildStore, SnowflakeUtils, UserStore } from "@webpack/common";

export function filterHandlerMessage(filter: Filter, message: Message): boolean {
    const invert = filter.name.startsWith("not!");
    const filterName = invert ? filter.name.slice(4) : filter.name;

    switch (filterName) {
        case "is":
            return isFilterHandlerMessage(filter.value, message) === !invert;
        case "reaction":
            return reactionHandler(filter.value, message) === !invert;
        case "mentions":
            return mentionsFilterHandler(filter.value, message) === !invert;
    }

    return !invert;
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

// Reimplement the discord filters

function mentionsFilterHandler(value: string, message: Message) {
    if (SnowflakeUtils.isProbablyAValidSnowflake(value)) return message.mentions.includes(value);

    const guildId = SelectedGuildStore.getGuildId();
    if (!guildId) return true;

    const members = GuildMemberStore.getMembers(guildId);
    const memb = members.find(v => {
        if (v.nick === value) return true;
        return UserStore.getUser(v.userId).username === value;
    });
    if (!memb) return true;
    return message.mentions.includes(memb.userId);
}
