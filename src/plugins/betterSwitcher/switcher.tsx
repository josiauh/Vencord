/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Button } from "@components/Button";
import { ModalContent, ModalProps, ModalRoot } from "@utils/modal";
import { React, TextInput } from "@webpack/common";

import CategorySwitch from "./components/CategorySwitch";

// setting up for making the actual css sheet, but for now we ball inline
// const cl = classNameFactory("vc-plugin-advPal-");

export default function ASModal({ rootProps }: { rootProps: ModalProps; }) {

    const [query, setQuery] = React.useState("");
    const [option, setOption] = React.useState(0);

    const options = ["Favorited", "Friends", "Recent Messsages", "Channels", "Servers"];

    return (
        <ModalRoot {...rootProps}>
            <ModalContent>
                <div style={{ padding: "25px", display: "flex", flexDirection: "column", gap: "8px" }}>
                    <CategorySwitch
                        onSelect={setOption}
                        choices={options}
                        choice={option}
                    />
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <TextInput value={query} onChange={setQuery} placeholder="Look for..." />
                        <Button>Go</Button>
                    </div>
                    <div style={{ display: "flex", gap: "8px", flexDirection: "column" }}>
                        PLACEHOLDER
                    </div>
                </div>
            </ModalContent>
        </ModalRoot>
    );
}
