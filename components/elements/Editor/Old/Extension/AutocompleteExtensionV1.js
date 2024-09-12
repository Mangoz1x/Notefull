import { decideAutocompleteText } from "./Autocomplete";
import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import { TextSelection } from "@tiptap/pm/state";

let currentSuggestion = null;
let resolving = false;
let lastCall = new Date().getTime();

export const AutocompleteExtension = Extension.create({
    name: 'AutocompleteExtension',

    addKeyboardShortcuts() {
        return {
            Tab: () => {
                // const { selection } = this.editor.state;
                // const { $head } = selection;
                // const currentLineText = $head.parent.textContent;

                if (currentSuggestion) {
                    this.editor.commands.insertContent(currentSuggestion);
                }

                return true; // Prevent default Tab behavior
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
                    apply: (transaction, oldState, _, newState) => {
                        const currentDate = new Date().getTime();
                        if (currentDate - lastCall < 1000) {
                            return DecorationSet.empty;
                        }
                        lastCall = currentDate;

                        const { selection } = newState;
                        if (!(selection instanceof TextSelection)) {
                            return DecorationSet.empty;
                        }

                        const { $head } = selection;
                        // const editorText = this.editor.getText();
                        
                        // Get the updated editor text including the latest changes
                        const editorText = transaction.doc.textBetween(0, transaction.doc.content.size, '\n').replace(currentSuggestion, '');
                        
                        // Use setTimeout to make this asynchronous
                        setTimeout(() => {
                            if (resolving) {
                                return;
                            }

                            resolving = true;
                            decideAutocompleteText(editorText, $head.pos).then(suggestion => {
                                resolving = false;
                                currentSuggestion = suggestion;
                                if (document.querySelector('.autocomplete-suggestion')) {
                                    document.querySelector('.autocomplete-suggestion').innerHTML = currentSuggestion;
                                }
                                this.editor.view.updateState(this.editor.view.state);
                            });
                        }, 0);

                        if (!currentSuggestion) {
                            return DecorationSet.empty;
                        }

                        const decoration = Decoration.widget($head.pos, () => {
                            const span = document.createElement('span');
                            span.className = 'autocomplete-suggestion';
                            span.innerHTML = currentSuggestion;
                            return span;
                        });

                        return DecorationSet.create(newState.doc, [decoration]);
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