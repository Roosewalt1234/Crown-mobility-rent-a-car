import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  BookOpen, 
  CheckCircle2, 
  XCircle,
  Tag,
  MessageCircle,
  ChevronRight,
  AlertCircle,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  Loader2,
  Save,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

interface KBEntry {
  id: string;
  question: string;
  answer: string;
  category: string;
  keywords: string[];
  is_active: boolean;
  created_at: string;
}

interface LearningSuggestion {
  id: string;
  chat_id: string;
  question: string;
  answer: string;
  category: string;
  keywords: string[];
  confidence: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export const KnowledgeBasePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'kb' | 'learning'>('kb');
  const [entries, setEntries] = useState<KBEntry[]>([]);
  const [suggestions, setSuggestions] = useState<LearningSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<KBEntry | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'General',
    keywords: ''
  });

  const categories = ['All', 'Policy', 'Requirements', 'Pricing', 'Fleet', 'Support', 'General'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [kbRes, suggestionsRes] = await Promise.all([
        fetch('/api/knowledge-base'),
        fetch('/api/learning-suggestions')
      ]);
      
      if (kbRes.ok) {
        const data = await kbRes.json();
        setEntries(data);
      }
      
      if (suggestionsRes.ok) {
        const data = await suggestionsRes.json();
        setSuggestions(data);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      toast.error('Failed to load knowledge base data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      keywords: formData.keywords.split(',').map(k => k.trim()).filter(k => k)
    };

    try {
      const url = editingEntry ? `/api/knowledge-base/${editingEntry.id}` : '/api/knowledge-base';
      const method = editingEntry ? 'PATCH' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success(editingEntry ? 'Entry updated' : 'Entry added');
        setIsAddModalOpen(false);
        setEditingEntry(null);
        setFormData({ question: '', answer: '', category: 'General', keywords: '' });
        fetchData();
      }
    } catch (err) {
      toast.error('Failed to save entry');
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;
    try {
      const res = await fetch(`/api/knowledge-base/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Entry deleted');
        fetchData();
      }
    } catch (err) {
      toast.error('Failed to delete entry');
    }
  };

  const handleApproveSuggestion = async (id: string) => {
    try {
      const res = await fetch(`/api/learning-suggestions/${id}/approve`, { method: 'POST' });
      if (res.ok) {
        toast.success('Suggestion approved and added to Knowledge Base');
        fetchData();
      }
    } catch (err) {
      toast.error('Failed to approve suggestion');
    }
  };

  const handleRejectSuggestion = async (id: string) => {
    try {
      const res = await fetch(`/api/learning-suggestions/${id}/reject`, { method: 'POST' });
      if (res.ok) {
        toast.success('Suggestion rejected');
        fetchData();
      }
    } catch (err) {
      toast.error('Failed to reject suggestion');
    }
  };

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         entry.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || entry.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const stats = [
    { label: 'Total Entries', value: entries.length, icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Pending Review', value: suggestions.length, icon: Sparkles, color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: 'Categories', value: new Set(entries.map(e => e.category)).size, icon: Tag, color: 'text-purple-500', bg: 'bg-purple-50' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">AI Knowledge & Learning</h1>
          <p className="text-slate-500">Manage what Sophie knows and review her new learning suggestions.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              setEditingEntry(null);
              setFormData({ question: '', answer: '', category: 'General', keywords: '' });
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-[#2e7d32] text-white rounded-2xl font-bold hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#2e7d32]/20"
          >
            <Plus size={20} />
            Add Entry
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">{stat.label}</p>
              <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-slate-100 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('kb')}
          className={`px-8 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === 'kb' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <BookOpen size={18} />
          Knowledge Base
        </button>
        <button
          onClick={() => setActiveTab('learning')}
          className={`px-8 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 relative ${
            activeTab === 'learning' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Sparkles size={18} />
          Learning Review
          {suggestions.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white font-bold">
              {suggestions.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'kb' ? (
        <div className="space-y-6">
          {/* Filters & Search */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#2e7d32] transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search questions or answers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-[#2e7d32]/50 focus:ring-4 focus:ring-[#2e7d32]/5 transition-all shadow-sm"
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-6 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                    selectedCategory === cat 
                      ? 'bg-slate-900 text-white shadow-md' 
                      : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Entries Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {loading ? (
                <div className="col-span-full py-20 flex flex-col items-center justify-center gap-4">
                  <Loader2 className="animate-spin text-[#2e7d32]" size={40} />
                  <p className="text-slate-500 font-medium">Loading Knowledge Base...</p>
                </div>
              ) : filteredEntries.map((entry) => (
                <motion.div
                  layout
                  key={entry.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-widest">
                      {entry.category}
                    </span>
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${entry.is_active ? 'bg-green-500' : 'bg-slate-300'}`} />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {entry.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-bold text-slate-900 leading-tight group-hover:text-[#2e7d32] transition-colors">
                      {entry.question}
                    </h4>
                    <p className="text-sm text-slate-500 line-clamp-3 leading-relaxed">
                      {entry.answer}
                    </p>
                    
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {entry.keywords?.map((kw, i) => (
                        <span key={i} className="text-[10px] font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                          #{kw}
                        </span>
                      ))}
                    </div>

                    <div className="pt-4 border-t border-slate-50 flex justify-between items-center">
                      <span className="text-[10px] text-slate-300 font-medium">
                        Added {new Date(entry.created_at).toLocaleDateString()}
                      </span>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => {
                            setEditingEntry(entry);
                            setFormData({
                              question: entry.question,
                              answer: entry.answer,
                              category: entry.category,
                              keywords: entry.keywords?.join(', ') || ''
                            });
                            setIsAddModalOpen(true);
                          }}
                          className="p-2 text-slate-400 hover:text-blue-500 transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteEntry(entry.id)}
                          className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {!loading && filteredEntries.length === 0 && (
              <div className="col-span-full py-20 text-center space-y-4">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
                  <AlertCircle size={32} />
                </div>
                <p className="text-slate-500">No entries found matching your criteria.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-amber-50 border border-amber-200 p-6 rounded-3xl flex gap-4 items-start">
            <div className="p-3 bg-amber-100 rounded-2xl text-amber-600">
              <Sparkles size={24} />
            </div>
            <div>
              <h3 className="font-bold text-amber-900">AI Learning Review</h3>
              <p className="text-amber-700 text-sm leading-relaxed">
                Sophie has analyzed manual chat interactions and suggested these new knowledge base entries. 
                Approve them to help her handle these questions automatically in the future.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <AnimatePresence mode="popLayout">
              {suggestions.length === 0 ? (
                <div className="py-20 text-center space-y-4 bg-white rounded-[2rem] border border-slate-100">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
                    <CheckCircle2 size={32} />
                  </div>
                  <p className="text-slate-500 font-medium">No pending suggestions. Sophie is all caught up!</p>
                </div>
              ) : suggestions.map((suggestion) => (
                <motion.div
                  key={suggestion.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex flex-col lg:flex-row gap-8">
                    <div className="flex-1 space-y-6">
                      <div className="flex items-center gap-3">
                        <span className="px-4 py-1.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                          <Sparkles size={12} />
                          AI Suggestion
                        </span>
                        <span className="px-4 py-1.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-widest">
                          {suggestion.category}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          Confidence: {Math.round(suggestion.confidence * 100)}%
                        </span>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Question</label>
                          <h4 className="text-lg font-bold text-slate-900 leading-tight">
                            {suggestion.question}
                          </h4>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Suggested Answer</label>
                          <p className="text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            {suggestion.answer}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {suggestion.keywords?.map((kw, i) => (
                          <span key={i} className="text-[10px] font-medium text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200">
                            #{kw}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="lg:w-48 flex lg:flex-col gap-3 justify-center">
                      <button 
                        onClick={() => handleApproveSuggestion(suggestion.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-[#2e7d32] text-white rounded-2xl font-bold hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#2e7d32]/20"
                      >
                        <ThumbsUp size={18} />
                        Approve
                      </button>
                      <button 
                        onClick={() => handleRejectSuggestion(suggestion.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-white text-slate-500 border border-slate-200 rounded-2xl font-bold hover:bg-slate-50 transition-all"
                      >
                        <ThumbsDown size={18} />
                        Reject
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{editingEntry ? 'Edit Entry' : 'Add New Entry'}</h2>
                  <p className="text-slate-500 text-sm">Define a new Q&A pair for Sophie.</p>
                </div>
                <button 
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-2 hover:bg-white rounded-xl transition-colors text-slate-400 hover:text-slate-600 shadow-sm"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveEntry} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Question</label>
                  <input 
                    required
                    type="text"
                    value={formData.question}
                    onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                    placeholder="e.g., What is the security deposit?"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:border-[#2e7d32]/50 focus:ring-4 focus:ring-[#2e7d32]/5 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Answer</label>
                  <textarea 
                    required
                    rows={4}
                    value={formData.answer}
                    onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                    placeholder="Provide the detailed answer Sophie should give..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:border-[#2e7d32]/50 focus:ring-4 focus:ring-[#2e7d32]/5 transition-all resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Category</label>
                    <select 
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:border-[#2e7d32]/50 focus:ring-4 focus:ring-[#2e7d32]/5 transition-all appearance-none"
                    >
                      {categories.filter(c => c !== 'All').map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Keywords (comma separated)</label>
                    <input 
                      type="text"
                      value={formData.keywords}
                      onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                      placeholder="e.g., deposit, payment, refund"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:border-[#2e7d32]/50 focus:ring-4 focus:ring-[#2e7d32]/5 transition-all"
                    />
                  </div>
                </div>

                <div className="pt-6 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-6 py-4 bg-[#2e7d32] text-white rounded-2xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-[#2e7d32]/20 flex items-center justify-center gap-2"
                  >
                    <Save size={20} />
                    {editingEntry ? 'Update Entry' : 'Save Entry'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
