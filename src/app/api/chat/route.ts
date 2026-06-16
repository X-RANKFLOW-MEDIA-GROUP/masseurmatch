import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_PROMPT = `You are a helpful concierge assistant for MasseurMatch, a platform that connects clients with licensed massage therapists.

Your role is to:
- Help clients find the right massage therapist for their needs
- Answer questions about massage modalities (Swedish, deep tissue, sports, etc.)
- Explain how MasseurMatch works
- Provide general wellness and self-care information

Keep responses concise, friendly, and focused on massage therapy. If asked about specific therapist availability or pricing, direct users to search the directory.`;

type ChatMessage = {
  role: "user" | "ai";
  content: string;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      messages: ChatMessage[];
      userLocation?: { city?: string } | null;
    };

    const { messages, userLocation } = body;

    if (!messages?.length) {
      return NextResponse.json({ error: "No messages provided" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        reply: "I'm sorry, the AI assistant is not configured yet. Please contact support@masseurmatch.com for help finding the right therapist.",
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const locationContext = userLocation?.city
      ? ` The user is located in ${userLocation.city}.`
      : "";

    const history = messages.slice(0, -1).map((m) => ({
      role: m.role === "ai" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== "user") {
      return NextResponse.json({ error: "Last message must be from user" }, { status: 400 });
    }

    const chat = model.startChat({
      history,
      systemInstruction: SYSTEM_PROMPT + locationContext,
    });

    const result = await chat.sendMessage(lastMessage.content);
    const reply = result.response.text();

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("Chat API error:", err);
    return NextResponse.json(
      { error: "Failed to get response. Please try again." },
      { status: 500 }
    );
  }
}
