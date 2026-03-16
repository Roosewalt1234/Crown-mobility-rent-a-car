import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  MoreVertical, 
  Phone, 
  Video, 
  Send, 
  Bot, 
  User, 
  CheckCircle2, 
  Clock,
  ArrowLeft,
  HandMetal,
  ToggleLeft as Toggle,
  ToggleRight,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface Contact {
  id: string;
  chat_id: string;
  contact_name: string;
  contact_phone: string;
  last_message_preview: string;
  last_message_at: string;
  unread_count: number;
  status: 'new' | 'active' | 'converted';
  human_takeover: boolean;
}

interface Message {
  id: string;
  chat_id: string;
  body: string;
  direction: 'incoming' | 'outgoing';
  is_ai_reply: boolean;
  created_at: string;
  status: string;
}

const MOCK_CONTACTS: Contact[] = [
  { id: '1', chat_id: '123@c.us', contact_name: 'Ahmed Hassan', contact_phone: '+971 50 123 4567', last_message_preview: 'I want to rent the G63 for 3 days.', last_message_at: new Date().toISOString(), unread_count: 2, status: 'active', human_takeover: false },
  { id: '2', chat_id: '456@c.us', contact_name: 'Sarah Miller', contact_phone: '+971 52 987 6543', last_message_preview: 'Thank you for the information!', last_message_at: new Date(Date.now() - 3600000).toISOString(), unread_count: 0, status: 'converted', human_takeover: true },
  { id: '3', chat_id: '789@c.us', contact_name: 'John Doe', contact_phone: '+44 7700 900000', last_message_preview: 'What is the deposit for the Ferrari?', last_message_at: new Date(Date.now() - 86400000).toISOString(), unread_count: 0, status: 'new', human_takeover: false },
];

const MOCK_MESSAGES: Message[] = [
  { id: 'm1', chat_id: '123@c.us', body: 'Hello, I am interested in renting a car.', direction: 'incoming', is_ai_reply: false, created_at: new Date(Date.now() - 7200000).toISOString(), status: 'read' },
  { id: 'm2', chat_id: '123@c.us', body: 'Hello! Welcome to Crescent Mobility Rent A Car. Which car are you interested in?', direction: 'outgoing', is_ai_reply: true, created_at: new Date(Date.now() - 7100000).toISOString(), status: 'sent' },
  { id: 'm3', chat_id: '123@c.us', body: 'I want to rent the G63 for 3 days.', direction: 'incoming', is_ai_reply: false, created_at: new Date(Date.now() - 3600000).toISOString(), status: 'read' },
];

