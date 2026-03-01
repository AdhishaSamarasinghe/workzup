import { generateText } from 'ai';
import { google } from '@ai-sdk/google';

async function main() {
    try {
        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await res.json();
        console.log(JSON.stringify(data.models?.map((m: any) => m.name), null, 2));
    } catch (e) {
        console.log(e);
    }
}

main();
