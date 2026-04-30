/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { settings } from "@plugins/betterSwitcher/index";
import { Message, User } from "@vencord/discord-types";
import { ChannelStore, GuildStore, MessageStore, PermissionsBits, PermissionStore, RelationshipStore, SelectedChannelStore, SelectedGuildStore, UserStore } from "@webpack/common";

import { searchDiscAPI } from "./apiSearch";
import { Filter, filterHandlerMessage } from "./filter";

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

export function userFZF(arr: User[], input: string) {
    return arr
        .map(user => ({
            user,
            distance: Math.min(
                editDistance(input, user.username),
                editDistance(input, user.globalName ?? user.username)
            )
        }))
        .sort((a, b) => a.distance - b.distance)
        .map(({ user }) => user);
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

function recentSearch(input: string, filters?: Filter[]) {
    const currentID = SelectedChannelStore.getChannelId();
    const lastMessages: Message[] = currentID ? MessageStore.getMessages(currentID)._array // why's it locked between an array?
        : [];

    const words = input.toLowerCase().split(/\s+/);

    let filtered = lastMessages
        .filter(msg => words.some(w => msg.content.toLowerCase().includes(w)));
    filtered = settings.store.sortByFzf ? messageFZF(filtered, input) : filtered.sort((a, b) => a.timestamp.toTemporalInstant().epochMilliseconds - b.timestamp.toTemporalInstant().epochMilliseconds);

    if (filters)
        filtered = filtered.filter(v => filters.every(f => filterHandlerMessage(f, v)));

    return filtered;
}

async function allSearch(input: string, filters?: Filter[]) {
    const [lastMessages, newFilters] = await searchDiscAPI(input, SelectedGuildStore.getGuildId()!, filters ?? []);

    const words = input.toLowerCase().split(/\s+/);

    let filtered = lastMessages
        .filter(msg => words.some(w => msg.content.toLowerCase().includes(w)));
    // unlike the recent search, the results are already sorted by date (thank you discord)
    if (settings.store.sortByFzf)
        filtered = messageFZF(filtered, input);
    if (newFilters)
        filtered = filtered.filter(v => newFilters.every(f => filterHandlerMessage(f, v)));

    return filtered;
}

// Base searching
function userSearch(input: string, users: User[], filters?: Filter[]) {
    const words = input.toLowerCase().split(/\s+/);

    let filtered = users.filter(user =>
        words.some(word =>
            user.username.toLowerCase().includes(word)
            || user.globalName?.toLowerCase().includes(word)
        )
    );

    filtered = userFZF(filtered, input);

    return filtered;
}

export type SearchResult =
    { type: "message", data: Message[], count: number; } |
    { type: "user", data: User[], count: number; } |
    { type: "undefined"; };

export async function handleBaseSearch(input: string, option: number): Promise<SearchResult> {
    // values to search from
    const allGuilds = GuildStore.getGuilds();
    const allChannels = ChannelStore.getChannelIds()
        .map(id => ChannelStore.getChannel(id))
        .filter(v => PermissionStore.can(PermissionsBits.VIEW_CHANNEL, v));

    const results: any[] = [];

    const filterRegex = /(\S+):(\S+)/g;
    const allFilters = [...input.matchAll(filterRegex)];

    const filters: Filter[] = allFilters.map<Filter>(v => ({
        name: v[1],
        value: v[2]
    }));

    filterRegex.lastIndex = 0;

    const cleanedInput = input.replace(filterRegex, "").replace(/\s+/g, " ").trim();

    console.log("Searching for: ", cleanedInput);
    console.log("All filters: ", allFilters);

    switch (option) {
        case 1: {
            const relationshipIDs = RelationshipStore.getFriendIDs();
            const relationships = relationshipIDs
                .map(id => UserStore.getUser(id))
                .filter((user): user is User => user != null);
            console.log(relationships);
            return {
                type: "user", data: userSearch(cleanedInput, relationships), count: -1
            };
        }
        case 2: return {
            type: "message", data: recentSearch(cleanedInput, filters), count: -1
        };
        case 5: return {
            type: "message", data: await allSearch(cleanedInput, filters), count: -1
        };
    }

    return { type: "undefined" };
}
