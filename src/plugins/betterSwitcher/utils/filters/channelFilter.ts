/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Filter } from "@plugins/betterSwitcher/utils/types";
import { Channel } from "@vencord/discord-types";
import { PermissionsBits, PermissionStore } from "@webpack/common";

export async function filterHandlerChannel(filter: Filter, channel: Channel): Promise<boolean> {
    const invert = filter.name.startsWith("not!");
    const filterName = (invert ? filter.name.slice(4) : filter.name).toLowerCase();
    console.log(filterName);

    switch (filter.name) {
        case "is":
            return await isHandlerChannel(filter, channel) !== invert;
    }
    return !invert;
}

async function isHandlerChannel(filter: Filter, channel: Channel): Promise<Boolean> {
    switch (filter.value) {
        case "readonly": {
            return !PermissionStore.can(PermissionsBits.SEND_MESSAGES, channel);
        }
    }
    return true;
}
