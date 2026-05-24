/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { User } from "@vencord/discord-types";
import { RelationshipType } from "@vencord/discord-types/enums";
import { RelationshipStore } from "@webpack/common";

import { Filter } from "./types";

// User functional

export function filterHandlerUser(filter: Filter, user: User): boolean {
    const invert = filter.name.startsWith("not!");
    const filterName = invert ? filter.name.slice(4) : filter.name;

    switch (filterName) {
        case "is":
            return isFilterHandlerUser(filter.value, user) !== invert;
    }

    return !invert;
}


function pendingFilterHandler(user: User) {
    const relType = RelationshipStore.getRelationshipType(user.id);
    return relType === RelationshipType.INCOMING_REQUEST || relType === RelationshipType.OUTGOING_REQUEST;
}

function isFilterHandlerUser(value: string, user: User) {
    switch (value) {
        case "pending":
            return pendingFilterHandler(user);
    }
    return true;
}
