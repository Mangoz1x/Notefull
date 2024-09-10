'use server';

import { User } from '@/models/User';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

export async function createAccount({ email, password }) {
  try {
    // Check if the user already exists
    const user = await User.findOne({ email });
    if (user) throw new Error('A user already exists with this email.');

    // Create a hashed and salted password
    const hashedPassword = await bcrypt.hash(password, 12);
    const token = crypto.randomBytes(128).toString('hex');

    // Create new user
    const newUser = new User({
      uuid: uuidv4(),
      email,
      password: hashedPassword,
      token,
      settings: {
        theme: 'light',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await newUser.save();

    return {
      token,
      email,
      settings: newUser.settings
    };
  } catch (error) {
    return { error: error.message };
  }
}
