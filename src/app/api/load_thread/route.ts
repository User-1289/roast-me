import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import OpenAI from "openai";
import { createThread } from "@/lib/openai_funcs";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID || "asst_XZcovvcg0pzA3hwiFFqy6dfL";

export async function GET(req: NextRequest) {
            // Get or create thread ID
    const cookieStore = cookies();
    let threadId = cookieStore.get("threadId")?.value;
    
    if (!threadId) {
        return NextResponse.json({ error: "No thread ID found" }, { status: 400 });
    }
    try{
        const messages = await openai.beta.threads.messages.list(threadId);
        return NextResponse.json(messages.data, {status: 200});
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 500 });
    }

}

