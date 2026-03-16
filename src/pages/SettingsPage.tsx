import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Globe, 
  Key, 
  MessageSquare, 
  Shield, 
  Bell, 
  Database,
  Save,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

export const SettingsPage: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [config, setConfig] = useState({
    wahaUrl: 'https://api.waha.example.com',
    wahaKey: '••••••••••••••••',
    sessionName: 'default',
    escalationId: '971507172790@c.us',
    autoReply: true,
    notifications: true
  });

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    toast.success('Settings saved successfully');
  };

  const webhookUrl = `https://your-project.supabase.co/functions/v1/waha-webhook?tenant_id=default`;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
          <p className="text-slate-500">Configure your WhatsApp monitoring and AI bot settings.</p>
        </div>
        <button 
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-3 bg-[#2e7d32] text-white rounded-2xl font-bold hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#2e7d32]/20"
        >
          <Save size={20} />
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* WAHA Configuration */}
        <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-green-50 text-[#2e7d32]">
              <Globe size={20} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">WAHA Configuration</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">API URL</label>
              <input 
                type="text" 
                value={config.wahaUrl}
                onChange={(e) => setConfig({...config, wahaUrl: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm focus:outline-none focus:border-[#2e7d32]/50 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">API Key</label>
              <div className="relative">
                <input 
                  type="password" 
                  value={config.wahaKey}
                  onChange={(e) => setConfig({...config, wahaKey: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm focus:outline-none focus:border-[#2e7d32]/50 transition-all"
                />
                <Key className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
              </div>
            </div>
          </div>
        </section>

        {/* Chatbot Configuration */}
        <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <MessageSquare size={20} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Chatbot Settings</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Session Name</label>
              <input 
                type="text" 
                value={config.sessionName}
                onChange={(e) => setConfig({...config, sessionName: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm focus:outline-none focus:border-[#2e7d32]/50 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Escalation ID (WhatsApp ID)</label>
              <input 
                type="text" 
                value={config.escalationId}
                onChange={(e) => setConfig({...config, escalationId: e.target.value})}
                placeholder="e.g. 971507172790@c.us"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm focus:outline-none focus:border-[#2e7d32]/50 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-900">Auto-Reply Enabled</p>
              <p className="text-xs text-slate-500">Allow AI to automatically reply to incoming messages based on KB.</p>
            </div>
            <button 
              onClick={() => setConfig({...config, autoReply: !config.autoReply})}
              className={`w-12 h-6 rounded-full transition-all relative ${config.autoReply ? 'bg-[#2e7d32]' : 'bg-slate-300'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${config.autoReply ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
        </section>

        {/* Webhook Information */}
        <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-orange-50 text-orange-600">
              <Database size={20} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Webhook Integration</h3>
          </div>
          
          <div className="space-y-4">
            <p className="text-sm text-slate-500 leading-relaxed">
              Use this URL in your WAHA dashboard to receive real-time updates. Make sure to set the event type to <code className="bg-slate-100 px-1.5 py-0.5 rounded text-[#2e7d32] font-bold">message</code>.
            </p>
            <div className="flex items-center gap-2 p-4 bg-slate-900 rounded-2xl text-white font-mono text-xs overflow-x-auto group">
              <span className="flex-1 whitespace-nowrap opacity-70">{webhookUrl}</span>
              <button 
                onClick={() => handleCopy(webhookUrl)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-[#D4AF37]"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
          </div>
        </section>

        {/* Security & System */}
        <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-slate-50 text-slate-600">
              <Shield size={20} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">System Information</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-slate-50">
              <span className="text-sm text-slate-500">App Version</span>
              <span className="text-sm font-bold text-slate-900">v1.2.4-stable</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-slate-50">
              <span className="text-sm text-slate-500">Database Status</span>
              <span className="flex items-center gap-2 text-sm font-bold text-green-500">
                <CheckCircle size={14} />
                Connected
              </span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-sm text-slate-500">Last Synced</span>
              <span className="text-sm font-bold text-slate-900">2 minutes ago</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

const CheckCircle = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
);
