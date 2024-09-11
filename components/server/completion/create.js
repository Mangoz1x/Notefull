'use server';

import Groq from "groq-sdk";
import { checkAuth } from "@/components/server/auth/check";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const createCompletion = async ({
    prompt = `Complete the text based on the provided context. 
    Your output should be the predicted HTML completion. The predicted completion 
    can be HTML, you are also able to follow the users instructions if they ask for 
    something specific. You should not output markdown, just the HTML. Use previous context to determine weather 
    or not it is appropriate to create a completion, if not, just return "<ignore />".
    `.split("\n\n").join(""),
    content = '',
    completionLength = 1000,
}) => {
    try {
        if (!content) throw new Error('Content is required');

        const { user, error } = await checkAuth();
        if (error) throw new Error(error);
        if (!user) throw new Error('User not found');

        const completion = await groq.chat.completions.create({
            model: 'llama-3.1-8b-instant',
            messages: [
                {
                    role: 'system',
                    content: prompt,
                },
                {
                    role: 'user',
                    content: content,
                }
            ],
            max_tokens: completionLength,
            response_format: { type: 'text' },
        });
        
        const text = completion.choices[0].message.content;

        return {
            completion: text,
        };
    } catch (error) {
        return {
            error: error.message,
        };
    }
}