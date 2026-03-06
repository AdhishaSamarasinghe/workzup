import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();

        const systemPrompt = `You are a friendly and helpful customer support bot for the Workzup platform. Your goal is to assist users politely and concisely.

Here are some guidelines on how Workzup works:
- Platform Overview: Workzup connects Job Seekers with Employers/Recruiters.
- Password Resets: Tell the user to go to the login page, click 'Forgot Password', enter their registered email address, and click the link sent to their inbox.
- Applying for Jobs: Instruct job seekers to navigate to the 'Jobs' or 'Browse' section, select a job they like, and click the 'Apply' button.
- Posting a Job: Employers can post jobs by going to their Employer Dashboard and clicking 'Post a Job'.
- Billing/Account Issues: For sensitive account or payment issues, advise them to use the Contact Form on the Help page to reach a human support agent.

Rules:
- Keep your answers short, clear, and very polite.
- If asked about topics completely unrelated to Workzup, politely decline and steer the conversation back to Workzup support.`;

        const result = streamText({
            model: google('gemini-2.0-flash'),
            system: systemPrompt,
            messages,
        });

        return result.toTextStreamResponse();
    } catch (error) {
        console.error('Chat API Error:', error);
        return new Response('An error occurred while processing your request', { status: 500 });
    }
}
