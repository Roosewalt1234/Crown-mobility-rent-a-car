import React, { useState } from 'react';
import { 
  Users, 
  Shield, 
  Activity, 
  Plus, 
  MoreVertical, 
  Mail, 
  Calendar, 
  Lock,
  UserPlus,
  Trash2,
  Edit2,
  Search,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { motion } from 'motion/react';

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: 'admin' | 'staff';
  created_at: string;
  last_login: string;
  status: 'active' | 'inactive';
}

const MOCK_USERS: UserProfile[] = [
  { id: '1', full_name: 'Admin User', email: 'admin@crescent.com', role: 'admin', created_at: '2024-01-01', last_login: '2024-03-16 09:00', status: 'active' },
  { id: '2', full_name: 'Staff Member', email: 'staff@crescent.com', role: 'staff', created_at: '2024-02-15', last_login: '2024-03-15 17:30', status: 'active' },
];

export const AdminPage: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>(MOCK_USERS);
  const [searchQuery, setSearchQuery] = useState('');

  const stats = [
    { label: 'Total Users', value: users.length, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Admins', value: users.filter(u => u.role === 'admin').length, icon: Shield, color: 'text-[#2e7d32]', bg: 'bg-green-50' },
    { label: 'Active Now', value: 1, icon: Activity, color: 'text-orange-500', bg: 'bg-orange-50' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Admin Panel</h1>
          <p className="text-slate-500">Manage users and system permissions.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-[#2e7d32] text-white rounded-2xl font-bold hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#2e7d32]/20">
          <UserPlus size={20} />
          Invite User
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

      {/* User Management Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h3 className="text-xl font-bold text-slate-900">User Management</h3>
          <div className="relative w-full md:w-72 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#2e7d32] transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2.5 pl-12 pr-4 text-sm focus:outline-none focus:border-[#2e7d32]/50 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">User</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Role</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Last Login</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
                        {user.full_name[0]}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{user.full_name}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                      user.role === 'admin' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${user.status === 'active' ? 'bg-green-500' : 'bg-slate-300'}`} />
                      <span className="text-xs font-medium text-slate-600 capitalize">{user.status}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-xs text-slate-500 font-medium">{user.last_login}</p>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-slate-400 hover:text-[#2e7d32] transition-colors">
                        <Edit2 size={16} />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* System Logs / Activity */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900">System Activity</h3>
          <button className="text-xs font-bold text-[#2e7d32] hover:underline">View All Logs</button>
        </div>
        <div className="space-y-4">
          {[
            { action: 'AI Reply Sent', detail: 'to Ahmed Hassan (+971 50...)', time: '2 mins ago', icon: Activity },
            { action: 'New Contact Added', detail: 'Sarah Miller (+971 52...)', time: '1 hour ago', icon: UserPlus },
            { action: 'Settings Updated', detail: 'by Admin User', time: '3 hours ago', icon: Lock },
          ].map((log, i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50/50 border border-slate-50">
              <div className="p-2 rounded-xl bg-white text-slate-400 shadow-sm">
                <log.icon size={18} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-900">{log.action}</p>
                <p className="text-xs text-slate-500">{log.detail}</p>
              </div>
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{log.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
