import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID || "asst_XZcovvcg0pzA3hwiFFqy6dfL";

async function createThread() {
    const thread = await openai.beta.threads.create();
    return thread.id;
}

async function sendMessageToThread(threadId: string, message: string) {
    return await openai.beta.threads.messages.create(threadId, {
        role: "user",
        content: message
    });
}

async function waitForRunCompletion(threadId: string, runId: string) {
    let run;
    do {
        run = await openai.beta.threads.runs.retrieve(threadId, runId);
        if (run.status === 'failed') {
            throw new Error('Run failed: ' + run.last_error?.message);
        }
        if (run.status !== 'completed') {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before checking again
        }
    } while (run.status !== 'completed');

    // Get messages after completion
    const messages = await openai.beta.threads.messages.list(threadId);
    return messages.data[0]?.content[0]; // Get the latest assistant response
}

export async function POST(req: NextRequest) {
    try {
        // Get and validate message from request body
        const { message } = await req.json();
        if (!message) {
            return NextResponse.json(
                { error: 'Message is required' },
                { status: 400 }
            );
        }

        // Get or create thread ID
        const cookieStore = cookies();
        let threadId = cookieStore.get("threadId")?.value;
        
        if (!threadId) {
            threadId = await createThread();
            cookieStore.set("threadId", threadId);
        }

        // Send message to thread
        await sendMessageToThread(threadId, message);

        // Create and start the run
        const run = await openai.beta.threads.runs.create(threadId, {
            assistant_id: ASSISTANT_ID
        });

        // Wait for completion and get response
        const response = await waitForRunCompletion(threadId, run.id);

        // Return successful response with data
        return NextResponse.json({
            success: true,
            data: {
                threadId,
                runId: run.id,
                response: response,
                status: 'completed'
            }
        });

    } catch (error) {
        console.error('Error:', error);
        
        // Return error response
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'An unexpected error occurred'
        }, {
            status: 500
        });
    }
}