'use server';

import { checkAuth } from '@/components/server/auth/check';
import Note from '@/models/Note';
import { v4 as uuidv4 } from 'uuid';

export const SaveNote = async ({ id, name, html }) => {
  try {
    const { user, error } = await checkAuth();
    
    if (error) {
      return { error: error };
    }
    
    if (!user) {
      return { error: 'Unauthorized' };
    }

    let note;
    if (id) {
      // Update existing note
      note = await Note.findOneAndUpdate(
        { id, uuid: user.uuid },
        { name, html, modified: new Date() },
        { new: true, runValidators: true }
      );
    } else {
      // Create new note
      note = new Note({
        id: uuidv4(),
        name,
        html,
        uuid: user.uuid,
      });
      await note.save();
    }

    if (!note) {
      return { error: 'Note not found or you do not have permission to edit it' };
    }

    // Convert Mongoose document to a plain JavaScript object
    const plainNote = JSON.parse(JSON.stringify(note));

    return { success: true, note: plainNote };
  } catch (error) {
    return { error: error.message };
  }
};