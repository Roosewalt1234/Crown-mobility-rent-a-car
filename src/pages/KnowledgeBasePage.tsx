import React, { useState } from 'react';
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
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface KBEntry {
  id: string;
  question: string;
  answer: string;
  category: string;
  keywords: string[];
  is_active: boolean;
  created_at: string;
}

const MOCK_KB: KBEntry[] = [
  { id: '1', question: 'How much is the advance / deposit?', answer: 'AED 3000.00 Sir, which will be returned within 3 working days of returning the car.', category: 'Pricing', keywords: ['advance', 'deposit', 'payment'], is_active: true, created_at: new Date().toISOString() },
  { id: '2', question: 'What is your cancellation policy?', answer: 'Free cancellation up to 24 hours before your pickup time. If cancelled within 24 hours, a 1-day charge applies.', category: 'Policy', keywords: ['cancellation', 'cancel', 'refund'], is_active: true, created_at: new Date().toISOString() },
  { id: '3', question: 'Which cars do you have?', answer: 'We have the Jetour T2, Honda Civic, Ford Mustang Convertible and many more! You can also view our catalogue for more information.', category: 'Fleet', keywords: ['fleet', 'cars', 'available'], is_active: true, created_at: new Date().toISOString() },
  { id: '4', question: 'Where are you located?', answer: 'We are located in Business Bay, Downtown Dubai. 📍 However, please note that our office is currently closed due to the situation. We are handling all bookings digitally and providing delivery!', category: 'Support', keywords: ['location', 'address', 'pickup'], is_active: true, created_at: new Date().toISOString() },
  { id: '5', question: 'What documents do I need? (UAE Resident)', answer: 'For UAE residents, we\'ll need: Emirates ID and a Valid UAE Driving Licence.', category: 'Requirements', keywords: ['documents', 'resident', 'id'], is_active: true, created_at: new Date().toISOString() },
];

export const KnowledgeBasePage: React.FC = () => {
  const [entries, setEntries] = useState<KBEntry[]>(MOCK_KB);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const categories = ['All', 'Policy', 'Requirements', 'Pricing', 'Fleet', 'Support'];

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         entry.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || entry.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const stats = [
    { label: 'Total Entries', value: entries.length, icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Active Bot', value: entries.filter(e => e.is_active).length, icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50' },
    { label: 'Categories', value: new Set(entries.map(e => e.category)).size, icon: Tag, color: 'text-purple-500', bg: 'bg-purple-50' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Knowledge Base</h1>
          <p className="text-slate-500">Manage Q&A pairs for your AI auto-reply bot.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-[#2e7d32] text-white rounded-2xl font-bold hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#2e7d32]/20"
        >
          <Plus size={20} />
          Add Entry
        </button>
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
          {filteredEntries.map((entry) => (
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
                  {entry.keywords.map((kw, i) => (
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
                    <button className="p-2 text-slate-400 hover:text-blue-500 transition-colors">
                      <Edit2 size={16} />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredEntries.length === 0 && (
          <div className="col-span-full py-20 text-center space-y-4">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
              <AlertCircle size={32} />
            </div>
            <p className="text-slate-500">No entries found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};
