/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Message, User } from "@vencord/discord-types";
import { findByPropsLazy } from "@webpack";
import { ChannelStore, GuildMemberStore, MessageActions, StreamerModeStore } from "@webpack/common";

import { settings } from "..";
import ResultCard from "./ResultCard";

const { openUserProfileModal } = findByPropsLazy("openUserProfileModal");

// too redundant. thank you
const nameHelper = (user: User, guildId?: string): string => {
    if (!user) return "Unknown user";
    if (settings.store.preferUsernameOverDisplay) return StreamerModeStore.enabled ? user.username[0] + "..." : user.username.slice(0, settings.store.userPreviewLength);
    if (guildId) {
        const name = GuildMemberStore.getMember(guildId, user.id)?.nick;

        if (name) return name; // Pass through to
    }
    if (!user.globalName) {
        return StreamerModeStore.enabled ? user.username[0] + "..." : user.username.slice(0, settings.store.userPreviewLength);
    } else {
        return user.globalName || "This shouldn't happen";
    }
};

type Props =
    | { type: "messages"; results: Message[]; }
    | { type: "users"; results: User[]; guildId?: string; };


export default function GenericResultCardGen({ ...props }: Props) {
    switch (props.type) {
        case "messages": return <MessageResultCardGenerator messages={props.results}></MessageResultCardGenerator>;
        case "users": return <UserResultCardGenerator users={props.results} guildId={props.guildId}></UserResultCardGenerator>;
    }

    return null;
}

function MessageResultCardGenerator({ ...props }: {
    messages: Message[];
}) {
    return props.messages.map(v => (
        <ResultCard
            key={v.id}
            mainContent={nameHelper(v.author)} // hell yeah inline code
            dimText={v.content.slice(0, settings.store.messagePreviewLength)}
            sideText={ChannelStore.getChannel(v.channel_id).name ?? ""}
            onClick={() => {
                MessageActions.jumpToMessage({
                    channelId: v.channel_id,
                    messageId: v.id,
                    flash: true
                });
            }}
        />
    ));
}

function UserResultCardGenerator({ ...props }: {
    users: User[],
    guildId?: string,
}) {
    return props.users
        .filter((user): user is User => user != null)
        .map(v => (
            <ResultCard
                key={v.id}
                mainContent={nameHelper(v, props.guildId)} // hell yeah inline code
                extraLeftNodes={(
                    <img src={v.getAvatarURL(props.guildId, 32, true)} alt={"Avatar"} height={32} width={32} style={{ borderRadius: 100 }} />
                )}
                onClick={() => {
                    openUserProfileModal({
                        userId: v.id
                    });
                }}
            />
        ));
}
