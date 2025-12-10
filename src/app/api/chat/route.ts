import { GoogleGenAI } from '@google/genai';
import { NextRequest } from 'next/server';

// Initialize Gemini AI client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

// Model configuration
const MODEL = 'gemini-2.5-flash';

// System prompt for EVE AI Assistant
const SYSTEM_PROMPT = `You are EVE AI, an intelligent assistant for an insurance agency automation platform. You help insurance agency staff with:

1. **Customer Service**: Answer questions about insurance policies, claims, and procedures
2. **Policy Information**: Provide details about different insurance products and coverage options
3. **Claims Assistance**: Guide users through the claims process and status inquiries
4. **Appointment Scheduling**: Help coordinate appointments between agents and clients
5. **Document Assistance**: Help with insurance documentation and forms
6. **General Inquiries**: Answer common insurance-related questions

Guidelines:
- Be professional, helpful, and concise
- If you don't know something specific to the agency, suggest contacting a human agent
- For sensitive matters (claims disputes, policy cancellations), recommend speaking with an agent
- Provide accurate general insurance information
- Support both English and Chinese languages based on user preference
- Always maintain a friendly and supportive tone
- Keep responses focused and actionable
- Use markdown formatting for better readability when appropriate`;

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    const { messages, enableSearch = false } = await request.json() as {
      messages: ChatMessage[];
      enableSearch?: boolean;
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'Messages are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Build tools array
    const tools = enableSearch ? [{ googleSearch: {} }] : [];

    // Build contents array with system prompt
    const contents = [
      {
        role: 'user' as const,
        parts: [{ text: `System Instructions: ${SYSTEM_PROMPT}\n\nPlease acknowledge and follow these instructions.` }],
      },
      {
        role: 'model' as const,
        parts: [{ text: 'I understand. I am EVE AI, ready to assist with insurance agency operations. How can I help you today?' }],
      },
      // Add conversation history
      ...messages.map((msg) => ({
        role: msg.role === 'assistant' ? ('model' as const) : ('user' as const),
        parts: [{ text: msg.content }],
      })),
    ];

    const modelConfig = {
      temperature: 0.7,
      tools: tools.length > 0 ? tools : undefined,
    };

    // Create streaming response
    const response = await ai.models.generateContentStream({
      model: MODEL,
      config: modelConfig,
      contents,
    });

    // Create a TransformStream for streaming the response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of response) {
            if (chunk.text) {
              // Send as Server-Sent Events format
              const data = JSON.stringify({ text: chunk.text });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
          const errorData = JSON.stringify({ error: 'Stream error occurred' });
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat API Error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process chat request' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// Non-streaming endpoint for simple requests
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const question = searchParams.get('q');

  if (!question) {
    return new Response(JSON.stringify({ error: 'Question parameter (q) is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const contents = [
      {
        role: 'user' as const,
        parts: [{ text: `System Instructions: ${SYSTEM_PROMPT}\n\nPlease acknowledge and follow these instructions.` }],
      },
      {
        role: 'model' as const,
        parts: [{ text: 'I understand. I am EVE AI, ready to assist with insurance agency operations. How can I help you today?' }],
      },
      {
        role: 'user' as const,
        parts: [{ text: question }],
      },
    ];

    const response = await ai.models.generateContent({
      model: MODEL,
      config: { temperature: 0.7 },
      contents,
    });

    return new Response(
      JSON.stringify({ response: response.text }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Chat API Error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process request' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
