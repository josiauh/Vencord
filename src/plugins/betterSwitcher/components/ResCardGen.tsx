/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Span } from "@components/Span";
import { Channel, Guild, Message, User } from "@vencord/discord-types";
import { findByPropsLazy } from "@webpack";
import { ChannelRouter, ChannelStore, GuildMemberStore, IconUtils, MessageActions, NavigationRouter, StreamerModeStore } from "@webpack/common";

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
    | { type: "users"; results: User[]; guildId?: string; }
    | { type: "guilds"; results: Guild[]; }
    | { type: "channels"; results: Channel[]; };


export default function GenericResultCardGen({ ...props }: Props) {
    switch (props.type) {
        case "messages": return <MessageResultCardGenerator messages={props.results}></MessageResultCardGenerator>;
        case "users": return <UserResultCardGenerator users={props.results} guildId={props.guildId}></UserResultCardGenerator>;
        case "guilds": return <GuildResultCardGenerator guilds={props.results}></GuildResultCardGenerator>;
        case "channels": return <ChannelResultCardGenerator channels={props.results}></ChannelResultCardGenerator>;
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
            sideText={ChannelStore.getChannel(v.channel_id).name ?? "UKNKNOWN"}
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

function ChannelResultCardGenerator({ ...props }: {
    channels: Channel[];
}) {
    return props.channels.map(v => (
        <ResultCard
            key={v.id}
            extraLeftNodes={<Span>#</Span>}
            mainContent={v.name}
            onClick={() => {
                ChannelRouter.transitionToChannel(v.id);
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
                mainContent={nameHelper(v, props.guildId)}
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

function GuildResultCardGenerator({ ...props }: {
    guilds: Guild[];
}) {
    return props.guilds
        .filter((guild): guild is Guild => guild != null)
        .map(v => {
            const iconUrl = v.icon && IconUtils.getGuildIconURL({
                id: v.id,
                icon: v.icon,
                canAnimate: true,
                size: 32
            });
            return (
                <ResultCard
                    key={v.id}
                    mainContent={v.name}
                    extraLeftNodes={iconUrl && (
                        <img src={iconUrl} alt={"Avatar"} height={32} width={32} style={{ borderRadius: 100 }} />
                    )}
                    onClick={() => {
                        NavigationRouter.transitionToGuild(v.id);
                    }}
                />
            );
        });
}
