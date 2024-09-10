'use client';

import { useState, useEffect, useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import { Loading } from "@/components/layout/Loading";
import NavbarOffset from "@/components/layout/NavbarOffset";
import { RetrieveNotes } from "@/components/server/note/retrieve";
import Link from "next/link";

const NoteCard = ({ note }) => {
    return (
        <Link href={`/note/${note.id}`}>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-2xl cursor-pointer hover:shadow-lg transition-shadow duration-300">
                <h2 className="text-2xl dark:text-gray-300 text-gray-700 font-bold">{note.name}</h2>
                <p className="text-gray-500 mt-2 truncate">{note.html.replace(/<[^>]*>/g, '').substring(0, 100)}...</p>
                <p className="text-sm text-gray-400 mt-2">Last modified: {new Date(note.modified).toLocaleString()}</p>
            </div>
        </Link>
    );
};

const NotesPage = () => {
    const [notes, setNotes] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const { user, loading } = useContext(AuthContext);

    useEffect(() => {
        if (!loading && !user) {
            window.location.href = '/auth';
        } else if (user) {
            fetchNotes();
        }
    }, [user, loading, page]);

    const fetchNotes = async () => {
        const result = await RetrieveNotes({ page });
        if (result.notes) {
            setNotes(result.notes);
            setTotalPages(result.totalPages);
        } else if (result.error) {
            console.error("Error fetching notes:", result.error);
        }
    };

    if (loading) {
        return <Loading />;
    }

    if (!user) {
        return null; // This will prevent the page content from flashing before redirect
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <NavbarOffset />

            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {notes.map((note) => (
                        <NoteCard key={note._id} note={note} />
                    ))}
                    
                    <Link href="/note/new">
                        <div className="relative bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 h-full dark:hover:bg-gray-700 transition-all duration-300 overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 animate-gradient-x opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="absolute inset-[3px] bg-white dark:bg-gray-800 rounded-lg z-10">
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 opacity-10 group-hover:opacity-20 transition-opacity duration-300"></div>
                            </div>
                            <span className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 relative z-20 mb-2 group-hover:scale-110 transition-transform duration-300">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 text-black dark:text-white">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                </svg>
                            </span>
                            <span className="text-xl font-semibold text-gray-700 dark:text-gray-300 relative z-20 group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-300">New Note</span>
                        </div>
                    </Link>
                </div>

                {totalPages > 1 && (
                    <div className="mt-8 flex justify-center">
                        <button
                            onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                            disabled={page === 1}
                            className="px-4 py-2 bg-blue-500 text-white rounded-l-md disabled:bg-gray-300"
                        >
                            Previous
                        </button>
                        <span className="px-4 py-2 bg-gray-200">{page} / {totalPages}</span>
                        <button
                            onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={page === totalPages}
                            className="px-4 py-2 bg-blue-500 text-white rounded-r-md disabled:bg-gray-300"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotesPage;