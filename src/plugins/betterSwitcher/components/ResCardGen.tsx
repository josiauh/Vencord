/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Message, User } from "@vencord/discord-types";
import { MessageActions, StreamerModeStore } from "@webpack/common";

import ResultCard from "./ResultCard";

type Props =
    | { type: "messages"; results: Message[]; }
    | { type: "users"; results: User[]; };


export default function GenericResultCardGen({ ...props }: Props) {
    switch (props.type) {
        case "messages": return <MessageResultCardGenerator messages={props.results}></MessageResultCardGenerator>;
    }

    return null;
}

function MessageResultCardGenerator({ ...props }: {
    messages: Message[];
}) {
    return props.messages.map(v => (
        <ResultCard
            key={v.id}
            mainContent={StreamerModeStore.enabled ? v.author.username : v.author.username.slice(0, 2) + "..."}
            dimText={v.content.slice(0, 10)}
            sideText={v.getChannelId()}
            onClick={() => {
                MessageActions.jumpToMessage({
                    channelId: v.getChannelId(),
                    messageId: v.id,
                    flash: true
                });
            }}
        />
    ));
}
