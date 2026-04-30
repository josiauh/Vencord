/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Channel, Message, ThreadMember } from "@vencord/discord-types";
import { Constants, RestAPI } from "@webpack/common";

import { Filter } from "./filter";

const supported = ["offset", "content", "mentions", "mentions_role_id", "has", "pinned", "author_id", "author_type", "channel_id", "embed_type", "embed_provider"] as const;

type URLParams = Partial<Record<typeof supported[number], string>>;

function filtersToParams(filters: Filter[]): [params: URLParams, passthroughFilters: Filter[]] {

    const throwaway: Filter[] = [];
    const params: URLParams = {};
    filters.forEach(v => {
        if (!(v.name in supported)) {
            throwaway.push(v);
            return;
        }
        params[v.name] = v.value;
    });

    return [params, throwaway];
}

// Source: https://docs.discord.food/resources/message#response-body
interface ResponseBody {
    analytics_id: string;
    doing_deep_historical_index: boolean;
    documents_indexed?: number;
    total_results: number;
    messages: Message[][];
    channels?: Channel[];
    threads?: Channel[];
    members?: ThreadMember[];
}


// Separate thing for handling API search because its yea
export async function searchDiscAPI(input: string, guildId: string, filters: Filter[]): Promise<[messages: Message[], filters: Filter[]]> {
    const [params, newFilters] = filtersToParams(filters);
    params.content = input;

    const { body } = await RestAPI.get({
        url: Constants.Endpoints.SEARCH_GUILD(guildId),
        query: params
    });

    const messages = (body as ResponseBody).messages.flat();

    return [messages, newFilters];
}
