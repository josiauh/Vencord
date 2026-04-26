/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Span } from "@components/Span";

export default function ResultCard({ ...props }: {
    mainContent: string,
    dimText: string,
    sideText?: string,
    onClick: () => void;
}) {
    return (
        <div style={{ display: "flex", justifyContent: "space-between" }} onClick={props.onClick}>
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
