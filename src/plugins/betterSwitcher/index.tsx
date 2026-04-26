/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Devs } from "@utils/constants";
import { openModal } from "@utils/modal";
import definePlugin from "@utils/types";

import ASModal from "./switcher";

function keydownHandler(e: KeyboardEvent) {
    if (e.ctrlKey && e.key === "y") {
        openModal(props => <ASModal rootProps={props} />);
    }
}

export default definePlugin({
    name: "BetterSwitcher",
    description: "When Quick Finder bad and Search bad! (Ctrl+Y)",
    authors: [Devs.oky],

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
