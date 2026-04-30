/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { definePluginSettings } from "@api/Settings";
import { Devs } from "@utils/constants";
import { openModal } from "@utils/modal";
import definePlugin, { OptionType } from "@utils/types";

import ASModal from "./switcher";

function keydownHandler(e: KeyboardEvent) {
    if (e.ctrlKey && e.key === "y") {
        openModal(props => <ASModal rootProps={props} />);
    }
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
    }
});

export default definePlugin({
    name: "BetterSwitcher",
    description: "When Quick Finder bad and Search bad! (Ctrl+Y)",
    authors: [Devs.oky],

    settings,

    tags: [
        "Shortcuts", "Utility"
    ],

    start() {
        document.addEventListener("keydown", keydownHandler);
    },

    stop() {
        document.removeEventListener("keydown", keydownHandler);
    }
});
