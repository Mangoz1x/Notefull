'use server';

import { cookies } from 'next/headers';
import { User } from '@/models/User';
import crypto from 'crypto';

export async function logout() {
    try {
        const cookieStore = cookies();
        const userData = cookieStore.get('userData');

        if (userData) {
            // Clear the token cookie
            cookieStore.delete('userData');
            const { token, uuid } = JSON.parse(userData.value);

            // Invalidate the token in the database
            await User.updateOne(
                { token, uuid },
                { token: crypto.randomBytes(128).toString('base64url') }
            );
        }

        return { success: true };
    } catch (error) {
        return { error: error.message };
    }
}