/*
 * Vencord, a modification for Discord's desktop app
 * Copyright (c) 2023 Vendicated and contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import "./styles.css";

import { addChatBarButton, ChatBarButton, removeChatBarButton } from "@api/ChatButtons";
import { classNameFactory } from "@api/Styles";
import { getTheme, insertTextIntoChatInputBox, Theme } from "@utils/discord";
import { Margins } from "@utils/margins";
import { closeModal, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalProps, ModalRoot, openModal } from "@utils/modal";
import definePlugin from "@utils/types";
import { Button, Forms, Parser, Select, useMemo, useState } from "@webpack/common";

const Formats = ["\u001b[0;{}m", "\u001b[1;{}m", "\u001b[4;{}m", "\u001b[1;{}m\u001b[4;{}m"] as const;
const FormatLabels = ["Normal", "Bold", "Underlined", "All"] as const;
type Format = typeof Formats[number];
const Colors = [30, 31, 32, 33, 34, 35, 36, 37] as const;
const ColorLabels = ["Gray", "Red", "Green", "Yellow", "Blue", "Pink", "Cyan", "White"] as const;
type Color = typeof Colors[number];
/*
const BGs = [40, 41, 42, 43, 44, 45, 46, 47] as const;
const BGLabels = ["Gray", "Red", "Green", "Yellow", "Blue", "Pink", "Cyan", "White"] as const;
type BG = typeof BGs[number];
*/


const cl = classNameFactory("vc-st-");

function getFormat(base: string, color: Color) {
    return base.replaceAll("{}", color.toString());
}

function getColoredText(format: string, text: string, color: Color) {
    return `\`\`\`ansi\n${getFormat(format, color)}${text}\u001b[0m\n\`\`\``;
}

function formatWithBG() {
    return "nothing";
}

function PickerModal({ rootProps, close }: { rootProps: ModalProps, close(): void; }) {
    const [value, setValue] = useState<string>("so cool");
    const [format, setFormat] = useState<Format>("\u001b[1;{}m");
    const [color, setColor] = useState<Color>(31);
    // const [bg, setBG] = useState<BG>(41);
    const rendered = useMemo(() => {
        const nonnull = value || "so cool";
        const othernon = format || "\u001b[1;{}m";
        const oneil = color || Colors[0] as Color;
        // const grah = bg || BGs[0] as BG;
        return Parser.parse(getColoredText(getFormat(othernon, oneil), nonnull, color || 31));
    }, [value, format, color]);
    return (
        <ModalRoot {...rootProps}>
            <ModalHeader className={cl("modal-header")}>
                <Forms.FormTitle tag="h2">
                    Ansi Colors
                </Forms.FormTitle>

                <ModalCloseButton onClick={close} />
            </ModalHeader>

            <ModalContent className={cl("modal-content")}>
                <Forms.FormTitle>Text</Forms.FormTitle>
                <input
                    value={value}
                    onChange={e => setValue(e.currentTarget.value)}
                    style={{
                        colorScheme: getTheme() === Theme.Light ? "light" : "dark",
                    }}
                />
                <Forms.FormTitle>ANSI Format</Forms.FormTitle>
                <Select
                    options={
                        Formats.map(m => ({
                            label: FormatLabels[Formats.findIndex(value => value === m)],
                            value: m
                        }))
                    }
                    isSelected={v => v === format}
                    select={v => setFormat(v)}
                    serialize={v => v}
                    renderOptionLabel={o => (
                        <div className={cl("format-label")}>
                            {o.label}
                        </div>
                    )}
                    renderOptionValue={() => rendered}
                />
                <Forms.FormTitle>FG Color</Forms.FormTitle>
                <Select
                    options={
                        Colors.map(m => ({
                            label: ColorLabels[Colors.findIndex(value => value === m)],
                            value: m
                        }))
                    }
                    isSelected={v => v === format}
                    select={v => setColor(v)}
                    serialize={v => v}
                    renderOptionLabel={o => (
                        <div className={cl("format-label")}>
                            {o.label}
                        </div>
                    )}
                    renderOptionValue={() => rendered}
                />
                <Forms.FormTitle className={Margins.bottom8}>Preview</Forms.FormTitle>
                <Forms.FormText className={cl("preview-text")}>
                    {rendered}
                </Forms.FormText>
            </ModalContent>

            <ModalFooter>
                <Button
                    onClick={() => {
                        insertTextIntoChatInputBox(getColoredText(format || Formats[0], value || "so cool", color || 31));
                        close();
                    }}
                >Insert</Button>
            </ModalFooter>
        </ModalRoot>
    );
}

const ChatBarIcon: ChatBarButton = ({ isMainChat }) => {
    if (!isMainChat) return null;

    return (
        <ChatBarButton
            tooltip="ANSI Colors"
            onClick={() => {
                const key = openModal(props => (
                    <PickerModal
                        rootProps={props}
                        close={() => closeModal(key)}
                    />
                ));
            }}
            buttonProps={{ "aria-haspopup": "dialog" }}
        >
            <h1><strong>C</strong></h1>

        </ChatBarButton>
    );
};

export default definePlugin({
    name: "AnsiColors",
    description: "Make chat a little more colorful!",
    authors: [{ id: 853014693115068426n, name: "freesmart" }],
    dependencies: ["MessageEventsAPI", "ChatInputButtonAPI"],
    start() {
        addChatBarButton("Ansi", ChatBarIcon);
    },

    stop() {
        removeChatBarButton("Ansi");
    },
});
