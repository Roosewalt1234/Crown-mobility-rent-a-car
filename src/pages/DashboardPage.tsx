import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Bot, 
  Users, 
  UserPlus, 
  CheckCircle2, 
  HandMetal,
  TrendingUp,
  Clock,
  Loader2
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { motion } from 'motion/react';

const COLORS = ['#94a3b8', '#3b82f6', '#22c55e', '#f59e0b', '#ef4444'];

export const DashboardPage: React.FC = () => {
  const [period, setPeriod] = useState('This Week');
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/stats');
        if (res.ok) {
          const stats = await res.json();
          setData(stats);
        }
      } catch (err) {
        console.error('Error fetching stats:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#2e7d32]" />
      </div>
    );
  }

  const stats = [
    { label: 'Total Messages', value: data?.messages?.total?.toLocaleString() || '0', icon: MessageSquare, color: 'text-blue-500', bg: 'bg-blue-50', trend: '+12%' },
    { label: 'Incoming', value: data?.messages?.incoming?.toLocaleString() || '0', icon: ArrowDownLeft, color: 'text-green-500', bg: 'bg-green-50', trend: '+8%' },
    { label: 'Outgoing', value: data?.messages?.outgoing?.toLocaleString() || '0', icon: ArrowUpRight, color: 'text-purple-500', bg: 'bg-purple-50', trend: '+15%' },
    { label: 'AI Replies', value: data?.messages?.ai?.toLocaleString() || '0', icon: Bot, color: 'text-indigo-500', bg: 'bg-indigo-50', trend: `${Math.round((data?.messages?.ai / (data?.messages?.outgoing || 1)) * 100)}%`, isBadge: true },
  ];

  const contactStats = [
    { label: 'Total Contacts', value: data?.contacts?.total?.toLocaleString() || '0', icon: Users, color: 'text-slate-500', bg: 'bg-slate-50' },
    { label: 'New (24h)', value: data?.contacts?.new_24h?.toLocaleString() || '0', icon: UserPlus, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'Converted', value: data?.contacts?.converted?.toLocaleString() || '0', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Human Takeovers', value: data?.contacts?.human_takeover?.toLocaleString() || '0', icon: HandMetal, color: 'text-orange-500', bg: 'bg-orange-50' },
  ];

  const pieData = data?.pieData?.map((item: any, index: number) => ({
    ...item,
    color: COLORS[index % COLORS.length]
  })) || [];

  const donutData = data?.donutData?.map((item: any) => ({
    ...item,
    color: item.name === 'AI Replies' ? '#8b5cf6' : '#10b981'
  })) || [];

  const aiRate = Math.round((data?.messages?.ai / (data?.messages?.outgoing || 1)) * 100);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500">Welcome back to Crescent Mobility WA Monitor.</p>
        </div>
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
          {['Today', 'This Week', 'This Month', 'All Time'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                period === p ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              {stat.isBadge ? (
                <span className="px-2 py-1 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase tracking-wider">
                  {stat.trend} AI Rate
                </span>
              ) : (
                <span className="flex items-center gap-1 text-green-600 text-xs font-bold">
                  <TrendingUp size={12} />
                  {stat.trend}
                </span>
              )}
            </div>
            <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {contactStats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (i + 4) * 0.1 }}
            className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4"
          >
            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
              <stat.icon size={20} />
            </div>
            <div>
              <p className="text-slate-500 text-xs font-medium">{stat.label}</p>
              <h3 className="text-xl font-bold text-slate-900">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Message Volume */}
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-bold text-slate-900">Message Volume</h3>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#22c55e]" />
                <span className="text-slate-500">Incoming</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#3b82f6]" />
                <span className="text-slate-500">Outgoing</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#8b5cf6]" />
                <span className="text-slate-500">AI Reply</span>
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.barData || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="incoming" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="outgoing" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="ai" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI vs Human */}
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-8">AI vs Human Replies</h3>
          <div className="h-[300px] w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {donutData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-bold text-slate-900">{aiRate}%</span>
              <span className="text-xs text-slate-400 uppercase tracking-widest font-bold">AI Rate</span>
            </div>
          </div>
        </div>

        {/* New Contacts Line Chart */}
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-8">New Contacts Growth</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.barData || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="incoming" 
                  stroke="#10b981" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} 
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Contact Status Breakdown */}
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-8">Contact Status Breakdown</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label
                >
                  {pieData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
