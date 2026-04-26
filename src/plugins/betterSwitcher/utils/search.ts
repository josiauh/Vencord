/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Message } from "@vencord/discord-types";
import { findByProps } from "@webpack";
import { ChannelStore, GuildStore, MessageStore, PermissionsBits, PermissionStore, SelectedChannelStore } from "@webpack/common";

const editDistance = (input: string, target: string) => {
    const m = input.length;
    const n = target.length;

    const prev = new Array<number>(n + 1);
    const curr = new Array<number>(n + 1);

    for (let j = 0; j <= n; j++) {
        prev[j] = j;
    }

    for (let i = 1; i <= m; i++) {
        curr[0] = i;
        const inputChar = input[i - 1];

        for (let j = 1; j <= n; j++) {
            if (inputChar === target[j - 1]) {
                curr[j] = prev[j - 1];
            } else {
                curr[j] = 1 + Math.min(prev[j], curr[j - 1], prev[j - 1]);
            }
        }

        for (let j = 0; j <= n; j++) {
            prev[j] = curr[j];
        }
    }

    return prev[n];
};

// For use with Guild and Message
export function nameFZF(arr: { name: string; }[], input: string) {
    return arr
        .map(channel => ({
            channel,
            distance: editDistance(input, channel.name)
        }))
        .sort((a, b) => a.distance - b.distance)
        .map(({ channel }) => channel);
}

export function messageFZF(messages: Message[], input: string) {
    return messages
        .map(msg => ({
            msg,
            distance: editDistance(input, msg.content)
        }))
        .sort((a, b) => a.distance - b.distance)
        .map(({ msg }) => msg);
}

export function handleSearch(input: string, option: string) {

    const MessageActions = findByProps("jumpToMessage");
    // values to search from
    const allGuilds = GuildStore.getGuilds();
    const allChannels = ChannelStore.getChannelIds()
        .map(id => ChannelStore.getChannel(id))
        .filter(v => PermissionStore.can(PermissionsBits.VIEW_CHANNEL, v));

    // dang there are so many stores, might as well call it a marketplace
    const currentID = SelectedChannelStore.getChannelId();
    const lastMessages: Message[] = currentID ? MessageStore.getMessages(currentID)._array
        : [];

    const results: any[] = [];

    switch (option) {
        case "Favorites":

    }
}

