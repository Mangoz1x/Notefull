import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const NoteSchema = new mongoose.Schema({
    id: {
        type: String,
        default: uuidv4,
        unique: true,
        required: true,
    },
    html: {
        type: String,
        default: '',
    },
    name: {
        type: String,
        required: true,
    },
    uuid: {
        type: String,
        required: true,
    },
    created: {
        type: Date,
        default: Date.now,
    },
    modified: {
        type: Date,
        default: Date.now,
    },
});

const Note = mongoose.models.Note || mongoose.model('Note', NoteSchema);

export default Note;