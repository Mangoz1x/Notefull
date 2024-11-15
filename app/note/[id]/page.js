'use client';

import { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { RetrieveNotes } from '@/components/server/note/retrieve';
import { SaveNote } from '@/components/server/note/save';
import { Loading } from '@/components/layout/Loading';
import NavbarOffset from '@/components/layout/NavbarOffset';
import ResponsiveContainer from '@/components/layout/ResponsiveContainer';
import { Editor } from '@/components/elements/Editor/Index';
import { useTheme } from '@/context/ThemeContext';

const NotePage = ({ params }) => {
    const [note, setNote] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    const [lastSavedNote, setLastSavedNote] = useState(null);
    
    const { user, loading } = useContext(AuthContext);
    const { setStickyNav } = useTheme();
    const { id } = params;

    useEffect(() => {
        if (!loading && !user) {
            window.location.href = '/auth';
        } else if (user) {
            fetchNote();
        }

        setStickyNav(false);
    }, [user, loading, id]);

    const fetchNote = async () => {
        if (id === 'new') {
            setNote({ name: 'New Note', html: '' });
            setLastSavedNote({ name: 'New Note', html: '' });
            setIsLoading(false);
            return;
        }

        const result = await RetrieveNotes({ ids: [id] });
        if (result.notes && result.notes.length > 0) {
            setNote(result.notes[0]);
            setLastSavedNote(result.notes[0]);
        } else if (result.error) {
            console.error("Error fetching note:", result.error);
        }
        setIsLoading(false);
    };

    const handleSave = useCallback(async () => {
        if (!note) {
            console.error("Note is undefined");
            return;
        }

        if (note?.html === lastSavedNote?.html && note?.name === lastSavedNote?.name) {
            return; // No changes to save
        }

        setIsSaving(true);
        const result = await SaveNote({
            id: id === 'new' ? null : id,
            name: note?.name,
            html: note?.html,
        });
        setIsSaving(false);

        if (result.success) {
            setLastSavedNote(note);
            if (id !== result.note.id) {
                window.location.href = `/note/${result.note.id}`;
            }
        } else {
            console.error("Error saving note:", result.error);
        }
    }, [note, lastSavedNote, id]);

    useEffect(() => {
        const autoSaveInterval = setInterval(() => {
            if (note && JSON.stringify(note) !== JSON.stringify(lastSavedNote)) {
                handleSave();
            }
        }, 1000);

        return () => clearInterval(autoSaveInterval);
    }, [note, lastSavedNote, handleSave]);

    if (loading || isLoading) {
        return <Loading />;
    }

    if (!user) {
        return null;
    }

    const hasUnsavedChanges = JSON.stringify(note) !== JSON.stringify(lastSavedNote);

    return (
        <ResponsiveContainer>
            <div className="min-h-screen bg-gray-100 dark:bg-gray-950">
                <NavbarOffset />
                <div className="container mx-auto py-8">
                    <div className="flex justify-between items-center mb-4">
                        <input
                            type="text"
                            value={note?.name || ''}
                            onChange={(e) => setNote({ ...note, name: e.target.value })}
                            className="text-2xl font-bold bg-transparent dark:text-gray-300 text-gray-700 border-none focus:outline-none"
                            placeholder="Note Title"
                        />
                        <div className="text-sm text-gray-500">
                            {isSaving ? 'Saving...' : hasUnsavedChanges ? 'Changes not saved' : 'All changes saved'}
                        </div>
                    </div>

                    <Editor value={note?.html || ''} onChange={(html) => setNote({ ...note, html })} />
                </div>
            </div>
        </ResponsiveContainer>
    );
};

export default NotePage;