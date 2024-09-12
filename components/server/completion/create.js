'use server';

import Groq from "groq-sdk";
import OpenAI from "openai";

import { checkAuth } from "@/components/server/auth/check";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const createCompletion = async ({
    prompt = `
        You are a helpful assistant that completes the text based on the given context. 
        The <cursor/> tag represents the users current typing cursor.
        The <ignore/> tag should be your output if you do not have any completions to provide.
        You should complete the next few words up to the next sentence, and the completion will go where the <cursor/> tag is.
        Your output can be in HTML if needed, and should only be the completion of the text not the text itself completed.
    `.split("\n\n").join(""),
    content = '',
    completionLength = 1000,
}) => {
    try {
        if (!content) throw new Error('Content is required');

        const { user, error } = await checkAuth();

        if (error) throw new Error(error);
        if (!user) throw new Error('User not found');

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: prompt,
                },
                {
                    role: 'user',
                    content: `Text to complete: ${content}`,
                }
            ],
            max_tokens: completionLength,
            response_format: { type: 'text' },
        });


        // const completion = await groq.chat.completions.create({
        //     model: 'llama-3.1-70b-versatile',
        //     messages: [
        //         {
        //             role: 'system',
        //             content: prompt,
        //         },
        //         {
        //             role: 'user',
        //             content: content,
        //         }
        //     ],
        //     max_tokens: completionLength,
        //     response_format: { type: 'text' },
        // });

        const text = completion.choices[0].message.content;
        // const text = completion.choices[0].text;

        return {
            completion: text,
        };
    } catch (error) {
        return {
            error: error.message,
        };
    }
}