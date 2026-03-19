import { streamText, convertToModelMessages } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, model } = body;

    // Key comes from the client header — used in memory only, never logged
    const apiKey = req.headers.get("x-api-key");

    if (!apiKey) {
      return NextResponse.json({ error: "API key required" }, { status: 401 });
    }
    if (!model || typeof model !== "string") {
      return NextResponse.json({ error: "Model required" }, { status: 400 });
    }
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Messages required" }, { status: 400 });
    }

    // v6: client sends UIMessage[] (parts-based). convertToModelMessages turns
    // them into CoreMessage[] that streamText understands. Also caps history depth.
    const coreMessages = await convertToModelMessages(messages.slice(-50));

    // System prompt: establishes response quality and format expectations
    const system =
      "You are a thoughtful, knowledgeable assistant running inside a canvas-based AI workspace. " +
      "Respond with precision and clarity. Use markdown — headings, code blocks, lists — when it improves readability, " +
      "but keep prose tight and avoid filler. When the user quotes or references a passage (prefixed with '>'), " +
      "treat it as the focal context for the conversation. In branched conversations, the earlier messages are " +
      "inherited context; build on them without restating what was already covered.";

    let result;

    if (model.startsWith("gpt-")) {
      const client = createOpenAI({ apiKey });
      result = streamText({ model: client(model), system, messages: coreMessages });
    } else if (model.startsWith("claude-")) {
      const client = createAnthropic({ apiKey });
      result = streamText({ model: client(model), system, messages: coreMessages });
    } else if (model.startsWith("gemini-")) {
      const client = createGoogleGenerativeAI({ apiKey });
      result = streamText({ model: client(model), system, messages: coreMessages });
    } else {
      // Groq is OpenAI-compatible — same SDK, different baseURL
      const client = createOpenAI({
        apiKey,
        baseURL: "https://api.groq.com/openai/v1",
      });
      result = streamText({ model: client(model), system, messages: coreMessages });
    }

    // v6: toUIMessageStreamResponse() matches what DefaultChatTransport expects.
    // toDataStreamResponse() was the v3 format — won't parse on the client side.
    return result.toUIMessageStreamResponse();
  } catch (err) {
    // Never expose internal error details to the client
    console.error("[/api/chat]", err);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
