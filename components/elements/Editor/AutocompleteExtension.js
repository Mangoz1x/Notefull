import { decideAutocompleteText } from "./Autocomplete";
import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import { TextSelection } from "@tiptap/pm/state";

let autocompleteSuggestion = '';

let autocompleteTimeout = null;

// params: editorText, cursorPosition
const callAutocomplete = async (editorText, cursorPosition) => {
    // Ensures a completion is only made after 500ms of inactivity
    
    if (autocompleteTimeout) {
        clearTimeout(autocompleteTimeout);
    }

    autocompleteTimeout = setTimeout(async () => {
        decideAutocompleteText(editorText, cursorPosition).then(suggestion => {
            const suggestionSpan = document.querySelector('.autocomplete-suggestion');
            if (suggestionSpan) {
                autocompleteSuggestion = suggestion;
                suggestionSpan.innerHTML = suggestion;
            }
        });
    }, 500);
};

export const AutocompleteExtension = Extension.create({
    name: 'AutocompleteExtension',

    addKeyboardShortcuts() {
        return {
            Tab: () => {
                if (autocompleteSuggestion) {
                    this.editor.commands.insertContent(autocompleteSuggestion);
                }
                return true;
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
                        const { selection } = newState;
                        if (!(selection instanceof TextSelection)) {
                            return DecorationSet.empty;
                        }

                        const { $head } = selection;

                        const decoration = Decoration.widget($head.pos, () => {
                            const span = document.createElement('span');
                            span.className = 'autocomplete-suggestion';
                            return span;
                        }, { side: 1 });

                        const decorations = DecorationSet.create(newState.doc, [decoration]);

                        // Call the autocompletion function asynchronously
                        const editorText = transaction.doc.textBetween(0, transaction.doc.content.size, '\n');
                        callAutocomplete(editorText, $head.pos);

                        return decorations;
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