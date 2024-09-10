'use server';

import { checkAuth } from '@/components/server/auth/check';
import Note from '@/models/Note';

export const RetrieveNotes = async ({ ids = [], page = 1, limit = 20 }) => {
    try {
        const { user, error } = await checkAuth();
        
        if (error) {
            return { error: error.message };
        }

        if (!user) {
            return { error: 'Unauthorized' };
        }

        const query = { uuid: user.uuid };
        if (ids.length > 0) {
            query.id = { $in: ids };
        }

        const skip = (page - 1) * limit;
  
        const notes = await Note.find(query)
            .sort({ modified: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const totalNotes = await Note.countDocuments(query);

        return JSON.parse(JSON.stringify({
            notes,
            totalPages: Math.ceil(totalNotes / limit),
            currentPage: page,
        }));
    } catch (error) {
        return { error: error.message };
    }
};