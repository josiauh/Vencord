/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Span } from "@components/Span";

export default function ResultCard({ ...props }: {
    mainContent: string,
    dimText?: string,
    sideText?: string,
    extraLeftNodes?: React.ReactNode,
    onClick: () => void;
}) {
    return (
        <div style={{ display: "flex", justifyContent: "space-between" }} onClick={props.onClick}>
            <div style={{ display: "flex", gap: "10px" }}>
                {props.extraLeftNodes}
                <Span
                    style={{ fontWeight: "bold", textOverflow: "ellipsis" }}
                >
                    {props.mainContent}
                </Span>
                {props.dimText && (<Span
                    defaultColor={false}
                    style={{ fontStyle: "italic", color: "GrayText" }}
                >
                    {props.dimText}
                </Span>)}
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
