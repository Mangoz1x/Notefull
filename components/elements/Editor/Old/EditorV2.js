'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { TextSelection } from '@tiptap/pm/state';

const Button = ({ children, onClick }) => {
    return (
        <button
            className="size-10 flex justify-center items-center hover:bg-gray-200 dark:hover:bg-gray-900 rounded-md transition-all duration-300 text-black dark:text-white"
            onClick={onClick}
        >
            {children}
        </button>
    );
};

const MenuBar = ({ editor }) => {
    const MenuBar = useCallback(() => {
        if (!editor) {
            return null;
        }

        return (
            <div className="menuBar flex space-x-2 mb-4">
                <input
                    type="color"
                    onInput={e => editor.chain().focus().setColor(e.target.value).run()}
                    value={editor.getAttributes('textStyle').color}
                />
            </div>
        );
    }, [editor]);

    return <MenuBar />;
};

const decideAutocompleteText = (text) => {
    if (text.includes('hello')) {
        return 'world';
    }
    return '';
};

const AutocompleteExtension = Extension.create({
    name: 'AutocompleteExtension',

    addKeyboardShortcuts() {
        return {
            Tab: () => {
                const { selection } = this.editor.state;
                const { $head } = selection;
                const currentLineText = $head.parent.textContent;
                const suggestion = decideAutocompleteText(currentLineText);

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
                        const suggestion = decideAutocompleteText(currentLineText);

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

const Editor = ({
    value,
    onChange = () => { }
}) => {
    const [completion, setCompletion] = useState('');
    const ghostPreviewRef = useRef(null);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Table.configure({ resizable: true }),
            TableRow,
            TableHeader,
            TableCell,
            TextStyle,
            Color,
            AutocompleteExtension,
        ],
        content: value,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            editor.commands.setContent(value);
        }
    }, [value, editor]);

    return (
        <div>
            <MenuBar editor={editor} />

            <div className="prose max-w-none relative">
                <EditorContent
                    className="outline-none focus:outline-none"
                    editor={editor}
                />
                <div ref={ghostPreviewRef} className="ProseMirror opacity-[0.3] absolute" dangerouslySetInnerHTML={{ __html: completion }}></div>
            </div>


            <style jsx global>{`
                .ProseMirror {
                    outline: none;
                    position: relative;
                    z-index: 1;
                }
                .ProseMirror table {
                    border-collapse: collapse;
                    margin: 0;
                    overflow: hidden;
                    table-layout: fixed;
                    width: 100%;
                    border-radius: 10px;
                }
                .ProseMirror td,
                .ProseMirror th {
                    border: 1px solid #2b2b2b;
                    box-sizing: border-box;
                    min-width: 1em;
                    padding: 3px 5px;
                    position: relative;
                    vertical-align: top;
                }
                .ProseMirror th {
                    background-color: #2b2b2b;
                    font-weight: bold;
                    text-align: left;
                }
                .ProseMirror ul,
                .ProseMirror ol {
                    padding-left: 1.5em;
                }
                .ProseMirror li {
                    margin-bottom: 0.5em;
                }
                .ProseMirror ul > li {
                    list-style-type: disc;
                }
                .ProseMirror ol > li {
                    list-style-type: decimal;
                }
                .ProseMirror h1 {
                    font-size: 2em;
                }
                .ProseMirror h2 {
                    font-size: 1.5em;
                }
                .completion-preview {
                    opacity: 0.5;
                    pointer-events: none;
                    user-select: none;
                    color: #888;
                }
                .ProseMirror p {
                    width: fit-content !important;
                }
                .autocomplete-suggestion {
                    opacity: 0.5;
                    pointer-events: none;
                    user-select: none;
                    color: #888;
                }
            `}</style>
        </div>
    );
};

export default Editor;