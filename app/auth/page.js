'use client';

import { useContext, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/elements/Button';
import { GradientCircle } from '@/components/elements/GradientCircle';
import { login } from '@/components/server/auth/login';
import { createAccount } from '@/components/server/account/create';
import { AuthContext } from '@/context/AuthContext';

export default function AuthPage() {
    const { authenticateUser, user } = useContext(AuthContext);

    const [isLogin, setIsLogin] = useState(true);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const email = formData.get('email');
        const password = formData.get('password');

        const action = isLogin ? login : createAccount;
        const user = await action({ email, password });
        
        if (user.error) {
            setError(user.error);
            return;
        }
        
        authenticateUser(user);
    };

    useEffect(() => {
        if (user) {
            window.location.href = '/notes';
        }
    }, [user]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 relative overflow-hidden">
            <GradientCircle x="-50%" y="-50%" translateX="25%" translateY="25%" rgb={[65, 105, 225]} />
            <GradientCircle x="100%" y="100%" translateX="-50%" translateY="-50%" rgb={[138, 43, 226]} />

            <motion.div
                className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-md relative z-10"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h2 className="text-3xl font-bold mb-6 text-center text-gray-800 dark:text-white">
                    {isLogin ? 'Login' : 'Sign Up'}
                </h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            className="text-black w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                            required
                            placeholder="joe@gmail.com"
                        />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black dark:bg-gray-700 dark:text-white"
                            required
                            placeholder="********"
                        />
                    </div>
                    <Button variant="primary" type="submit" className="w-full">
                        {isLogin ? 'Login' : 'Sign Up'}
                    </Button>
                </form>
                {error && <p className="mt-4 text-center text-sm text-red-600 dark:text-red-400">{error}</p>}
                <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-indigo-600 dark:text-indigo-400 hover:underline focus:outline-none"
                    >
                        {isLogin ? 'Sign up' : 'Login'}
                    </button>
                </p>
            </motion.div>
        </div>
    );
}