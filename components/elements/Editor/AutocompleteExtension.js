import { decideAutocompleteText } from "./Autocomplete";
import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import { TextSelection } from "@tiptap/pm/state";

export const AutocompleteExtension = Extension.create({
    name: 'AutocompleteExtension',

    addKeyboardShortcuts() {
        return {
            Tab: () => {
                const { selection } = this.editor.state;
                const { $head } = selection;
                const currentLineText = $head.parent.textContent;
                const suggestion = decideAutocompleteText(currentLineText, $head.pos);

                if (suggestion) {
                    this.editor.commands.insertContent(suggestion);
                    return true;
                }
                return false;
            },
        };
    },

    addProseMirrorPlugins() {
        return [
            new Plugin({
                key: new PluginKey('autocomplete'),
                state: {
                    init() {
                        return DecorationSet.empty;
                    },
                    apply: (transaction, oldState) => {
                        const { selection } = transaction;
                        if (!(selection instanceof TextSelection)) {
                            return DecorationSet.empty;
                        }

                        const { $head } = selection;
                        const currentLineText = $head.parent.textContent;
                        const suggestion = decideAutocompleteText(currentLineText, $head.pos);

                        if (!suggestion) {
                            return DecorationSet.empty;
                        }

                        const decoration = Decoration.widget($head.pos, () => {
                            const span = document.createElement('span');
                            span.className = 'autocomplete-suggestion';
                            span.textContent = suggestion;
                            return span;
                        });

                        return DecorationSet.create(transaction.doc, [decoration]);
                    },
                },
                props: {
                    decorations(state) {
                        return this.getState(state);
                    },
                },
            }),
        ];
    },
});