/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Button } from "@components/Button";
import { Heading } from "@components/Heading";
import { ModalContent, ModalHeader, ModalProps, ModalRoot } from "@utils/modal";
import { React, TextInput } from "@webpack/common";

import CategorySwitch from "./components/CategorySwitch";
import GenericResultCardGen from "./components/ResCardGen";
import { handleSearch } from "./utils/search";

// setting up for making the actual css sheet, but for now we ball inline
// const cl = classNameFactory("vc-plugin-advPal-");

export default function ASModal({ rootProps }: { rootProps: ModalProps; }) {

    const [query, setQuery] = React.useState("");
    const [option, setOption] = React.useState(0);

    const [allResults, setResults] = React.useState<any[]>([]);

    const options = ["Favorited", "Friends", "Recent Messsages", "Channels", "Servers"];

    const getType = o => {
        switch (o) {
            default: return "messages";
            case "Recent Messages": return "messages";
            case "Friends": return "users";
        }
    };

    return (
        <ModalRoot {...rootProps}>
            <ModalHeader>
                <Heading>BetterSwitcher</Heading>
            </ModalHeader>
            <ModalContent>
                <div style={{ padding: "5px 25px", display: "flex", flexDirection: "column", gap: "8px" }}>
                    <CategorySwitch
                        onSelect={setOption}
                        choices={options}
                        choice={option}
                    />
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <TextInput value={query} onChange={setQuery} placeholder="Look for..." />
                        <Button
                            onClick={() => setResults(handleSearch(query, option))}
                        >Go</Button>
                    </div>
                    <div style={{ display: "flex", gap: "8px", flexDirection: "column" }}>
                        <GenericResultCardGen results={allResults} type={getType(option)} />
                    </div>
                </div>
            </ModalContent>
        </ModalRoot>
    );
}
