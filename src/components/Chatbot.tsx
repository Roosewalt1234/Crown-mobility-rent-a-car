import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Mic, MicOff, Volume2, VolumeX, Bot, Headset, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { chatWithAI, generateSpeech } from '../services/geminiService';
import { fleetService } from '../services/fleetService';
import { Message } from '../types';
import ReactMarkdown from 'react-markdown';

export const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [fleetData, setFleetData] = useState<any[]>([]);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "Hi! This is Sophie from Crescent Mobility Rent A Car in Dubai. 🚗 Please let us know which car you are looking for and for how many days. All car details are in our WhatsApp catalog — you can also select from there. 😊" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [chatId, setChatId] = useState<string>('');
  const [isHumanTakeover, setIsHumanTakeover] = useState(false);
  const [lastInputWasVoice, setLastInputWasVoice] = useState(false);
  const [language, setLanguage] = useState('English');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let id = localStorage.getItem('crescent_chat_id_v3');
    if (!id) {
      id = 'user_' + Math.random().toString(36).substring(2, 11) + '@c.us';
      localStorage.setItem('crescent_chat_id_v3', id);
    }
    setChatId(id);

    // Initial fetch of history and fleet data
    const fetchData = async () => {
      try {
        // Fetch history
        const res = await fetch(`/api/messages/${id}`);
        const data = await res.json();
        if (data.length > 0) {
          setMessages(data.map((m: any) => ({
            role: m.direction === 'incoming' ? 'user' : 'model',
            text: m.body
          })));
        }

        // Fetch fleet data for AI context
        const fleet = await fleetService.getFleetForAI();
        setFleetData(fleet);
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };

    const checkTakeover = async () => {
      try {
        const res = await fetch('/api/contacts');
        const contacts = await res.json();
        const contact = contacts.find((c: any) => c.chat_id === id);
        if (contact) {
          setIsHumanTakeover(contact.human_takeover);
          // If takeover is active, we should also fetch latest messages to see human replies
          if (contact.human_takeover) {
            fetchData();
          }
        }
      } catch (err) {
        console.error('Error checking takeover:', err);
      }
    };

    fetchData();
    const interval = setInterval(checkTakeover, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleOpenChat = (e: any) => {
      setIsOpen(true);
      if (e.detail && e.detail.message) {
        // Small delay to ensure state is ready and UI is open
        setTimeout(() => {
          handleSendRef.current(e.detail.message);
        }, 300);
      }
    };

    window.addEventListener('open_chatbot', handleOpenChat);
    return () => window.removeEventListener('open_chatbot', handleOpenChat);
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Speech Recognition Setup
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
        setLastInputWasVoice(true);
        handleSendRef.current(transcript, true);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const playBase64Audio = (base64: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    const audio = new Audio(`data:audio/mp3;base64,${base64}`);
    audioRef.current = audio;
    audio.onplay = () => setIsSpeaking(true);
    audio.onended = () => setIsSpeaking(false);
    audio.play();
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setIsListening(true);
      recognitionRef.current?.start();
    }
  };

  const handleSend = async (textOverride?: string, isVoice: boolean = false) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim() || isLoading) return;

    // If it's a manual send (not via voice recognition callback), set voice flag to false
    if (!textOverride) {
      setLastInputWasVoice(false);
    }

    // Ensure we have a chatId before sending
    let currentChatId = chatId;
    if (!currentChatId) {
      currentChatId = localStorage.getItem('crescent_chat_id_v3') || '';
      if (!currentChatId) {
        console.error('Chat ID missing, cannot send message');
        return;
      }
      setChatId(currentChatId);
    }

    const userMessage: Message = { role: 'user', text: textToSend };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    // Save user message to DB
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: currentChatId,
          body: textToSend,
          direction: 'incoming',
          is_ai_reply: false,
          contact_name: 'Web User',
          contact_phone: 'Web'
        })
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to save user message:', errorData);
      }
    } catch (err) {
      console.error('Error saving user message:', err);
    }

    // If human takeover is active, don't trigger AI
    if (isHumanTakeover) {
      setIsLoading(false);
      return;
    }

    const aiResponse = await chatWithAI(newMessages, fleetData, language);
    const modelMessage: Message = { role: 'model', text: aiResponse.text };
    setMessages(prev => [...prev, modelMessage]);
    setIsLoading(false);

    // Save AI message to DB
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: currentChatId,
          body: aiResponse.text,
          direction: 'outgoing',
          is_ai_reply: true,
          contact_name: 'Web User',
          contact_phone: 'Web'
        })
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to save AI message:', errorData);
      }
    } catch (err) {
      console.error('Error saving AI message:', err);
    }

    // Only speak if user used voice input
    if (isVoice && autoSpeak) {
      const audioBase64 = await generateSpeech(aiResponse.text, language);
      if (audioBase64) {
        playBase64Audio(audioBase64);
      }
    }

    if (aiResponse.escalated) {
      console.log("Escalation triggered:", aiResponse.escalationArgs);
      // Optionally update contact status to escalated
      await fetch(`/api/contacts/${chatId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'escalated' })
      });
    }
  };

  const handleSendRef = useRef(handleSend);
  useEffect(() => {
    handleSendRef.current = handleSend;
  }, [handleSend]);

  return (
    <div className="fixed bottom-6 right-6 z-[60]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute bottom-20 right-0 w-[350px] sm:w-[400px] h-[550px] bg-[#111] border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-black to-[#1a1a1a] border-b border-white/10 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#D4AF37] flex items-center justify-center bg-[#D4AF37]/10">
                  <img 
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100" 
                    alt="Sophie"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h3 className="text-white font-serif text-sm font-bold">Sophie</h3>
                  <p className="text-[10px] text-[#D4AF37] uppercase tracking-widest">Crescent Concierge</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setAutoSpeak(!autoSpeak)}
                  className={`p-2 rounded-full transition-colors ${autoSpeak ? 'text-[#D4AF37] bg-[#D4AF37]/10' : 'text-white/40'}`}
                >
                  {autoSpeak ? <Volume2 size={18} /> : <VolumeX size={18} />}
                </button>
                <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white p-2">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Language Selector */}
            <div className="px-6 py-2 bg-white/5 border-b border-white/10 flex items-center gap-3 overflow-x-auto scrollbar-hide">
              <Globe size={14} className="text-[#D4AF37] shrink-0" />
              <div className="flex gap-2">
                {['English', 'Arabic', 'Russian', 'Hindi'].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={`text-[10px] px-3 py-1 rounded-full transition-all whitespace-nowrap ${
                      language === lang 
                        ? 'bg-[#D4AF37] text-black font-bold' 
                        : 'bg-white/5 text-white/60 hover:text-white'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] p-4 rounded-2xl text-sm ${
                    msg.role === 'user' 
                      ? 'bg-[#D4AF37] text-black rounded-tr-none font-medium' 
                      : 'bg-white/5 text-white/90 border border-white/10 rounded-tl-none'
                  }`}>
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/5 p-4 rounded-2xl rounded-tl-none border border-white/10 flex gap-1">
                    <span className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-6 border-t border-white/10 bg-black/50 backdrop-blur-md">
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl p-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask about our fleet..."
                  className="flex-1 bg-transparent text-white text-sm outline-none px-2"
                />
                <div className="flex items-center gap-1">
                  <button 
                    onClick={toggleListening}
                    className={`p-2 rounded-xl transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-white/40 hover:text-[#D4AF37]'}`}
                  >
                    {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                  </button>
                  <button 
                    onClick={() => handleSend()}
                    disabled={!input.trim() || isLoading}
                    className="p-2 bg-[#D4AF37] text-black rounded-xl disabled:opacity-50 disabled:grayscale transition-all active:scale-95"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-[#D4AF37] rounded-full flex items-center justify-center shadow-2xl shadow-[#D4AF37]/20 relative group"
      >
        {isOpen ? <X className="text-black" /> : <Headset className="text-black" />}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-black" />
        )}
        <div className="absolute right-20 bg-black/80 backdrop-blur-md text-white text-xs px-4 py-2 rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Chat with Sophie
        </div>
      </motion.button>
    </div>
  );
};
