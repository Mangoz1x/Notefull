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
import { AutocompleteExtension } from './AutocompleteExtension';
import { MenuBar } from './MenuBar';

export const Editor = ({
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
                .ProseMirror td.selectedCell,
                .ProseMirror th.selectedCell {
                    background-color: rgba(200, 200, 255, 0.4);
                }
            `}</style>
        </div>
    );
};