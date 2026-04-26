/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Button } from "@components/Button";

// i fucking hate this thing. it'll have to do but i need something else
export default function CategorySwitch({ ...props }: {
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
