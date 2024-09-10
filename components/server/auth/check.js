'use server';

import { cookies } from 'next/headers';
import { User } from '@/models/User';

export const checkAuth = async () => {
    try {
        // Get the cookies from the server
        const cookieStore = cookies();
        
        // Check if the user is authenticated
        const userCookie = cookieStore.get('userData');
        if (!userCookie) throw new Error('User not authenticated');

        const user = JSON.parse(userCookie.value);
        const dbUser = await User.findOne({ uuid: user.uuid });

        if (!dbUser) throw new Error('User not found');
        if (dbUser.token !== user.token) throw new Error('Invalid token');

        // Delete the password from the user object
        delete dbUser.password;

        return {
            authenticated: true,
            error: null,
            user: dbUser,
        };
    } catch (error) {
        return {
            authenticated: false,
            error: error.message,
            user: null,
        };
    }
};
