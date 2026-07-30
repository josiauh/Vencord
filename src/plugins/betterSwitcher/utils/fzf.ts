/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Channel, Guild, Message, User } from "@vencord/discord-types";

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

export function guildFZF(guilds: Guild[], input: string) {
    return guilds
        .map(g => ({
            g,
            distance: editDistance(input, g.name)
        }))
        .sort((a, b) => a.distance - b.distance)
        .map(({ g }) => g);
}

export function channelFZF(channels: Channel[], input: string) {
    return channels
        .map(c => ({
            c,
            distance: editDistance(input, c.name)
        }))
        .sort((a, b) => a.distance - b.distance)
        .map(({ c }) => c);
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
