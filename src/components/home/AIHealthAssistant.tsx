
import React, { useState, useRef, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card-custom';
import { Button } from '@/components/ui/button-custom';
import { Input } from '@/components/ui/input';
import { Sparkles, Send, Bot, Loader2, ArrowDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const AIHealthAssistant = () => {
  const [query, setQuery] = useState('');
  const [conversation, setConversation] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = useCallback(async () => {
    if (!query.trim() || isLoading || !user) return;
    
    const userMessage = query.trim();
    setConversation(prev => [...prev, { role: 'user', content: userMessage }]);
    setQuery('');
    setIsLoading(true);
    
    try {
      // If not expanded, expand the card when sending first message
      if (!expanded && conversation.length === 0) {
        setExpanded(true);
      }
      
      // Send the query to our Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('analyze-health-data', {
        body: { 
          query: userMessage,
          userId: user.id  // Include user ID to fetch their data
        },
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (data && data.response) {
        setConversation(prev => [...prev, { role: 'assistant', content: data.response }]);
      } else {
        throw new Error('No response received from the assistant');
      }
    } catch (error: any) {
      console.error('Error getting AI response:', error);
      toast({
        title: 'Error',
        description: `Failed to get assistant response: ${error.message}`,
        variant: 'destructive',
      });
      setConversation(prev => [
        ...prev, 
        { 
          role: 'assistant', 
          content: 'Sorry, I encountered an error while processing your request. Please try again later.' 
        }
      ]);
    } finally {
      setIsLoading(false);
      // Scroll to the bottom after state updates
      setTimeout(scrollToBottom, 100);
    }
  }, [query, conversation.length, expanded, isLoading, user, toast]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className="overflow-hidden border border-purple-200/50 dark:border-purple-900/50 shadow-sm dark:shadow-purple-900/10">
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-4 px-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-medium">AI Health Assistant</h3>
              <p className="text-xs text-muted-foreground">Personalized nutrition advice</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setExpanded(!expanded)}
            aria-label={expanded ? "Collapse" : "Expand"}
          >
            <ArrowDown className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </Button>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div 
                className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3 mb-3 max-h-60 overflow-y-auto"
                style={{ minHeight: conversation.length > 0 ? '150px' : '60px' }}
              >
                {conversation.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground py-2">
                    <Sparkles className="h-5 w-5 mb-1 text-purple-500" />
                    <p className="text-xs">Ask me about your nutrition, workouts, or health goals</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {conversation.map((message, index) => (
                      <div 
                        key={index}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div 
                          className={`rounded-lg px-3 py-2 max-w-[85%] text-sm
                            ${message.role === 'user' 
                              ? 'bg-purple-600 text-white ml-4' 
                              : 'bg-white dark:bg-slate-800 mr-4 border border-slate-200 dark:border-slate-700'
                            }`}
                        >
                          {message.content}
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="Ask a health question..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                  disabled={isLoading || !user}
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!query.trim() || isLoading || !user}
                  className="shrink-0 bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              {!user && (
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Please log in to use the AI Health Assistant.
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default AIHealthAssistant;