export const ChatsPage: React.FC = () => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchContacts = async () => {
    try {
      const res = await fetch('/api/contacts');
      const data = await res.json();
      setContacts(data);
    } catch (err) {
      console.error('Error fetching contacts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (chatId: string) => {
    try {
      const res = await fetch(`/api/messages/${chatId}`);
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  useEffect(() => {
    fetchContacts();
    const interval = setInterval(fetchContacts, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedContact) {
      fetchMessages(selectedContact.chat_id);
      const interval = setInterval(() => fetchMessages(selectedContact.chat_id), 3000);
      return () => clearInterval(interval);
    } else {
      setMessages([]);
    }
  }, [selectedContact?.chat_id]);

  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedContact) return;

    const body = {
      chat_id: selectedContact.chat_id,
      body: newMessage,
      direction: 'outgoing',
      is_ai_reply: false,
      contact_name: selectedContact.contact_name,
      contact_phone: selectedContact.contact_phone
    };

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      setMessages([...messages, data]);
      setNewMessage('');
      fetchContacts(); // Refresh list to update preview
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const toggleHumanTakeover = async (contactId: string, currentVal: boolean) => {
    try {
      const res = await fetch(`/api/contacts/${contactId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ human_takeover: !currentVal })
      });
      const updated = await res.json();
      setContacts(contacts.map(c => c.chat_id === contactId ? updated : c));
      if (selectedContact?.chat_id === contactId) {
        setSelectedContact(updated);
      }
    } catch (err) {
      console.error('Error toggling human takeover:', err);
    }
  };

  const filteredContacts = contacts.filter(c => 
    c.contact_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.contact_phone.includes(searchQuery)
  );

  return (
    <div className="h-[calc(100vh-120px)] flex bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
      {/* Left Panel: Contact List */}
      <AnimatePresence>
        {(!isMobileView || !selectedContact) && (
          <motion.div 
            initial={isMobileView ? { x: -300 } : false}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className={`w-full md:w-80 lg:w-96 border-r border-slate-100 flex flex-col bg-slate-50/30`}
          >
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900">Chats</h2>
                <div className="p-2 rounded-full bg-white border border-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer shadow-sm">
                  <MoreVertical size={20} />
                </div>
              </div>
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#2e7d32] transition-colors" size={18} />
                <input 
                  type="text" 
                  placeholder="Search contacts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-[#2e7d32]/50 focus:ring-4 focus:ring-[#2e7d32]/5 transition-all shadow-sm"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-3 space-y-1">
              {filteredContacts.map((contact) => (
                <button
                  key={contact.id}
                  onClick={() => setSelectedContact(contact)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 group ${
                    selectedContact?.id === contact.id 
                      ? 'bg-white shadow-md border border-slate-100' 
                      : 'hover:bg-white/50'
                  }`}
                >
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold overflow-hidden">
                      {contact.contact_name[0]}
                    </div>
                    {contact.status === 'converted' && (
                      <div className="absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full p-0.5 border-2 border-white">
                        <CheckCircle2 size={12} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <h4 className="font-bold text-slate-900 truncate">{contact.contact_name}</h4>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {new Date(contact.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate">{contact.last_message_preview}</p>
                  </div>
                  {contact.unread_count > 0 && (
                    <div className="w-5 h-5 bg-[#2e7d32] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg shadow-[#2e7d32]/20">
                      {contact.unread_count}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Right Panel: Chat Interface */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedContact ? (
          <>
            {/* Chat Header */}
            <header className="p-4 md:p-6 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-4">
                {isMobileView && (
                  <button onClick={() => setSelectedContact(null)} className="p-2 text-slate-400 hover:text-slate-600">
                    <ArrowLeft size={20} />
                  </button>
                )}
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
                  {selectedContact.contact_name[0]}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{selectedContact.contact_name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">{selectedContact.contact_phone}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${
                      selectedContact.status === 'converted' ? 'text-green-500' : 'text-blue-500'
                    }`}>
                      {selectedContact.status}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 md:gap-4">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">AI Bot</span>
                  <button 
                    onClick={() => toggleHumanTakeover(selectedContact.chat_id, selectedContact.human_takeover)}
                    className={`transition-colors ${selectedContact.human_takeover ? 'text-slate-300' : 'text-[#2e7d32]'}`}
                  >
                    {selectedContact.human_takeover ? <Toggle size={32} /> : <ToggleRight size={32} />}
                  </button>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Manual</span>
                </div>
                <button className="p-2 text-slate-400 hover:text-[#2e7d32] transition-colors">
                  <Phone size={20} />
                </button>
                <button className="p-2 text-slate-400 hover:text-[#2e7d32] transition-colors">
                  <Video size={20} />
                </button>
                <button className="p-2 text-slate-400 hover:text-slate-600">
                  <MoreVertical size={20} />
                </button>
              </div>
            </header>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
              {messages.map((msg, i) => {
                const isOutgoing = msg.direction === 'outgoing';
                return (
                  <motion.div 
                    key={msg.id}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={`flex ${isOutgoing ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] md:max-w-[70%] space-y-1`}>
                      <div className={`relative p-4 rounded-2xl shadow-sm ${
                        isOutgoing 
                          ? 'bg-[#2e7d32] text-white rounded-tr-none' 
                          : 'bg-white text-slate-900 border border-slate-100 rounded-tl-none'
                      }`}>
                        {msg.is_ai_reply && (
                          <div className="flex items-center gap-1.5 mb-2 text-[10px] font-bold uppercase tracking-widest opacity-70">
                            <Bot size={12} />
                            AI Assistant
                          </div>
                        )}
                        <p className="text-sm leading-relaxed">{msg.body}</p>
                      </div>
                      <div className={`flex items-center gap-2 text-[10px] text-slate-400 ${isOutgoing ? 'justify-end' : 'justify-start'}`}>
                        <Clock size={10} />
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {isOutgoing && <span className="text-[#2e7d32] font-bold">✓✓</span>}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply Bar */}
            <div className="p-4 md:p-6 border-t border-slate-100 bg-white">
              <form onSubmit={handleSendMessage} className="flex items-center gap-4 bg-slate-50 p-2 rounded-[2rem] border border-slate-200 focus-within:border-[#2e7d32]/30 focus-within:ring-4 focus-within:ring-[#2e7d32]/5 transition-all">
                <button type="button" className="p-3 text-slate-400 hover:text-slate-600 transition-colors">
                  <MoreVertical size={20} className="rotate-90" />
                </button>
                <input 
                  type="text" 
                  placeholder={selectedContact.human_takeover ? "Type a manual message..." : "AI is monitoring. Type to takeover..."}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 placeholder:text-slate-400"
                />
                <button 
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="p-3 bg-[#2e7d32] text-white rounded-full shadow-lg shadow-[#2e7d32]/20 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all"
                >
                  <Send size={20} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-6">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
              <MessageSquare size={48} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900">Select a conversation</h3>
              <p className="text-slate-500 max-w-xs">Choose a contact from the left to start monitoring or replying to messages.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
