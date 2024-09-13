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
import { createCompletion } from '@/components/server/completion/create';

export const Editor = ({
    value,
    onChange = () => { }
}) => {
    const { theme } = useTheme();

    const [smallChatCompletion, setSmallChatCompletion] = useState('');
    const smallChatRef = useRef(null);

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

    const handleUpdateSmallChat = (event) => {
        if (!smallChatRef.current) return;

        // Get the position of the caret from the top of the page in px
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            smallChatRef.current.style.display = 'block';

            const range = selection.getRangeAt(0);
            let rect;

            if (range.collapsed) {
                // Create a temporary span element
                const span = document.createElement('span');
                span.innerHTML = '&#8203;'; // Zero-width space
                range.insertNode(span);

                // Get the rectangle of the span
                rect = span.getBoundingClientRect();

                // Remove the temporary span
                span.parentNode.removeChild(span);

                // Restore the selection
                selection.removeAllRanges();
                selection.addRange(range);
            } else {
                rect = range.getBoundingClientRect();
            }

            // If the rect has no height (e.g., on a new line), get the position of the last character
            if (rect.height === 0) {
                const editorContent = editor.view.dom;
                const lastChar = editorContent.querySelector('*:last-child');
                if (lastChar) {
                    rect = lastChar.getBoundingClientRect();
                }
            }

            const caretTopPosition = rect.bottom + window.scrollY;
            const textareaRect = smallChatRef.current.getBoundingClientRect();
            console.log(textareaRect);

            smallChatRef.current.style.top = (caretTopPosition - (textareaRect.height + 30)) + 'px';
            console.log('Caret position from top:', caretTopPosition + 'px');
        }
    }

    // New function to handle key combination
    const handleKeyDown = useCallback((event) => {
        if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
            event.preventDefault();
            handleUpdateSmallChat(event);

            return;
            if (editor) {
                editor.chain().focus().command(({ tr }) => {
                    console.log(getHTMLFromFragment(tr.doc.slice(tr.selection.from, tr.selection.to).content, editor.schema))
                    return true
                }).run()
            }
        }
    }, [editor]);

    const handleSmallChatAccept = () => {
        setSmallChatCompletion('');

        editor.commands.insertContent(smallChatCompletion, {
            parseOptions: {
                preserveWhitespace: 'full',
                HTMLAttributes: {},
            },
        });

        window.dispatchEvent(new CustomEvent('updateSuggestion', { detail: { suggestion: '' } }));
    }

    const handleSmallChatSubmit = async (event) => {
        event.preventDefault();
        const query = event.target.smallChatQuery.value;


        const cursorPosition = editor.view.state.selection.$anchor.pos - 1;
        const text = editor.getText();

        // Get the offset of the cursor from the start of the text
        const offset = editor.getText().split('\n').length - 1;
        const textWithCursor = text.slice(0, cursorPosition) + '<cursor/>' + text.slice(cursorPosition - offset);

        const response = await createCompletion({
            prompt: 'You are to continue the text from the <cursor/> given what the user is asking. Your output can be HTML if needed. Do not include any markdown tags when outputting HTML.',
            content: `Question: ${query}\nText: ${textWithCursor}`,
            completionLength: 1000,
        });

        const responseText = response?.completion || '';

        setSmallChatCompletion(responseText);
        window.dispatchEvent(new CustomEvent('updateSuggestion', { detail: { suggestion: responseText } }));
    }

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

            <div className="prose max-w-none">
                <EditorContent
                    className="outline-none focus:outline-none dark:text-white text-black"
                    editor={editor}
                />

                <form onSubmit={handleSmallChatSubmit} ref={smallChatRef} className="w-[400px] flex-col h-fit bg-gray-200 dark:bg-gray-800 p-4 rounded-xl shadow-lg z-[999] absolute" style={{ display: 'none' }}>
                    <div className="w-full flex items-center justify-between">
                        <span className="text-gray-700 dark:text-gray-300">Ask a question or make a modification</span>

                        <button onClick={() => {
                            smallChatRef.current.style.display = 'none';
                            setSmallChatCompletion('');
                            window.dispatchEvent(new CustomEvent('updateSuggestion', { detail: { suggestion: '' } }));
                        }} type="submit" className="p-0.5 rounded-lg transition-all duration-300 hover:bg-gray-300 dark:hover:bg-gray-700">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5 text-gray-500">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <textarea name="smallChatQuery" placeholder="e.g. Make a table with 3 columns and 2 rows" className="max-h-[150px] resize-none border-l pl-2 border-gray-700 h-[150px] mt-2 text-white w-full h-full bg-transparent outline-none focus:outline-none">

                    </textarea>

                    <div className="w-full flex items-center justify-end">
                        {smallChatCompletion ? (
                            <>
                                <button type="button" onClick={() => {
                                    smallChatRef.current.style.display = 'none';
                                    setSmallChatCompletion('');
                                    window.dispatchEvent(new CustomEvent('updateSuggestion', { detail: { suggestion: '' } }));
                                }} className="bg-red-900 hover:bg-red-800 transition-all duration-300 text-white px-4 py-0.5 text-xs rounded-md">Reject</button>
                                <button type="button" onClick={handleSmallChatAccept} className="bg-green-900 hover:bg-green-800 transition-all duration-300 text-white px-4 py-0.5 text-xs rounded-md">Accept</button>
                            </>
                        ) : (
                            <button className="bg-blue-900 hover:bg-blue-800 transition-all duration-300 text-white px-4 py-0.5 text-xs rounded-md">Send</button>
                        )}
                    </div>
                </form>
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