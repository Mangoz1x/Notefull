import { createCompletion } from '@/components/server/completion/create';

export const decideAutocompleteText = async (text, cursorPosition) => {
    cursorPosition = cursorPosition - 1;

    // Get the offset of the cursor from the start of the text
    const offset = text.split('\n').length - 1;
    const textWithCursor = text.slice(0, cursorPosition) + '<cursor/>' + text.slice(cursorPosition - offset);

    const completion = await createCompletion({
        content: textWithCursor,
        completionLength: 50,
    });

    const completionText = completion?.completion || '';
    console.log('completionText', completionText);
    if (!completionText || completionText === '<ignore/>') {
        return '';
    }

    return completionText.replace('<cursor/>', '');
};