// app/admin/analytics/page.tsx
'use client';

import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';
import { ArrowLeft, Calendar, TrendingUp, Filter, Users, XCircle } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [rawBookings, setRawBookings] = useState<any[]>([]);
  const [timeFilter, setTimeFilter] = useState('30');

  useEffect(() => {
    const fetchRawData = async () => {
      setLoading(true);
      // Fetches data from your bookings table
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select('id, final_amount, status, created_at');

      if (error) console.error(error);
      else setRawBookings(bookings || []);
      setLoading(false);
    };
    fetchRawData();
  }, []);

  const { revenueData, statusData, summary } = useMemo(() => {
    if (!rawBookings.length) return { revenueData: [], statusData: [], summary: { total: 0, count: 0, customers: 0, cancelled: 0 } };

    const now = new Date();
    now.setHours(23, 59, 59, 999);
    let startDate = new Date();
    
    if (timeFilter === 'all') {
      const earliest = rawBookings.reduce((min, b) => b.created_at < min ? b.created_at : min, rawBookings[0].created_at);
      startDate = new Date(earliest);
    } else {
      startDate.setDate(now.getDate() - parseInt(timeFilter) + 1);
    }
    startDate.setHours(0, 0, 0, 0);

    const filtered = rawBookings.filter(b => new Date(b.created_at) >= startDate);
    const confirmed = filtered.filter(b => b.status === 'confirmed');
    const cancelled = filtered.filter(b => b.status === 'cancelled');

    // Generate Timeline for Revenue
    const chartData = [];
    const revenueMap: Record<string, number> = {};
    confirmed.forEach(b => {
      const dKey = new Date(b.created_at).toISOString().split('T')[0];
      revenueMap[dKey] = (revenueMap[dKey] || 0) + (Number(b.final_amount) || 0);
    });

    const iter = new Date(startDate);
    while (iter <= now) {
      const dKey = iter.toISOString().split('T')[0];
      chartData.push({
        date: iter.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
        revenue: revenueMap[dKey] || 0 
      });
      iter.setDate(iter.getDate() + 1);
    }

    // Status Pie Data
    const statusCounts: Record<string, number> = {};
    filtered.forEach(b => {
      const s = b.status || 'pending';
      statusCounts[s] = (statusCounts[s] || 0) + 1;
    });
    
    const pieData = Object.keys(statusCounts).map(s => ({
      name: s.charAt(0).toUpperCase() + s.slice(1),
      value: statusCounts[s]
    }));

    return { 
      revenueData: chartData, 
      statusData: pieData, 
      summary: { 
        total: confirmed.reduce((sum, b) => sum + (Number(b.final_amount) || 0), 0), 
        count: confirmed.length,
        customers: confirmed.length,
        cancelled: cancelled.length 
      } 
    };
  }, [rawBookings, timeFilter]);

  const STATUS_COLORS: Record<string, string> = {
    'Confirmed': '#10B981',
    'Pending': '#3B82F6',
    'Cancelled': '#EF4444',
  };

  return (
    <div className="space-y-8 p-4 md:p-8 max-w-7xl mx-auto min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/dashboard" className="p-2 bg-white rounded-full border border-slate-200 hover:bg-slate-50 transition shadow-sm">
            <ArrowLeft size={20} className="text-slate-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-[#0A2540] tracking-tight">Financial Analytics</h1>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Revenue performance overview</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
          <Filter size={14} className="text-slate-400" />
          <select value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)} className="bg-transparent text-xs font-black text-slate-700 outline-none uppercase tracking-tighter">
            <option value="7">Past Week</option>
            <option value="30">Past Month</option>
            <option value="90">Past Quarter</option>
            <option value="all">Lifetime</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Earnings" val={`₹${summary.total.toLocaleString()}`} color="text-emerald-600" bg="bg-emerald-50" icon={TrendingUp} />
        <StatCard label="Confirmed" val={summary.count} color="text-blue-600" bg="bg-blue-50" icon={Users} />
        <StatCard label="Cancelled" val={summary.cancelled} color="text-red-600" bg="bg-red-50" icon={XCircle} />
        <StatCard label="Gross Volume" val={summary.count + summary.cancelled} color="text-slate-600" bg="bg-slate-100" icon={Calendar} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-sm font-black text-[#0A2540] uppercase tracking-widest mb-8">Revenue Growth</h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} tickFormatter={(v) => `₹${v}`} />
                <RechartsTooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                <Area type="monotone" dataKey="revenue" stroke="#10B981" fillOpacity={1} fill="url(#colorRev)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-sm font-black text-[#0A2540] uppercase tracking-widest mb-8">Status Mix</h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} innerRadius={80} outerRadius={110} paddingAngle={8} dataKey="value">
                  {statusData.map((entry, i) => (
                    <Cell key={i} fill={STATUS_COLORS[entry.name] || '#CBD5E1'} stroke="none" />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend iconType="circle" verticalAlign="bottom" wrapperStyle={{ paddingTop: '20px', fontWeight: 700, fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, val, color, bg, icon: Icon }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <h4 className="text-2xl font-black text-slate-800">{val}</h4>
      </div>
      <div className={`p-3 rounded-xl ${bg} ${color}`}><Icon size={20} /></div>
    </div>
  );
}