/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Button } from "@components/Button";
import { Heading } from "@components/Heading";
import { Span } from "@components/Span";
import { ModalContent, ModalHeader, ModalProps, ModalRoot } from "@utils/modal";
import { React, TextInput } from "@webpack/common";

import CategorySwitch from "./components/CategorySwitch";
import GenericResultCardGen from "./components/ResCardGen";
import { handleBaseSearch } from "./utils/search";

// setting up for making the actual css sheet, but for now we ball inline
// const cl = classNameFactory("vc-plugin-advPal-");

type _ModalState = {
    query: string,
    option: number,
    allResults: any[],
    apiResultCount: number,
};

var modalState: _ModalState = {
    query: "",
    option: 0,
    allResults: [],
    apiResultCount: -1
};

export default function ASModal({ rootProps }: { rootProps: ModalProps; }) {

    const [query, setQuery] = React.useState(modalState.query);
    const [option, setOption] = React.useState(modalState.option);

    const [allResults, setResults] = React.useState<any[]>(modalState.allResults);
    const [apiResultCount, setResCount] = React.useState(modalState.apiResultCount); // -1 means not from API

    const options = ["Favorited", "Friends", "Recent Messsages", "Channels", "Servers", "All Messages"];

    // unconventional save state functionality
    const saveState = () => {
        modalState = {
            query, option, allResults, apiResultCount
        };
    };

    React.useEffect(() => {
        saveState();
    }, [allResults, query]);

    // Extra handler, it's for extra stuff tbh
    const handleSearch = async (query: string, option: number) => {
        const res = await handleBaseSearch(query, option);

        // I'm not handling this any other way for now
        if (res.type === "undefined") throw "Undefined search results";

        setResults(res.data);
        setResCount(res.count);

        saveState();
        return res;
    };

    const getType = (selectedOption: number): "messages" | "users" => {
        switch (selectedOption) {
            case 1: return "users";
            case 2:
            case 5:
            default:
                return "messages";
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
                            onClick={async () => handleSearch(query, option)}
                        >Go</Button>
                    </div>
                    <div style={{ display: "flex", gap: "8px", flexDirection: "column" }}>
                        {apiResultCount === -1 || <Span>{apiResultCount} results</Span>}
                        <GenericResultCardGen results={allResults} type={getType(option)} />
                    </div>
                </div>
            </ModalContent>
        </ModalRoot>
    );
}
