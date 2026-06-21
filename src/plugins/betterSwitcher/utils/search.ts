/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { settings } from "@plugins/betterSwitcher/index";
import { Guild, GuildMember, Message, User } from "@vencord/discord-types";
import { findByPropsLazy } from "@webpack";
import { Constants, GuildMemberStore, GuildStore, MessageStore, RelationshipStore, SelectedChannelStore, SelectedGuildStore, UserStore } from "@webpack/common";

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
    let [lastMessages, newFilters, length]: [Message[], Filter[], number] = [[], [], 0];
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
async function userSearch(input: string, users: User[], filters?: Filter[]): Promise<[User[], number]> {
    const words = input.toLowerCase().split(/\s+/);
    let filtered = users.filter(user =>
        words.some(word =>
            user.username.toLowerCase().includes(word)
            || user.globalName?.toLowerCase().includes(word)
        )
    );

    if (filters) {
        const results = await Promise.all(
            filtered.map(async v => {
                const checks = await Promise.all(filters.map(f => filterHandlerUser(f, v)));
                return checks.every(Boolean);
            })
        );
        filtered = filtered.filter((_, i) => results[i]);
    }

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

    // for some reason, this works.
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
            const [data, count] = await userSearch(cleanedInput, relationships, filters);
            return {
                type: "user", data, count
            };
        }
        case 1: {
            const relationshipIDs = RelationshipStore.getMutableRelationships();
            const relationships = relationshipIDs
                .keys().toArray() // each key is the user id of every relationship. yes we need to convert to array
                .map(id => UserStore.getUser(id))
                .filter((user): user is User => user != null);
            const [data, count] = await userSearch(cleanedInput, relationships, filters);
            return {
                type: "user", data, count
            };
        }
        case 2: {
            const guildId = SelectedGuildStore.getGuildId();
            if (!guildId) return {
                type: "user", data: [], count: -1
            };
            const memberIds = GuildMemberStore.getMemberIds(guildId);
            const members = memberIds.map(v => GuildMemberStore.getMember(guildId, v))
                .filter((user): user is GuildMember => user != null);
            const users = members.map(v => UserStore.getUser(v?.userId!));
            if (!users) return {
                type: "user", data: [], count: -1
            };
            const [data, count] = await userSearch(cleanedInput, users, filters);
            return {
                type: "user", data, count
            };
        }
        case 3: {
            const data = recentSearch(cleanedInput, filters);
            return {
                type: "message", data, count: data.length
            };
        }
        case 4: {
            const [data, count] = await allSearch(cleanedInput, filters);
            return {
                type: "message", data, count
            };
        }
        case 6: {
            const folders: GuildFolder[] = getGuildFolders();
            const [data, count] = await guildSearch(cleanedInput, filters, folders);
            return {
                type: "guild", data, count
            };
        }
    }

    return { type: "undefined" };
}

