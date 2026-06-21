/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Button } from "@components/Button";
import { Span } from "@components/Span";
import { Channel, Guild, Message, RenderModalProps, User } from "@vencord/discord-types";
import { Modal, React, TabBar, TextInput } from "@webpack/common";

import GenericResultCardGen from "./components/ResCardGen";
import { handleBaseSearch } from "./utils/search";

// setting up for making the actual css sheet, but for now we ball inline
// const cl = classNameFactory("vc-plugin-advPal-");

type _ResType = "users" | "messages" | "guilds" | "channels" | null;
type _ResArrayType = User[] | Message[] | Guild[] | Channel[] | null;

type _ModalState = {
    query: string,
    option: number,
    allResults: _ResArrayType,
    apiResultCount: number,
    isOpen: boolean,
};

var modalState: _ModalState = {
    query: "",
    option: 0,
    allResults: [],
    apiResultCount: -1,
    isOpen: false
};

function optToResType(option: number): _ResType {
    switch (option) {
        case 0:
        case 1:
        case 2:
            return "users";
        case 3:
        case 4:
            return "messages";
        case 5:
            return "channels";
        case 6:
            return "guilds";
    }
    return null;
}

export default function ASModal({ modalProps }: { modalProps: RenderModalProps; }) {

    const [query, setQuery] = React.useState(modalState.query);
    const [option, setOption] = React.useState(modalState.option);

    const [allResults, setResults] = React.useState<_ResArrayType>(modalState.allResults);
    const [apiResultCount, setResCount] = React.useState(modalState.apiResultCount); // -1 means not from API

    const options = ["Friends", "Server Members", "All Relationships", "Cached Messages", "All Messages", "Channels", "Servers"];

    // unconventional save state functionality
    const saveState = () => {
        modalState = {
            query, option, allResults, apiResultCount, isOpen: true,
        };
    };
    React.useEffect(() => {
        saveState();
    }, [allResults, apiResultCount, option, query]);

    // Extra handler, it's for extra stuff tbh
    const handleSearch = async (query: string, option: number) => {
        const res = await handleBaseSearch(query, option);

        if (res.type === "undefined") {
            setResults([]);
            setResCount(-1);
            saveState();
            return res;
        }

        setResults(res.data);
        setResCount(res.count);

        saveState();
        return res;
    };

    // ah fuck we handle multiple now
    const handleOptionSelect = (nextOption: number) => {
        setResults([]);
        setResCount(-1);
        setOption(nextOption);
    };

    const resultType: _ResType = optToResType(option);

    return (
        <Modal {...modalProps} title="BetterSwitcher" size="xl">
            <div style={{ padding: "5px 10px", display: "flex", flexDirection: "column", gap: "8px" }}>
                <TabBar
                    selectedItem={option}
                    onItemSelect={handleOptionSelect}
                    type="top"
                    look="grey"
                    aria-label="Type of Search"
                >
                    {options.map((label, id) => (
                        <TabBar.Item key={id} id={id}>
                            {label}
                        </TabBar.Item>
                    ))}
                </TabBar>
                <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "8px" }}>
                    <TextInput value={query} onChange={setQuery} placeholder="Look for..." />
                    <Button
                        onClick={async () => handleSearch(query, option)}
                    >Go</Button>
                </div>
            </div>
            <div style={{ display: "flex", gap: "8px", flexDirection: "column" }}>
                {apiResultCount === -1 || (<Span>{apiResultCount} results</Span>)}
                {resultType === "messages" && <GenericResultCardGen results={allResults as Message[]} type="messages" />}
                {resultType === "users" && <GenericResultCardGen results={allResults as User[]} type="users" />}
                {resultType === "guilds" && <GenericResultCardGen results={allResults as Guild[]} type="guilds" />}
            </div>
        </Modal>
    );
}
