'use client';

import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
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
import { useTheme } from '@/context/ThemeContext';
import { getHTMLFromFragment } from '@tiptap/core'

export const Editor = ({
    value,
    onChange = () => { }
}) => {
    const { theme } = useTheme();

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
        immediatelyRender: false,
        content: value,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        }
    });

    // New function to handle key combination
    const handleKeyDown = useCallback((event) => {
        if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
            event.preventDefault();
            if (editor) {
                editor.chain().focus().command(({ tr }) => {
                    console.log(getHTMLFromFragment(tr.doc.slice(tr.selection.from, tr.selection.to).content, editor.schema))
                    return true
                }).run()
            }
        }
    }, [editor]);

    // Add event listener for key combination
    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);

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
                    className="outline-none focus:outline-none dark:text-white text-black"
                    editor={editor}
                />
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
                    border: 1px solid ${theme === 'dark' ? '#2b2b2b' : '#d1d5db'};
                    box-sizing: border-box;
                    min-width: 1em;
                    padding: 3px 5px;
                    position: relative;
                    vertical-align: top;
                }
                .ProseMirror th {
                    background-color: ${theme === 'dark' ? '#2b2b2b' : '#ececec'};
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
                    color: ${theme === 'dark' ? '#888' : '#888'};
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

                // The suggestion text preview
                .autocomplete-suggestion {
                    color: #888;
                    position: relative;
                }
                .autocomplete-suggestion::after {
                    content: attr(data-suggestion);
                    position: absolute;
                    left: 0;
                    top: 0;
                    pointer-events: none;
                }
            `}</style>
        </div>
    );
};