/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { settings } from "@plugins/betterSwitcher/index";
import { Guild, Message, User } from "@vencord/discord-types";
import { findByPropsLazy } from "@webpack";
import { Constants, GuildStore, MessageStore, RelationshipStore, SelectedChannelStore, SelectedGuildStore, UserStore } from "@webpack/common";

import { searchDiscAPI } from "./apiSearch";
import { guildFZF, messageFZF, userFZF } from "./fzf";
import { filterHandlerGuild } from "./guildFilter";
import { filterHandlerMessage } from "./messagefilter";
import { Filter, GuildFolder } from "./types";
import { filterHandlerUser } from "./userFilter";

const { getGuildFolders } = findByPropsLazy("getGuildFolders");

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

async function allSearch(input: string, filters?: Filter[]): Promise<[Message[], number]> {
    let [lastMessages, newFilters]: [Message[], Filter[]] = [[], []];
    if (SelectedGuildStore.getGuildId() === null && SelectedChannelStore.getChannelId()) {
        [lastMessages, newFilters, length] = await searchDiscAPI(input, Constants.Endpoints.SEARCH_CHANNEL(SelectedChannelStore.getChannelId()), filters ?? []);
    } else if (SelectedGuildStore.getGuildId()) {
        [lastMessages, newFilters, length] = await searchDiscAPI(input, Constants.Endpoints.SEARCH_GUILD(SelectedGuildStore.getGuildId()!), filters ?? []);
    } else {
        return [[], 0];
    }

    const words = input.toLowerCase().split(/\s+/);

    let filtered = lastMessages
        .filter(msg => words.some(w => msg.content.toLowerCase().includes(w)));
    // unlike the recent search, the results are already sorted by date (thank you discord)
    if (settings.store.sortByFzf)
        filtered = messageFZF(filtered, input);
    if (newFilters)
        filtered = filtered.filter(v => newFilters.every(f => filterHandlerMessage(f, v)));

    return [filtered, length];
}

// Base searching
function userSearch(input: string, users: User[], filters?: Filter[]): [User[], number] {
    const words = input.toLowerCase().split(/\s+/);

    let filtered = users.filter(user =>
        words.some(word =>
            user.username.toLowerCase().includes(word)
            || user.globalName?.toLowerCase().includes(word)
        )
    );

    if (filters)
        filtered = filtered.filter(v => filters.every(f => filterHandlerUser(f, v)));

    filtered = userFZF(filtered, input);

    return [filtered, filtered.length];
}

async function guildSearch(input: string, filters?: Filter[], folders?: GuildFolder[]): Promise<[Guild[], number]> {
    const guilds = GuildStore.getGuildsArray();
    const words = input.toLowerCase().split(/\s+/);

    let filtered = guilds.filter(g =>
        words.some(word =>
            g.name.toLowerCase().includes(word)
        )
    );
    console.log(filters);

    if (filters?.length) {
        const out: Guild[] = [];
        for (const guild of filtered) {
            let ok = true;
            for (const f of filters) {
                if (!await filterHandlerGuild(f, guild, folders)) {
                    ok = false;
                    break;
                }
            }
            if (ok) out.push(guild);
        }
        filtered = out;
    }
    filtered = guildFZF(filtered, input);

    return [filtered, filtered.length];
}

export type SearchResult =
    { type: "message", data: Message[], count: number; } |
    { type: "user", data: User[], count: number; } |
    { type: "guild", data: Guild[], count: number; } |
    { type: "undefined"; };

export async function handleBaseSearch(input: string, option: number): Promise<SearchResult> {
    const filterRegex = /(\S+):(?:"([^"]+)"|(\S+))/g;
    const allFilters = [...input.matchAll(filterRegex)];

    const filters: Filter[] = allFilters.map<Filter>(v => ({
        name: v[1],
        value: v[2] ?? v[3]
    }));

    filterRegex.lastIndex = 0;

    const cleanedInput = input.replace(filterRegex, "").replace(/\s+/g, " ").trim();

    console.log("Searching for: ", cleanedInput);
    console.log("All filters: ", allFilters);

    switch (option) {
        case 0: {
            const relationshipIDs = RelationshipStore.getFriendIDs();
            const relationships = relationshipIDs
                .map(id => UserStore.getUser(id))
                .filter((user): user is User => user != null);
            console.log(relationships);
            const [data, count] = userSearch(cleanedInput, relationships);
            return {
                type: "user", data, count
            };
        }
        case 2: {
            const data = recentSearch(cleanedInput, filters);
            return {
                type: "message", data, count: data.length
            };
        }
        case 3: {
            const [data, count] = await allSearch(cleanedInput, filters);
            return {
                type: "message", data, count
            };
        }
        case 5: {
            const folders: GuildFolder[] = getGuildFolders();
            const [data, count] = await guildSearch(cleanedInput, filters, folders);
            return {
                type: "guild", data, count
            };
        }
    }

    return { type: "undefined" };
}

