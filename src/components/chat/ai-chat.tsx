'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Robot,
  PaperPlaneTilt,
  X,
  ChatCircleDots,
  Sparkle,
  User,
  ArrowClockwise,
  Trash,
  Copy,
  Check,
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIChatProps {
  isOpen?: boolean;
  onClose?: () => void;
  variant?: 'floating' | 'panel' | 'fullscreen';
  className?: string;
}

export function AIChat({ isOpen = true, onClose, variant = 'floating', className }: AIChatProps) {
  const t = useTranslations('ai');
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input when opened
  React.useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Create placeholder for assistant message
    const assistantId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      {
        id: assistantId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      },
    ]);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to send message');
      }

      const data = await response.json();

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, content: data.response } : m
        )
      );
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: t('error') || 'Sorry, something went wrong. Please try again.' }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const copyMessage = async (content: string, id: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const containerClasses = cn(
    'flex flex-col bg-card border border-border rounded-2xl shadow-2xl overflow-hidden',
    {
      'fixed bottom-4 right-4 w-[400px] h-[600px] z-50': variant === 'floating',
      'w-full h-full': variant === 'panel',
      'fixed inset-0 z-50': variant === 'fullscreen',
    },
    className
  );

  if (!isOpen && variant === 'floating') return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className={containerClasses}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Robot className="h-5 w-5" weight="duotone" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">{t('title') || 'EVE AI Assistant'}</h3>
              <p className="text-xs text-muted-foreground">
                {isLoading ? (t('thinking') || 'Thinking...') : (t('online') || 'Online')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg"
              onClick={clearChat}
              disabled={messages.length === 0}
            >
              <Trash className="h-4 w-4" />
            </Button>
            {onClose && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <Sparkle className="h-8 w-8 text-primary" weight="duotone" />
              </div>
              <h4 className="font-semibold mb-2">{t('welcome') || 'Welcome to EVE AI'}</h4>
              <p className="text-sm text-muted-foreground mb-6">
                {t('welcomeMessage') || 'I\'m here to help with your insurance agency needs. Ask me anything!'}
              </p>
              <div className="grid gap-2 w-full max-w-xs">
                {[
                  t('suggestion1') || 'What policies are expiring soon?',
                  t('suggestion2') || 'How do I file a claim?',
                  t('suggestion3') || 'Show me today\'s appointments',
                ].map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setInput(suggestion)}
                    className="text-left text-sm px-3 py-2 rounded-lg border border-border hover:bg-accent transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    'flex gap-3',
                    message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  )}
                >
                  <div
                    className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {message.role === 'user' ? (
                      <User className="h-4 w-4" weight="bold" />
                    ) : (
                      <Robot className="h-4 w-4" weight="duotone" />
                    )}
                  </div>
                  <div
                    className={cn(
                      'group relative max-w-[80%] rounded-2xl px-4 py-3',
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    )}
                  >
                    <div className="text-sm whitespace-pre-wrap">
                      {message.content || (
                        <span className="flex items-center gap-2">
                          <ArrowClockwise className="h-4 w-4 animate-spin" />
                          {t('thinking') || 'Thinking...'}
                        </span>
                      )}
                    </div>
                    {message.role === 'assistant' && message.content && (
                      <button
                        onClick={() => copyMessage(message.content, message.id)}
                        className="absolute -bottom-6 right-0 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                      >
                        {copiedId === message.id ? (
                          <>
                            <Check className="h-3 w-3" />
                            {t('copied') || 'Copied'}
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            {t('copy') || 'Copy'}
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t border-border bg-muted/20">
          <div className="flex gap-2">
            <Textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('placeholder') || 'Type your message...'}
              className="min-h-[44px] max-h-[120px] resize-none rounded-xl bg-background"
              rows={1}
              disabled={isLoading}
            />
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              size="icon"
              className="h-11 w-11 rounded-xl shrink-0"
            >
              <PaperPlaneTilt className="h-5 w-5" weight="fill" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">
            {t('disclaimer') || 'AI responses may not always be accurate. Verify important information.'}
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Floating chat button to toggle chat
interface AIChatButtonProps {
  onClick: () => void;
  isOpen?: boolean;
}

export function AIChatButton({ onClick, isOpen = false }: AIChatButtonProps) {
  const t = useTranslations('ai');

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        'fixed bottom-4 right-4 z-40 flex items-center gap-2 rounded-full px-4 py-3 shadow-lg transition-all',
        isOpen
          ? 'bg-muted text-muted-foreground'
          : 'bg-primary text-primary-foreground hover:bg-primary/90'
      )}
    >
      <ChatCircleDots className="h-5 w-5" weight="fill" />
      <span className="text-sm font-medium">{isOpen ? (t('close') || 'Close') : (t('askAI') || 'Ask EVE AI')}</span>
    </motion.button>
  );
}

// Combined component with button and chat panel
export function AIChatWidget() {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      <AIChatButton onClick={() => setIsOpen(!isOpen)} isOpen={isOpen} />
      <AIChat
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        variant="floating"
      />
    </>
  );
}

export default AIChat;
