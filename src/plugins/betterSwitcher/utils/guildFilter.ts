/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Guild } from "@vencord/discord-types";
import { ChannelStore, GuildMemberStore, GuildRoleStore, PermissionsBits, PermissionStore } from "@webpack/common";

import { Filter, GuildFolder } from "./types";

export async function filterHandlerGuild(filter: Filter, guild: Guild, folders?: GuildFolder[]): Promise<boolean> {
    const invert = filter.name.startsWith("not!");
    const filterName = (invert ? filter.name.slice(4) : filter.name).toLowerCase();
    console.log(filterName);
    switch (filterName) {
        case "folder":
            if (filter.value === "noFolder")
                return folders?.every(v => !v.guildIds.includes(guild.id)) !== invert;
            if (folders)
                return folders?.find(v => v.folderName === filter.value)?.guildIds.includes(guild.id) !== invert; // null and undefined are falsy values so i guess.
            console.log("no folders");
            break;
        case "is":
            return await isHandlerGuild(filter.value, guild) !== invert;
    }

    return !invert;
}

async function isHandlerGuild(value: string, guild: Guild): Promise<boolean> {
    switch (value.toLowerCase()) {
        case "ghosted": {
            return false; // return to at a later date i cant do this
        }
        case "readonly": {
            const channels = ChannelStore.getChannelIds(guild.id);
            return channels.length === 0 || channels.every(v => {
                const chan = ChannelStore.getChannel(v);
                return !PermissionStore.can(PermissionsBits.SEND_MESSAGES, chan);
            });
        }
        case "mod": {
            const member = GuildMemberStore.getSelfMember(guild.id);
            if (!member) return false;

            const allRoles = GuildRoleStore.getSortedRoles(guild.id);
            const userRoles = allRoles.filter(role =>
                role.id === guild.id || member.roles.includes(role.id)
            );

            return userRoles.some(v => {
                const moderationPerms = PermissionsBits.MODERATE_MEMBERS | PermissionsBits.KICK_MEMBERS | PermissionsBits.MANAGE_MESSAGES;
                return (v.permissions & moderationPerms) !== 0n;
            });
        }
        case "admin":
            const member = GuildMemberStore.getSelfMember(guild.id);
            if (!member) return false;

            const allRoles = GuildRoleStore.getSortedRoles(guild.id);
            const userRoles = allRoles.filter(role =>
                role.id === guild.id || member.roles.includes(role.id)
            );

            return userRoles.some(v => {
                return (v.permissions & PermissionsBits.ADMINISTRATOR) !== 0n;
            });
        case "boosted": {
            const member = GuildMemberStore.getSelfMember(guild.id);
            if (!member) return false;

            return member?.premiumSince != null;
        }
    }
    return true;
}
