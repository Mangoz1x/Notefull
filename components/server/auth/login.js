'use server';

import { User } from '@/models/User';
import crypto from 'crypto';

export async function login({ email, password }) {
    try {
        // Check if the user already exists
        const user = await User.findOne({ email });
        if (!user) throw new Error('Email or password is incorrect.');

        const correctPassword = await user.correctPassword(password);
        if (!correctPassword)
            throw new Error('Email or password is incorrect.');

        if (!user.token) {
            user.token = crypto.randomBytes(128).toString('base64url');
            await user.save();
        }

        return {
            token: user.token,
            uuid: user.uuid,
            settings: user.settings,
        };
    } catch (error) {
        return { error: error.message };
    }
}
