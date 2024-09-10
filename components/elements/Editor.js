import React, { useState, useEffect, useRef } from 'react';
import styles from './QuillEditor.module.css';

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

const Editor = ({
    value,
    completion = '',
    clearCompletion = () => { },
    onChange = () => { }
}) => {
    const [html, setHtml] = useState('');
    const [isEmpty, setIsEmpty] = useState(true);
    const [activeFormats, setActiveFormats] = useState({
        bold: false,
        italic: false,
        h1: false,
        h2: false,
        ol: false,
        ul: false,
        dash: false
    });

    const editorRef = useRef(null);
    const completionRef = useRef(null);

    useEffect(() => {
        if (value) {
            setHtml(value);
            setIsEmpty(false);
        }
    }, [value]);

    useEffect(() => {
        const editor = editorRef.current;
        if (editor && html !== editor.innerHTML) {
            // Save the current selection
            const selection = window.getSelection();
            const savedRange = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

            editor.innerHTML = html;

            // Restore the saved selection
            if (savedRange) {
                selection.removeAllRanges();
                selection.addRange(savedRange);
            } else {
                // If there was no saved range, move cursor to the end
                const range = document.createRange();
                range.selectNodeContents(editor);
                range.collapse(false);
                selection.removeAllRanges();
                selection.addRange(range);
            }

            editor.focus();
        }
    }, [html]);

    const handleInput = () => {
        const editor = editorRef.current;
        if (editor) {
            const newHtml = editor.innerHTML;
            setHtml(newHtml);
            setIsEmpty(newHtml.trim() === '');
            onChange(newHtml);
        }
    };

    const execCommand = (command, value = null) => {
        const editor = editorRef.current;
        if (!editor) return;

        // Save the current selection
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);

        // Execute the command
        if (command === 'bold' || command === 'italic' || command === 'underline') {
            document.execCommand(command, false, value);
        } else if (command === 'formatBlock') {
            if (selection.rangeCount > 0) {
                const parentElement = range.commonAncestorContainer.nodeType === Node.TEXT_NODE
                    ? range.commonAncestorContainer.parentElement
                    : range.commonAncestorContainer;

                if (parentElement.tagName.toLowerCase() === value) {
                    // If it's already the desired heading, remove it
                    document.execCommand('formatBlock', false, 'p');
                } else {
                    // Otherwise, apply the heading
                    document.execCommand('formatBlock', false, `<${value}>`);
                }
            }
        } else if (command === 'insertOrderedList' || command === 'insertUnorderedList') {
            document.execCommand(command, false, null);
        } else if (command === 'insertDashList') {
            // Custom command for dash list
            const listItem = document.createElement('li');
            listItem.innerHTML = '- ';
            const list = document.createElement('ul');
            list.className = 'dash-list';
            list.appendChild(listItem);
            range.insertNode(list);
            range.setStartAfter(listItem);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
        }

        // Update the content
        handleInput();

        // Restore the selection
        const newSelection = window.getSelection();
        newSelection.removeAllRanges();
        newSelection.addRange(range);

        // Force focus back to the editor
        editor.focus();

        // Update active formats
        updateActiveFormats();
    };

    const updateActiveFormats = () => {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const parentElement = range.commonAncestorContainer.nodeType === Node.TEXT_NODE
                ? range.commonAncestorContainer.parentElement
                : range.commonAncestorContainer;

            // Check if the entire selection has the format
            const isEntireSelectionFormatted = (format) => {
                const fragment = range.cloneContents();
                const elements = fragment.querySelectorAll('*');
                return Array.from(elements).every(el =>
                    el.tagName === format.toUpperCase() ||
                    (el.tagName !== 'BR' && el.style[format] === 'true')
                );
            };

            setActiveFormats({
                bold: isEntireSelectionFormatted('b') || isEntireSelectionFormatted('strong'),
                italic: isEntireSelectionFormatted('i') || isEntireSelectionFormatted('em'),
                underline: isEntireSelectionFormatted('u'),
                h1: parentElement.tagName === 'H1' || isEntireSelectionFormatted('h1'),
                h2: parentElement.tagName === 'H2' || isEntireSelectionFormatted('h2'),
                ol: parentElement.closest('ol') !== null,
                ul: parentElement.closest('ul') !== null,
                dash: parentElement.closest('ul.dash-list') !== null,
            });
        }
    };

    useEffect(() => {
        const editor = editorRef.current;
        if (editor) {
            editor.addEventListener('selectionchange', updateActiveFormats);
        }

        if (!window.updateLastCharPosInterval) window.updateLastCharPosInterval = setInterval(() => {
            const editor = editorRef.current;
            if (editor) {
                // Get position of last character
                document.querySelectorAll('.last-char-pos-tracker').forEach(el => el.remove());
                const editor = editorRef.current;
                const lastCharTracker = document.createElement('span');
                lastCharTracker.className = 'last-char-pos-tracker';
                editor.appendChild(lastCharTracker);
                const lastCharPosition = lastCharTracker.getBoundingClientRect();
                completionRef.current.style.left = `${lastCharPosition.right}px`;
                completionRef.current.style.top = `${lastCharPosition.top - 3}px`;
            }
        }, 100);

        return () => {
            if (editor) {
                editor.removeEventListener('selectionchange', updateActiveFormats);
            }
        };
    }, []);

    const handleKeyDown = (e) => {
        if (e.key === 'Tab' && completion) {
            e.preventDefault();
            const editor = editorRef.current;
            if (editor) {
                editor.innerHTML += completion;
                handleInput();
                // Move cursor to the end
                const range = document.createRange();
                range.selectNodeContents(editor);
                range.collapse(false);
                const selection = window.getSelection();
                selection.removeAllRanges();
                selection.addRange(range);
                clearCompletion();
            }
            return;
        } else if (completion) {
            clearCompletion();
        }

        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'b':
                    e.preventDefault();
                    execCommand('bold');
                    break;
                case 'i':
                    e.preventDefault();
                    execCommand('italic');
                    break;
                case 'u':
                    e.preventDefault();
                    execCommand('underline');
                    break;
                case '1':
                    e.preventDefault();
                    execCommand('formatBlock', 'h1');
                    break;
                case '2':
                    e.preventDefault();
                    execCommand('formatBlock', 'h2');
                    break;
                case '.':
                    e.preventDefault();
                    execCommand('insertOrderedList');
                    break;
                case ',':
                    e.preventDefault();
                    execCommand('insertUnorderedList');
                    break;
                case '-':
                    e.preventDefault();
                    execCommand('insertDashList');
                    break;
            }
        } else if (e.key === ' ') {
            const editor = editorRef.current;
            const selection = window.getSelection();
            if (editor && selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                const startNode = range.startContainer;
                if (startNode.nodeType === Node.TEXT_NODE) {
                    if (startNode.textContent.endsWith('*')) {
                        e.preventDefault();
                        const textBeforeCursor = startNode.textContent.slice(0, -1);
                        startNode.textContent = textBeforeCursor;
                        execCommand('insertUnorderedList');
                    } else {
                        const match = startNode.textContent.match(/(\d+)\.\s*$/);
                        if (match) {
                            e.preventDefault();
                            const textBeforeCursor = startNode.textContent.slice(0, -match[0].length);
                            startNode.textContent = textBeforeCursor;
                            execCommand('insertOrderedList');
                        }
                    }
                }
            }
        } else if (e.key === 'Tab') {
            e.preventDefault();
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                let listItem = null;

                // Find the closest li element
                let node = range.startContainer;
                while (node && node !== editorRef.current) {
                    if (node.nodeName === 'LI') {
                        listItem = node;
                        break;
                    }
                    node = node.parentNode;
                }

                if (listItem) {
                    const parentList = listItem.parentNode;
                    const prevListItem = listItem.previousElementSibling;

                    if (prevListItem) {
                        let targetList = prevListItem.querySelector('ul, ol');
                        if (!targetList) {
                            targetList = document.createElement(parentList.tagName);
                            prevListItem.appendChild(targetList);
                        }
                        targetList.appendChild(listItem);
                    } else {
                        // If it's the first item, create a new sublist at the beginning of the parent list
                        const newList = document.createElement(parentList.tagName);
                        parentList.insertBefore(newList, listItem);
                        newList.appendChild(listItem);
                    }

                    // Ensure the cursor stays at the beginning of the list item's content
                    range.selectNodeContents(listItem);
                    range.collapse(true);
                    selection.removeAllRanges();
                    selection.addRange(range);

                    // If the list item is empty, add a <br> to maintain its height
                    if (listItem.textContent.trim() === '') {
                        listItem.innerHTML = '<br>';
                    }
                }
            }
        } else if (e.key === 'Backspace') {
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                let listItem = null;

                // Find the closest li element
                let node = range.startContainer;
                while (node && node !== editorRef.current) {
                    if (node.nodeName === 'LI') {
                        listItem = node;
                        break;
                    }
                    node = node.parentNode;
                }

                if (listItem && listItem.parentNode.parentNode.nodeName === 'LI') {
                    e.preventDefault();
                    const parentListItem = listItem.parentNode.parentNode;
                    const grandParentList = parentListItem.parentNode;
                    grandParentList.insertBefore(listItem, parentListItem.nextSibling);

                    // If the parent list is now empty, remove it
                    if (listItem.parentNode.children.length === 0) {
                        parentListItem.removeChild(listItem.parentNode);
                    }

                    // Ensure the cursor stays at the beginning of the list item's content
                    range.selectNodeContents(listItem);
                    range.collapse(true);
                    selection.removeAllRanges();
                    selection.addRange(range);
                }
            }
        }
    };

    return (
        <div className={`${styles['custom-editor']}`}>
            <div className="w-full flex gap-x-2">
                <Button onClick={() => execCommand('bold')} className={activeFormats.bold ? 'active' : ''}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                        <path strokeLinejoin="round" d="M6.75 3.744h-.753v8.25h7.125a4.125 4.125 0 0 0 0-8.25H6.75Zm0 0v.38m0 16.122h6.747a4.5 4.5 0 0 0 0-9.001h-7.5v9h.753Zm0 0v-.37m0-15.751h6a3.75 3.75 0 1 1 0 7.5h-6m0-7.5v7.5m0 0v8.25m0-8.25h6.375a4.125 4.125 0 0 1 0 8.25H6.75m.747-15.38h4.875a3.375 3.375 0 0 1 0 6.75H7.497v-6.75Zm0 7.5h5.25a3.75 3.75 0 0 1 0 7.5h-5.25v-7.5Z" />
                    </svg>
                </Button>
                <Button onClick={() => execCommand('italic')} className={activeFormats.italic ? 'active' : ''}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5.248 20.246H9.05m0 0h3.696m-3.696 0 5.893-16.502m0 0h-3.697m3.697 0h3.803" />
                    </svg>
                </Button>
                <Button onClick={() => execCommand('underline')} className={activeFormats.underline ? 'active' : ''}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.995 3.744v7.5a6 6 0 1 1-12 0v-7.5m-2.25 16.502h16.5" />
                    </svg>
                </Button>
                <Button onClick={() => execCommand('formatBlock', 'h1')} className={activeFormats.h1 ? 'active' : ''}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.243 4.493v7.5m0 0v7.502m0-7.501h10.5m0-7.5v7.5m0 0v7.501m4.501-8.627 2.25-1.5v10.126m0 0h-2.25m2.25 0h2.25" />
                    </svg>
                </Button>
                <Button onClick={() => execCommand('formatBlock', 'h2')} className={activeFormats.h2 ? 'active' : ''}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 19.5H16.5v-1.609a2.25 2.25 0 0 1 1.244-2.012l2.89-1.445c.651-.326 1.116-.955 1.116-1.683 0-.498-.04-.987-.118-1.463-.135-.825-.835-1.422-1.668-1.489a15.202 15.202 0 0 0-3.464.12M2.243 4.492v7.5m0 0v7.502m0-7.501h10.5m0-7.5v7.5m0 0v7.501" />
                    </svg>
                </Button>
                <Button onClick={() => execCommand('insertOrderedList')} className={activeFormats.ol ? 'active' : ''}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.242 5.992h12m-12 6.003H20.24m-12 5.999h12M4.117 7.495v-3.75H2.99m1.125 3.75H2.99m1.125 0H5.24m-1.92 2.577a1.125 1.125 0 1 1 1.591 1.59l-1.83 1.83h2.16M2.99 15.745h1.125a1.125 1.125 0 0 1 0 2.25H3.74m0-.002h.375a1.125 1.125 0 0 1 0 2.25H2.99" />
                    </svg>
                </Button>
                <Button onClick={() => execCommand('insertUnorderedList')} className={activeFormats.ul ? 'active' : ''}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                    </svg>
                </Button>
            </div>

            <div
                className={`mt-4 w-full h-full text-black dark:text-white bg-transparent p-4 outline-none ${isEmpty ? styles.placeholder : styles.content}`}
                ref={editorRef}
                contentEditable
                onInput={handleInput}
                onKeyDown={handleKeyDown}
            ></div>

            <div ref={completionRef} className="completion-display text-gray-500 fixed">{completion}</div>
        </div>
    );
};

export default Editor;