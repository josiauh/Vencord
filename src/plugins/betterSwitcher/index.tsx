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
import { GuildStore, openModal, showToast, Toasts } from "@webpack/common";

import ASModal from "./switcher";

const ghostData = DataStore.createStore("BetterSwitcher", "GhostServers");

function keydownHandler(e: KeyboardEvent) {
    if (e.ctrlKey && e.key === "y") {
        openModal(props => <ASModal modalProps={props} />);
    }
}

// spooky dont let the ghosts get to you
function initializeGhosts() {
    const allGuilds = GuildStore.getGuildIds();
    allGuilds.forEach(async v => {
        await DataStore.set(v, Date.now(), ghostData);
    });
    showToast("Initialized ghosts!", Toasts.Type.SUCCESS);
}

export const settings = definePluginSettings({
    sortByFzf: {
        type: OptionType.BOOLEAN,
        description: "Sort message finds by fuzzy finding when on, sort by date when off (ONLY applies to messages, everything else is fzf by default)",
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
        description: "Prefer the username of a user instead of displaying their global name or nickname"
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
    authors: [Devs.oky],

    settings,
    settingsAboutComponent: () => (
        <>
            <Heading tag="h3">This is BetterSwitcher!</Heading>
            <Paragraph>
                BetterSwitcher is a better search bar, adding new filters to the base discord search. You can activate this modal with <span style={{
                    fontWeight: "bold"
                }}>Ctrl+Y</span>.
            </Paragraph>
        </>
    ),

    tags: [
        "Shortcuts", "Utility"
    ],

    async start() {
        // Initialize ghosting data
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
