
import React, { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card-custom';
import { Button } from '@/components/ui/button-custom';
import { Mic, MicOff, Loader2, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const AIVoiceAssistant = () => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const { toast } = useToast();
  const { user } = useAuth();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Create audio element for playback
  if (!audioRef.current && typeof window !== 'undefined') {
    audioRef.current = new Audio();
    audioRef.current.onended = () => {
      setIsSpeaking(false);
    };
  }

  const startListening = async () => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to log in to use the voice assistant",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsListening(true);
      setTranscript('');
      setResponse('');
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // MediaRecorder setup
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks: BlobPart[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };
      
      mediaRecorder.onstop = async () => {
        setIsProcessing(true);
        setIsListening(false);
        
        try {
          // Create audio blob from recorded chunks
          const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
          
          // Convert to base64
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          
          reader.onloadend = async () => {
            const base64Audio = (reader.result as string)?.split(',')[1];
            
            if (!base64Audio) {
              throw new Error('Failed to convert audio to base64');
            }
            
            // Send to Supabase Edge Function for processing
            const { data, error } = await supabase.functions.invoke('voice-to-text', {
              body: { audio: base64Audio },
            });
            
            if (error) {
              throw error;
            }
            
            if (data?.text) {
              setTranscript(data.text);
              
              // Process with AI
              const aiResponse = await supabase.functions.invoke('analyze-health-data', {
                body: { 
                  query: data.text,
                  userId: user.id,
                  format: 'voice'
                },
              });
              
              if (aiResponse.error) {
                throw aiResponse.error;
              }
              
              const responseText = aiResponse.data?.response || 'Sorry, I could not understand that.';
              setResponse(responseText);
              
              // Generate speech from text
              await speakResponse(responseText);
            }
          };
        } catch (error: any) {
          console.error('Error processing voice:', error);
          toast({
            title: 'Error',
            description: error.message || 'Could not process your voice input',
            variant: 'destructive',
          });
        } finally {
          setIsProcessing(false);
          
          // Stop all audio tracks
          stream.getTracks().forEach(track => track.stop());
        }
      };
      
      // Start recording
      mediaRecorder.start();
      
      // Stop recording after 10 seconds or wait for stopListening
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
        }
      }, 10000);
      
    } catch (error: any) {
      console.error('Error accessing microphone:', error);
      setIsListening(false);
      toast({
        title: 'Microphone Access Denied',
        description: 'Please allow microphone access to use the voice assistant',
        variant: 'destructive',
      });
    }
  };
  
  const stopListening = () => {
    // This function will be triggered by the UI
    // The actual stopping logic is in the mediaRecorder.onstop handler
    setIsListening(false);
  };
  
  const speakResponse = async (text: string) => {
    try {
      setIsSpeaking(true);
      
      // Use text-to-speech edge function
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { 
          text,
          voice: 'alloy' // Using OpenAI's alloy voice
        },
      });
      
      if (error) {
        throw error;
      }
      
      if (data?.audioContent) {
        // Convert base64 to audio and play
        const audioSrc = `data:audio/mp3;base64,${data.audioContent}`;
        if (audioRef.current) {
          audioRef.current.src = audioSrc;
          audioRef.current.play();
        }
      } else {
        throw new Error('No audio received from text-to-speech service');
      }
    } catch (error: any) {
      console.error('Error with text-to-speech:', error);
      setIsSpeaking(false);
      toast({
        title: 'Text-to-Speech Error',
        description: error.message || 'Could not convert text to speech',
        variant: 'destructive',
      });
    }
  };
  
  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsSpeaking(false);
    }
  };
  
  return (
    <Card className="overflow-hidden border border-purple-200/50 dark:border-purple-900/50 shadow-sm dark:shadow-purple-900/10">
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-4 px-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
              <Volume2 className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-medium">AI Voice Assistant</h3>
              <p className="text-xs text-muted-foreground">Ask me anything about health</p>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4 mb-3 min-h-20">
          <AnimatePresence mode="wait">
            {!transcript && !response && !isListening && !isProcessing && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-full text-center"
              >
                <p className="text-sm text-muted-foreground">
                  Click the microphone to ask a question
                </p>
              </motion.div>
            )}
            
            {isListening && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center"
              >
                <div className="relative w-16 h-16 mb-2">
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="absolute inset-0 bg-purple-500/20 rounded-full"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Mic className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
                <p className="text-sm">Listening...</p>
              </motion.div>
            )}
            
            {isProcessing && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center"
              >
                <Loader2 className="h-8 w-8 text-purple-600 animate-spin mb-2" />
                <p className="text-sm">Processing your request...</p>
              </motion.div>
            )}
            
            {transcript && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-3"
              >
                <p className="text-xs font-medium text-muted-foreground mb-1">You said:</p>
                <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg text-sm">
                  {transcript}
                </div>
              </motion.div>
            )}
            
            {response && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p className="text-xs font-medium text-muted-foreground mb-1">Assistant:</p>
                <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg text-sm">
                  {response}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <div className="flex justify-center gap-3">
          {isSpeaking ? (
            <Button 
              onClick={stopSpeaking}
              size="sm"
              variant="destructive"
              className="rounded-full w-10 h-10 p-0"
            >
              <VolumeX className="h-5 w-5" />
            </Button>
          ) : (
            <>
              {!isListening && !isProcessing && (
                <Button 
                  onClick={startListening}
                  size="sm"
                  variant="default"
                  className="rounded-full w-10 h-10 p-0 bg-gradient-to-r from-pink-500 to-purple-600"
                  disabled={isProcessing}
                >
                  <Mic className="h-5 w-5" />
                </Button>
              )}
              
              {isListening && (
                <Button 
                  onClick={stopListening}
                  size="sm"
                  variant="secondary"
                  className="rounded-full w-10 h-10 p-0"
                >
                  <MicOff className="h-5 w-5" />
                </Button>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AIVoiceAssistant;
