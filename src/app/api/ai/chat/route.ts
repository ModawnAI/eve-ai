import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const SYSTEM_PROMPT = `You are EVE, an AI assistant for insurance agents. You help with:
- Analyzing insurance documents and quotes
- Comparing coverage options
- Explaining policy terms in English and Chinese (Mandarin)
- Answering questions about insurance regulations
- Helping with client communications
- Generating renewal reminders and policy summaries

Always be professional, accurate, and helpful. When discussing insurance terms, provide clear explanations. If asked in Chinese, respond in Chinese. If the user switches languages, match their language.

Important guidelines:
- Never provide specific legal or tax advice - recommend consulting professionals
- Be cautious with premium estimates - actual rates depend on many factors
- Protect client privacy - never share client information externally
- For complex claims or disputes, recommend escalating to supervisors`;

// POST - Send a message to the AI
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's agency_id
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('agency_id')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { message, conversationId } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    let activeConversationId = conversationId;

    // If no conversation ID, create a new conversation
    if (!activeConversationId) {
      const { data: newConversation, error: convError } = await supabase
        .from('ai_conversations')
        .insert({
          agency_id: userData.agency_id,
          user_id: user.id,
          title: message.substring(0, 100), // Use first 100 chars as title
          context_type: 'general',
        })
        .select()
        .single();

      if (convError) {
        console.error('Error creating conversation:', convError);
        return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 });
      }

      activeConversationId = newConversation.id;
    }

    // Save user message
    const { error: userMsgError } = await supabase
      .from('ai_messages')
      .insert({
        conversation_id: activeConversationId,
        role: 'user',
        content: message,
      });

    if (userMsgError) {
      console.error('Error saving user message:', userMsgError);
    }

    // Get conversation history for context
    const { data: history } = await supabase
      .from('ai_messages')
      .select('role, content')
      .eq('conversation_id', activeConversationId)
      .order('created_at', { ascending: true })
      .limit(20); // Limit to last 20 messages for context

    // Build chat history for Gemini
    const chatHistory = history?.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    })) || [];

    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY) {
      // Return a demo response if no API key
      const demoResponse = `I'm EVE, your AI insurance assistant.

Currently running in demo mode (API key not configured).

In production, I can help you with:
- Analyzing insurance quotes and documents
- Comparing coverage options
- Explaining policy terms in English or Chinese
- Generating client communications

Your message: "${message}"

To enable full AI capabilities, add GEMINI_API_KEY to your environment variables.`;

      // Save demo response
      await supabase
        .from('ai_messages')
        .insert({
          conversation_id: activeConversationId,
          role: 'assistant',
          content: demoResponse,
        });

      return NextResponse.json({
        response: demoResponse,
        conversationId: activeConversationId,
      });
    }

    // Call Gemini API
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

    const chat = model.startChat({
      history: chatHistory.length > 0 ? chatHistory : undefined,
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.7,
      },
    });

    // Add system prompt to the first message if it's a new conversation
    const promptWithContext = chatHistory.length === 0
      ? `${SYSTEM_PROMPT}\n\nUser: ${message}`
      : message;

    const result = await chat.sendMessage(promptWithContext);
    const response = result.response;
    const aiMessage = response.text();

    // Save AI response
    const { error: aiMsgError } = await supabase
      .from('ai_messages')
      .insert({
        conversation_id: activeConversationId,
        role: 'assistant',
        content: aiMessage,
        tokens_used: response.usageMetadata?.totalTokenCount || null,
      });

    if (aiMsgError) {
      console.error('Error saving AI message:', aiMsgError);
    }

    // Update conversation title if it's the first exchange
    if (chatHistory.length <= 1) {
      await supabase
        .from('ai_conversations')
        .update({
          title: message.substring(0, 100),
          updated_at: new Date().toISOString(),
        })
        .eq('id', activeConversationId);
    }

    return NextResponse.json({
      response: aiMessage,
      conversationId: activeConversationId,
    });
  } catch (error) {
    console.error('Error in AI chat:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
