/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { DataStore } from "@api/index";
import { definePluginSettings } from "@api/Settings";
import { Button } from "@components/Button";
import { Heading } from "@components/Heading";
import { Paragraph } from "@components/Paragraph";
import { Devs } from "@utils/constants";
import definePlugin, { OptionType } from "@utils/types";
import { ChannelStore, GuildStore, openModal, showToast, Toasts, UserStore } from "@webpack/common";

import ASModal from "./switcher";

export const ghostData = DataStore.createStore("BetterSwitcher", "GhostServers");
const seen = new Set();

function keydownHandler(e: KeyboardEvent) {
    if (e.ctrlKey && e.key === "y") {
        openModal(props => <ASModal modalProps={props} />);
    }
}

// spooky dont let the ghosts get to you
async function initializeGhosts() {
    await DataStore.clear(ghostData);

    const allGuilds = GuildStore.getGuildIds();
    const allChannelIDs = ChannelStore.getSortedPrivateChannels()
        .map(v => v.id);
    const keys = [allGuilds, allChannelIDs].flat();
    const values = keys.map<[string, number]>(v => [v, Date.now()]);
    await DataStore.setMany(values, ghostData);
    showToast("Guilds and channels now tracked for ghosting!", Toasts.Type.SUCCESS);
}

export const settings = definePluginSettings({
    sortByFzf: {
        type: OptionType.BOOLEAN,
        description: "Sort messages by fuzzy find instead of date",
        default: false
    },
    messagePreviewLength: {
        type: OptionType.SLIDER,
        markers: [3, 100],
        default: 10,
        stickToMarkers: false,
        description: "How long a message will be before being cut off"
    },
    userPreviewLength: {
        type: OptionType.SLIDER,
        markers: [3, 32],
        default: 10,
        stickToMarkers: false,
        description: "How long a username will be before being cut off"
    },
    preferUsernameOverDisplay: {
        type: OptionType.BOOLEAN,
        description: "Usernames will display instead of display names"
    },
    trackGhosting: {
        type: OptionType.BOOLEAN,
        description: "Enable the option to check ghosted servers and dms"
    },
    ghostTime: {
        type: OptionType.SLIDER,
        markers: [1, 30],
        default: 7,
        stickToMarkers: false,
        description: "In days, how long a server/dm has to be inactive to be ghosted"
    },
    resetGhosted: {
        type: OptionType.COMPONENT,
        component: () => {
            return <Button
                onClick={initializeGhosts}
            >Reset Ghosted Servers</Button>;
        }
    }
});

export default definePlugin({
    name: "BetterSwitcher",
    description: "Adds a new switcher modal!",
    authors: [Devs.josiah],

    settings,
    settingsAboutComponent: () => (
        <>
            <Heading tag="h3">This is BetterSwitcher!</Heading>
            <Paragraph>
                BetterSwitcher is a better search modal, adding new filters to the base discord search. You can activate this modal with <span style={{
                    fontWeight: "bold"
                }}>Ctrl+Y</span>.
            </Paragraph>
        </>
    ),

    tags: [
        "Shortcuts", "Utility"
    ],

    flux: {
        MESSAGE_CREATE: async e => {
            if (e.message.author.id !== UserStore.getCurrentUser().id) return;
            if (seen.has(e.message.id)) return;
            seen.add(e.message.id);
            setTimeout(() => seen.delete(e.message.id), 500);
            const key = e.guildId ?? e.channelId;
            await DataStore.set(key, Date.now(), ghostData);
        }
    },

    async start() {
        const ghostEntries = await DataStore.entries(ghostData);
        if (ghostEntries.length === 0 && settings.store.trackGhosting) {
            initializeGhosts();
        }
        document.addEventListener("keydown", keydownHandler);
    },

    stop() {
        document.removeEventListener("keydown", keydownHandler);
    }
});
