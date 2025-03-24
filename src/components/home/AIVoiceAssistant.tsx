
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card-custom';
import { Button } from '@/components/ui/button-custom';
import { Mic, MicOff, Loader2, Volume2, VolumeX, AlertTriangle, Stethoscope, Ban } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const AIVoiceAssistant = () => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'assistant' | 'doctor'>('assistant');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Create audio element for playback
  useEffect(() => {
    if (!audioRef.current && typeof window !== 'undefined') {
      audioRef.current = new Audio();
      audioRef.current.onended = () => {
        setIsSpeaking(false);
      };
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  const resetState = () => {
    setError(null);
    setTranscript('');
    setResponse('');
  };

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
      resetState();
      setIsListening(true);
      
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
                  format: 'voice',
                  isHealthAdvisor: activeTab === 'doctor'
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
          setError(error.message || 'Could not process your voice input');
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
      
      // Stop recording after 8 seconds or wait for stopListening
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
        }
      }, 8000);
      
    } catch (error: any) {
      console.error('Error accessing microphone:', error);
      setIsListening(false);
      setError('Microphone access denied. Please allow microphone access in your browser settings.');
      toast({
        title: 'Microphone Access Denied',
        description: 'Please allow microphone access to use the voice assistant',
        variant: 'destructive',
      });
    }
  };
  
  const stopListening = () => {
    setIsListening(false);
  };
  
  const speakResponse = async (text: string) => {
    try {
      setIsSpeaking(true);
      
      // Use text-to-speech edge function with retries
      const maxRetries = 2;
      let retryCount = 0;
      let success = false;
      
      while (retryCount <= maxRetries && !success) {
        try {
          const { data, error } = await supabase.functions.invoke('text-to-speech', {
            body: { 
              text: text.substring(0, 4096), // Limit text length to prevent API issues
              voice: activeTab === 'doctor' ? 'nova' : 'alloy'
            },
          });
          
          if (error) {
            throw error;
          }
          
          if (!data?.audioContent) {
            throw new Error('No audio content received');
          }
          
          // Convert base64 to audio and play
          const audioSrc = `data:audio/mp3;base64,${data.audioContent}`;
          if (audioRef.current) {
            audioRef.current.src = audioSrc;
            await audioRef.current.play();
            success = true;
          }
        } catch (e) {
          retryCount++;
          console.error(`Text-to-speech attempt ${retryCount} failed:`, e);
          
          if (retryCount > maxRetries) {
            throw e;
          }
          
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    } catch (error: any) {
      console.error('Error with text-to-speech:', error);
      setIsSpeaking(false);
      setError('Could not convert text to speech. Please try again.');
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
  
  const retryVoiceAssistant = () => {
    resetState();
  };

  const generateHealthReport = async () => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to log in to use the AI Health Advisor",
        variant: "destructive",
      });
      return;
    }

    try {
      resetState();
      setIsGeneratingReport(true);
      
      // Process with AI
      const aiResponse = await supabase.functions.invoke('analyze-health-data', {
        body: { 
          query: "Please provide a comprehensive health assessment based on my data",
          userId: user.id,
          format: 'voice',
          isHealthAdvisor: true
        },
      });
      
      if (aiResponse.error) {
        throw aiResponse.error;
      }
      
      const responseText = aiResponse.data?.response || 'I apologize, but I could not generate a health report with the available data. Please try again later or ensure you have logged some health data.';
      setResponse(responseText);
      
      // Generate speech from text
      await speakResponse(responseText);
    } catch (error: any) {
      console.error('Error generating health report:', error);
      setError(error.message || 'Could not generate health report');
      toast({
        title: 'Error',
        description: error.message || 'Could not generate health report',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingReport(false);
    }
  };
  
  return (
    <Card className="overflow-hidden border border-purple-200/50 dark:border-purple-900/50 shadow-sm dark:shadow-purple-900/10">
      <CardContent className="p-3">
        <Tabs 
          value={activeTab} 
          onValueChange={(value) => setActiveTab(value as 'assistant' | 'doctor')}
          className="w-full"
        >
          <div className="flex items-center justify-between mb-4 px-1">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full ${activeTab === 'assistant' ? 'bg-gradient-to-br from-pink-500 to-purple-600' : 'bg-gradient-to-br from-blue-500 to-teal-600'} flex items-center justify-center`}>
                {activeTab === 'assistant' ? (
                  <Volume2 className="h-4 w-4 text-white" />
                ) : (
                  <Stethoscope className="h-4 w-4 text-white" />
                )}
              </div>
              <div>
                <h3 className="text-sm font-medium">
                  {activeTab === 'assistant' ? 'AI Voice Assistant' : 'AI Health Advisor'}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {activeTab === 'assistant' ? 'Ask me anything about health' : 'Get personalized health advice'}
                </p>
              </div>
            </div>
            
            <TabsList className="grid grid-cols-2 h-8">
              <TabsTrigger 
                value="assistant" 
                className="text-xs px-2"
              >
                Assistant
              </TabsTrigger>
              <TabsTrigger 
                value="doctor" 
                className="text-xs px-2"
              >
                Doctor
              </TabsTrigger>
            </TabsList>
          </div>
          
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4 mb-3 min-h-24 max-h-[280px] overflow-y-auto">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  key="error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center"
                >
                  <div className="bg-red-100 dark:bg-red-900/20 p-3 rounded-lg w-full text-center mb-2">
                    <AlertTriangle className="h-5 w-5 text-red-500 mx-auto mb-1" />
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  </div>
                  <Button 
                    onClick={retryVoiceAssistant}
                    size="sm"
                    variant="outline"
                    className="mt-2"
                  >
                    Try Again
                  </Button>
                </motion.div>
              )}
              
              <TabsContent value="assistant" className="mt-0 outline-none">
                {!error && !transcript && !response && !isListening && !isProcessing && (
                  <motion.div 
                    key="idle-assistant"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center h-full text-center"
                  >
                    <p className="text-sm text-muted-foreground">
                      Click the microphone to ask a health question
                    </p>
                  </motion.div>
                )}
              </TabsContent>
              
              <TabsContent value="doctor" className="mt-0 outline-none">
                {!error && !transcript && !response && !isGeneratingReport && !isListening && !isProcessing && (
                  <motion.div 
                    key="idle-doctor"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center h-full text-center"
                  >
                    <p className="text-sm text-muted-foreground mb-2">
                      Get a personalized health assessment based on your data
                    </p>
                    <Button
                      onClick={generateHealthReport}
                      size="sm"
                      variant="default"
                      className="bg-gradient-to-r from-blue-500 to-teal-600 hover:from-blue-600 hover:to-teal-700"
                      disabled={!user}
                    >
                      Generate Health Report
                    </Button>
                  </motion.div>
                )}
              </TabsContent>
              
              {isListening && (
                <motion.div 
                  key="listening"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center"
                >
                  <div className="relative w-16 h-16 mb-2">
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className={`absolute inset-0 ${activeTab === 'assistant' ? 'bg-purple-500/20' : 'bg-teal-500/20'} rounded-full`}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Mic className={`h-8 w-8 ${activeTab === 'assistant' ? 'text-purple-600' : 'text-teal-600'}`} />
                    </div>
                  </div>
                  <p className="text-sm">Listening...</p>
                </motion.div>
              )}
              
              {(isProcessing || isGeneratingReport) && (
                <motion.div 
                  key="processing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center"
                >
                  <Loader2 className={`h-8 w-8 ${activeTab === 'assistant' ? 'text-purple-600' : 'text-teal-600'} animate-spin mb-2`} />
                  <p className="text-sm">
                    {isGeneratingReport 
                      ? "Analyzing your health data..." 
                      : "Processing your request..."}
                  </p>
                </motion.div>
              )}
              
              {transcript && !error && (
                <motion.div 
                  key="transcript"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-3"
                >
                  <p className="text-xs font-medium text-muted-foreground mb-1">You said:</p>
                  <div className={`${activeTab === 'assistant' ? 'bg-purple-100 dark:bg-purple-900/30' : 'bg-teal-100 dark:bg-teal-900/30'} p-2 rounded-lg text-sm`}>
                    {transcript}
                  </div>
                </motion.div>
              )}
              
              {response && !error && (
                <motion.div 
                  key="response"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    {activeTab === 'assistant' ? 'Assistant:' : 'Health Advisor:'}
                  </p>
                  <div className={`${activeTab === 'assistant' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-emerald-100 dark:bg-emerald-900/30'} p-2 rounded-lg text-sm`}>
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
                {activeTab === 'assistant' && !isListening && !isProcessing && (
                  <Button 
                    onClick={startListening}
                    size="sm"
                    variant="default"
                    className="rounded-full w-10 h-10 p-0 bg-gradient-to-r from-pink-500 to-purple-600"
                    disabled={isProcessing || !user}
                  >
                    <Mic className="h-5 w-5" />
                  </Button>
                )}
                
                {activeTab === 'doctor' && !isListening && !isProcessing && !isGeneratingReport && (
                  <Button 
                    onClick={startListening}
                    size="sm"
                    variant="default"
                    className="rounded-full w-10 h-10 p-0 bg-gradient-to-r from-blue-500 to-teal-600"
                    disabled={isGeneratingReport || !user}
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
          
          {!user && (
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Please log in to use the AI {activeTab === 'assistant' ? 'Voice Assistant' : 'Health Advisor'}.
            </p>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AIVoiceAssistant;
