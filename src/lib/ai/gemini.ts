'use server';

import { GoogleGenAI } from '@google/genai';

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
- Always maintain a friendly and supportive tone`;

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatConfig {
  temperature?: number;
  maxTokens?: number;
  enableSearch?: boolean;
}

/**
 * Generate a streaming chat response from Gemini
 */
export async function* streamChat(
  messages: ChatMessage[],
  config: ChatConfig = {}
): AsyncGenerator<string, void, unknown> {
  const { temperature = 0.7, enableSearch = true } = config;

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
    temperature,
    tools: tools.length > 0 ? tools : undefined,
  };

  try {
    const response = await ai.models.generateContentStream({
      model: MODEL,
      config: modelConfig,
      contents,
    });

    for await (const chunk of response) {
      if (chunk.text) {
        yield chunk.text;
      }
    }
  } catch (error) {
    console.error('Gemini AI Error:', error);
    throw new Error('Failed to generate AI response');
  }
}

/**
 * Generate a non-streaming chat response from Gemini
 */
export async function chat(
  messages: ChatMessage[],
  config: ChatConfig = {}
): Promise<string> {
  const { temperature = 0.7, enableSearch = true } = config;

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
    temperature,
    tools: tools.length > 0 ? tools : undefined,
  };

  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      config: modelConfig,
      contents,
    });

    return response.text || '';
  } catch (error) {
    console.error('Gemini AI Error:', error);
    throw new Error('Failed to generate AI response');
  }
}

/**
 * Quick question for simple queries (no history)
 */
export async function quickQuestion(question: string): Promise<string> {
  return chat([{ role: 'user', content: question }], { enableSearch: false });
}
