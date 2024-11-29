import OpenAI from "openai";

const openai = new OpenAI({apiKey:process.env.OPENAI_API_KEY})


export function getThreadId() {
    return localStorage.getItem("threadId") || ""
}

export async function createThread(){
    let thread = await openai.beta.threads.create()

    //localStorage.setItem("threadId", thread.id)
    return thread.id
}

export async function listMessages(threadId: string) {
    return openai.beta.threads.messages.list(threadId)
}

export async function sendMessageToThread(threadId: string, message: string) {
    const threadMessages = await openai.beta.threads.messages.create(
        threadId,
        { role: "user", content: message }
    );
    return threadMessages
}