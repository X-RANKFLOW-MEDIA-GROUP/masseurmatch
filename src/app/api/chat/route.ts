import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Initialize the Gemini API (Ensure you have this installed: npm install @google/generative-ai)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 });
    }

    const body = await req.json();
    const { messages, userLocation } = body;

    // The System Prompt: This dictates Knotty's personality and constraints.
    // It enforces the "Luxury, World-Class" tone.
    const systemPrompt = `You are Knotty, an elite wellness concierge for MasseurMatch. 
    Your tone is sophisticated, brief, professional, and warmly welcoming (similar to a luxury hotel concierge).
    You help users find high-end massage therapists. 
    The user's current location context is: ${userLocation || "Unknown"}.
    Keep responses concise (1-3 sentences max). Never sound like a generic AI robot.
    Do not use emojis excessively, keep it very clean.`;

    // Format the conversation history for Gemini
    const formattedHistory = messages.map((msg: any) => ({
      role: msg.role === "ai" ? "model" : "user",
      parts: [{ text: msg.text }],
    }));

    // Insert the system prompt as the first instruction invisibly
    formattedHistory.unshift({
      role: "user",
      parts: [{ text: `[SYSTEM INSTRUCTION: ${systemPrompt}]` }]
    });
    formattedHistory.push({
      role: "model",
      parts: [{ text: "Understood. I am Knotty. How can I assist?" }]
    });

    // Select the model (gemini-1.5-flash is lightning fast and perfect for chat)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Send the latest user message with the history context
    const chat = model.startChat({ history: formattedHistory });
    const latestUserMessage = messages[messages.length - 1].text;
    
    const result = await chat.sendMessage(latestUserMessage);
    const responseText = result.response.text();

    return NextResponse.json({ reply: responseText });

  } catch (error) {
    console.error("Knotty AI Error:", error);
    return NextResponse.json({ error: "Failed to connect to Knotty's cognitive core." }, { status: 500 });
  }
}