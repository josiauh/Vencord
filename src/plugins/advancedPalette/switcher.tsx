/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Button } from "@components/Button";
import { Span } from "@components/Span";
import { ModalContent, ModalProps, ModalRoot } from "@utils/modal";
import { Channel } from "@vencord/discord-types";
import { ChannelStore, GuildStore, PermissionsBits, PermissionStore, React, TextInput } from "@webpack/common";

// setting up for making the actual css sheet, but for now we ball inline
// const cl = classNameFactory("vc-plugin-advPal-");

const editDistance = (input: string, target: string) => {
    const m = input.length;
    const n = target.length;

    const prev = new Array<number>(n + 1);
    const curr = new Array<number>(n + 1);

    for (let j = 0; j <= n; j++) {
        prev[j] = j;
    }

    for (let i = 1; i <= m; i++) {
        curr[0] = i;
        const inputChar = input[i - 1];

        for (let j = 1; j <= n; j++) {
            if (inputChar === target[j - 1]) {
                curr[j] = prev[j - 1];
            } else {
                curr[j] = 1 + Math.min(prev[j], curr[j - 1], prev[j - 1]);
            }
        }

        for (let j = 0; j <= n; j++) {
            prev[j] = curr[j];
        }
    }

    return prev[n];
};

export function channelFZF(channels: Channel[], input: string) {

    return channels
        .map(channel => ({
            channel,
            distance: editDistance(input, channel.name)
        }))
        .sort((a, b) => a.distance - b.distance)
        .map(({ channel }) => channel);
}

// i fucking hate this thing. it'll have to do but i need something else
function CategorySwitch({ ...props }: {
    choices: string[],
    onSelect: (choice: number) => void,
    choice: number;
}) {
    const maxChoice = props.choices.length - 1;
    const selectedChoice = maxChoice >= 0
        ? props.choices[Math.min(Math.max(props.choice, 0), maxChoice)]
        : "";

    const selectChoice = (nextChoice: number) => {
        if (maxChoice < 0) return;

        props.onSelect(Math.min(Math.max(nextChoice, 0), maxChoice));
    };

    return (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px" }}>
            <Button
                disabled={props.choice <= 0 || maxChoice < 0}
                onClick={() => selectChoice(props.choice - 1)}
                style={{ width: "32px", height: "32px", padding: 0 }}
                variant="secondary"
            >
                {"<"}
            </Button>
            <div style={{ whiteSpace: "nowrap", color: "white" }}>{selectedChoice}</div>
            <Button
                disabled={props.choice >= maxChoice || maxChoice < 0}
                onClick={() => selectChoice(props.choice + 1)}
                style={{ width: "32px", height: "32px", padding: 0 }}
                variant="secondary"
            >
                {">"}
            </Button>
        </div>
    );
}

function ResultCard({ ...props }: {
    resultType: string, // Will make this an enum
    mainContent: string,
    dimText: string,
    sideText?: string;
}) {
    return (
        <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div style={{ display: "flex", gap: "10px" }}>
                <Span
                    style={{ fontWeight: "bold", textOverflow: "ellipsis" }}
                >
                    {props.mainContent}
                </Span>
                <Span
                    defaultColor={false}
                    style={{ fontStyle: "italic", color: "GrayText" }}
                >
                    {props.dimText}
                </Span>
            </div>
            <div>
                {props.sideText && (
                    <Span
                        defaultColor={false}
                        style={{ fontStyle: "italic", textOverflow: "ellipsis", color: "GrayText" }}
                    >
                        {props.sideText}
                    </Span>
                )}
            </div>
        </div>
    );
}

export default function ASPanel({ rootProps }: { rootProps: ModalProps; }) {

    const [query, setQuery] = React.useState("");
    const [option, setOption] = React.useState(0);

    const options = ["Favorited", "Friends", "Recent Messsages", "Channels", "Servers"];

    // values to search from
    const allGuilds = GuildStore.getGuilds();
    const allChannels = ChannelStore.getChannelIds()
        .map(id => ChannelStore.getChannel(id))
        .filter(v => PermissionStore.can(PermissionsBits.VIEW_CHANNEL, v));



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

                    </div>
                </div>
            </ModalContent>
        </ModalRoot>
    );
}
