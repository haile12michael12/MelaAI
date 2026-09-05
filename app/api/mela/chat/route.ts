import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { extractDomainContext } from "@/lib/mela/context";
import { MELA_SYSTEM_PROMPT } from "@/lib/mela/prompts";
import { getAllToolDeclarations, executeToolSecurely } from "@/lib/mela/tool-registry";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await requireUser(req);
    const body = await req.json();
    const { message, history = [], isFirstMessage = false, confirmedAction = null } = body;

    if (!message && !confirmedAction) {
      return NextResponse.json({ error: "Missing message query." }, { status: 400 });
    }

    // Direct confirmation handler
    if (confirmedAction) {
      const execResult = await executeToolSecurely(session, confirmedAction.action, confirmedAction.params, true);
      return NextResponse.json({
        reply: execResult.message || "Action executed successfully.",
        actionResult: execResult,
      });
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      return NextResponse.json({
        reply: `Hello! I am MELA. I've received your query: "${message}". (Note: Add GEMINI_API_KEY to your .env.local to activate full live AI responses).`,
        suggestedTitle: isFirstMessage ? message.slice(0, 30) : undefined,
      });
    }

    // 1. Context retrieval
    const domainContexts = await extractDomainContext(session, message);
    let contextualInstructions = MELA_SYSTEM_PROMPT;

    if (domainContexts.length > 0) {
      contextualInstructions += "\n\n--- RETRIEVED USER DATA CONTEXT ---\n";
      for (const ctx of domainContexts) {
        contextualInstructions += `Domain: ${ctx.domain}\nSummary: ${ctx.summary}\nData: ${JSON.stringify(ctx.data)}\n\n`;
      }
    }

    // 2. Initialize Gemini with full tool registry declarations
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: contextualInstructions,
      tools: [{ functionDeclarations: getAllToolDeclarations() }]
    });

    const sdkHistory = history.map((h: any) => ({
      role: h.role === "assistant" ? "model" : "user",
      parts: Array.isArray(h.parts) ? h.parts : [{ text: h.content || "" }]
    }));

    const chat = model.startChat({ history: sdkHistory });
    let response = await chat.sendMessage(message);

    let iterations = 0;
    let pendingConfirmation: any = null;

    while (iterations < 5) {
      const functionCalls = response.response.functionCalls();
      if (functionCalls && functionCalls.length > 0) {
        const call = functionCalls[0];
        const rawResult = await executeToolSecurely(session, call.name, call.args, false);

        if (rawResult && rawResult.requireConfirmation) {
          pendingConfirmation = {
            action: call.name,
            params: call.args,
            message: rawResult.message,
            preview: rawResult.preview,
          };
          break;
        }

        const toolResult = (rawResult && typeof rawResult === "object" && !Array.isArray(rawResult)) ? rawResult : { result: rawResult };

        response = await chat.sendMessage([{
          functionResponse: {
            name: call.name,
            response: toolResult
          }
        }]);
        iterations++;
      } else {
        break;
      }
    }

    const reply = response.response.text();
    let suggestedTitle: string | undefined;
    if (isFirstMessage) {
      suggestedTitle = message.length > 32 ? message.slice(0, 32) + "..." : message;
    }

    return NextResponse.json({
      reply,
      suggestedTitle,
      pendingConfirmation,
    });
  } catch (error: any) {
    console.error("Mela Assistant Chat Error:", error);
    return NextResponse.json({ error: error.message || "Failed to process chat query" }, { status: 500 });
  }
}
