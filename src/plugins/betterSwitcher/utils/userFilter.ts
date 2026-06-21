/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { DataStore } from "@api/index";
import { User } from "@vencord/discord-types";
import { RelationshipType } from "@vencord/discord-types/enums";
import { RelationshipStore } from "@webpack/common";

import { ghostData, settings } from "..";
import { Filter } from "./types";

// User functional

const DAY_MS = 86_400_000;

export async function filterHandlerUser(filter: Filter, user: User): Promise<boolean> {
    const invert = filter.name.startsWith("not!");
    const filterName = invert ? filter.name.slice(4) : filter.name;

    switch (filterName) {
        case "is":
            return await isFilterHandlerUser(filter.value, user) !== invert;
    }

    return !invert;
}

// god whyd i need a pending handler?

async function isFilterHandlerUser(value: string, user: User) {
    switch (value) {
        case "pending": {
            const relType = RelationshipStore.getRelationshipType(user.id);
            return relType === RelationshipType.INCOMING_REQUEST || relType === RelationshipType.OUTGOING_REQUEST;
        }
        case "friend": {
            const relType = RelationshipStore.getRelationshipType(user.id);
            return relType === RelationshipType.FRIEND;
        }
        case "implicit": {
            const relType = RelationshipStore.getRelationshipType(user.id);
            return relType === RelationshipType.IMPLICIT;
        }
        case "suggested": {
            const relType = RelationshipStore.getRelationshipType(user.id);
            return relType === RelationshipType.SUGGESTION;
        }
        case "ghosted": {
            if (!settings.store.trackGhosting) return false;

            const lastActive = await DataStore.get<number>(user.id, ghostData);
            if (lastActive == null) return false;

            return Date.now() - lastActive >= settings.store.ghostTime * DAY_MS;
        }
    }
    return true;
}
