'use client';

import { motion } from 'framer-motion';
import { Transition } from "@headlessui/react";
import { useContext, useEffect, useState } from "react";
import ResponsiveContainer from "./ResponsiveContainer";
import { useTheme } from "../../context/ThemeContext";
import { AuthContext } from "@/context/AuthContext";

// Main buttons
const PrimaryButton = ({ content, href }) => (
    <a
        href={href}
        className="py-2 px-4 transition-all border-b-2 border-transparent hover:border-purple-800 text-black dark:text-white text-lg"
    >
        {content}
    </a>
);

const Navbar = () => {
    const { theme, toggleTheme } = useTheme();
    const { user } = useContext(AuthContext);

    const [isBurgerOpen, setIsBurgerOpen] = useState(false);
    const [transparent, setTransparent] = useState(true);

    const links = {
        primary: [
            ...(user ? [
                { name: "logout", url: "/logout" },
                { name: "notes", url: "/notes" },
            ] : [
                { name: "sign in", url: "/auth" }
            ]),
        ].filter(Boolean),
    };

    const handleScroll = () => {
        const scrollY = window.scrollY;

        if (scrollY > 50 || window.isBurgerOpen) {
            setTransparent(false);
        } else {
            setTransparent(true);
        }
    }

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        handleScroll();

        return () => {
            window.removeEventListener('scroll', handleScroll);
        }
    }, []);

    useEffect(() => {
        window.isBurgerOpen = isBurgerOpen;

        if (transparent && isBurgerOpen) {
            setTransparent(false);
        } else {
            handleScroll();
        }
    }, [isBurgerOpen]);

    return (
        <div className={`${!transparent && 'bg-[rgba(1,7,28,0.6)] backdrop-blur-2xl'} transition-all w-full h-fit fixed top-0 z-[10]`}>
            <ResponsiveContainer>
                <div className="py-8 w-full h-fit flex items-center justify-between">
                    <a href="/">
                        <span className="text-3xl text-black dark:text-white">Notefull</span>
                    </a>

                    <div className="flex items-center">
                        <div className="hidden xl:flex gap-x-4 w-fit h-fit">
                            {links.primary.map(({ name, url }, index) => (
                                <PrimaryButton href={url} content={name} key={`NavbarPrimaryButton${index}`} />
                            ))}
                        </div>

                        <div className="w-fit h-fit flex gap-x-4">
                            {/* Hamburger menu button */}
                            <div onClick={() => setIsBurgerOpen(!isBurgerOpen)} className="cursor-pointer xl:hidden block text-white flex items-center relative w-7 h-auto">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`absolute size-7 transition-all duration-300 ${isBurgerOpen ? 'opacity-0 scale-[0.5]' : 'opacity-1 scale-1'}`}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                                </svg>

                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`absolute size-7 transition-all duration-300 ${isBurgerOpen ? 'opacity-1 scale-1' : 'opacity-0 scale-[0.5]'}`}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                </svg>
                            </div>
                        </div>

                        <motion.button
                            onClick={toggleTheme}
                            className="ml-10 bg-gray-200 dark:bg-gray-800 p-2 rounded-full transition duration-300 hover:bg-gray-300 dark:hover:bg-gray-700"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            {theme === 'dark' ? '🌞' : '🌙'}
                        </motion.button>
                    </div>
                </div>

                {/* Responsive Navigation */}
                <Transition
                    show={isBurgerOpen}
                    className="overflow-hidden xl:hidden"
                    enter="transition-all duration-300 ease-in-out"
                    enterFrom="transform max-h-0 mb-0 scale-95 opacity-0"
                    enterTo="transform max-h-screen mb-0 scale-100 opacity-100"
                    leave="transition-all duration-300 ease-in-out"
                    leaveFrom="transform max-h-screen mb-0 scale-100 opacity-100"
                    leaveTo="transform max-h-0 mb-0 scale-95 opacity-0"
                >
                    <div className="flex flex-col w-full">
                        {links.primary.map(({ url, name }, index) => (
                            <a href={url} key={`NavbarHamburgerLink${index}`} className="select-none text-white text-lg text-center py-2.5 rounded-lg hover:bg-gray-100 transition-all">{name}</a>
                        ))}
                        <div className="h-4 w-full"></div>
                    </div>
                </Transition>
            </ResponsiveContainer>
        </div>
    );
};

export default Navbar;
