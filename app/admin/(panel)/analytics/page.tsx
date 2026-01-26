// app/admin/analytics/page.tsx
'use client';

import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';
import { ArrowLeft, Calendar, TrendingUp, Filter, Users, XCircle } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar
} from 'recharts';

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [rawBookings, setRawBookings] = useState<any[]>([]);
  const [timeFilter, setTimeFilter] = useState('30');

  useEffect(() => {
    const fetchRawData = async () => {
      setLoading(true);
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select('id, final_amount, status, created_at')
        .order('created_at', { ascending: true });

      if (error) console.error("Supabase Error:", error);
      else setRawBookings(bookings || []);
      setLoading(false);
    };
    fetchRawData();
  }, []);

  const { chartData, statusData, summary } = useMemo(() => {
    if (!rawBookings.length) {
      return { 
        chartData: [], 
        statusData: [], 
        summary: { total: 0, count: 0, customers: 0, cancelled: 0, pending: 0 } 
      };
    }

    const now = new Date();
    let startDate = new Date();
    
    if (timeFilter === 'all') {
      startDate = new Date(Math.min(...rawBookings.map(b => new Date(b.created_at).getTime())));
    } else {
      startDate.setDate(now.getDate() - parseInt(timeFilter));
    }
    startDate.setHours(0, 0, 0, 0);

    const filtered = rawBookings.filter(b => new Date(b.created_at) >= startDate);
    
    const statsMap: Record<string, { revenue: number, confirmed: number, pending: number, cancelled: number }> = {};
    
    filtered.forEach(b => {
      // Force date to local ISO string (YYYY-MM-DD) to ensure matching
      const dateObj = new Date(b.created_at);
      const dKey = dateObj.toLocaleDateString('en-CA'); // en-CA gives YYYY-MM-DD
      
      if (!statsMap[dKey]) statsMap[dKey] = { revenue: 0, confirmed: 0, pending: 0, cancelled: 0 };
      
      const status = b.status?.toLowerCase() || 'pending';
      if (status === 'confirmed') {
        statsMap[dKey].revenue += (Number(b.final_amount) || 0);
        statsMap[dKey].confirmed += 1;
      } else if (status === 'pending') {
        statsMap[dKey].pending += 1;
      } else if (status === 'cancelled') {
        statsMap[dKey].cancelled += 1;
      }
    });

    const timelineData = [];
    const iter = new Date(startDate);
    const end = new Date(now);

    while (iter <= end) {
      const dKey = iter.toLocaleDateString('en-CA');
      const dayStats = statsMap[dKey] || { revenue: 0, confirmed: 0, pending: 0, cancelled: 0 };
      
      timelineData.push({
        date: iter.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
        revenue: dayStats.revenue,
        confirmed: dayStats.confirmed,
        pending: dayStats.pending,
        cancelled: dayStats.cancelled
      });
      iter.setDate(iter.getDate() + 1);
    }

    const statusCounts = filtered.reduce((acc: any, b) => {
      const s = b.status?.charAt(0).toUpperCase() + b.status?.slice(1) || 'Pending';
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {});

    const pieData = Object.keys(statusCounts).map(name => ({ name, value: statusCounts[name] }));

    return { 
      chartData: timelineData, 
      statusData: pieData, 
      summary: { 
        total: filtered.reduce((sum, b) => b.status === 'confirmed' ? sum + (Number(b.final_amount) || 0) : sum, 0), 
        count: filtered.filter(b => b.status === 'confirmed').length,
        cancelled: filtered.filter(b => b.status === 'cancelled').length,
        pending: filtered.filter(b => b.status === 'pending' || !b.status).length
      } 
    };
  }, [rawBookings, timeFilter]);

  const COLORS = { confirmed: '#10B981', pending: '#FBBF24', cancelled: '#EF4444', text: '#94a3b8' };

  if (loading) return <div className="p-8 text-center font-bold animate-pulse">Loading Analytics...</div>;

  return (
    <div className="space-y-8 p-4 md:p-8 max-w-7xl mx-auto min-h-screen bg-slate-50/30">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/dashboard" className="p-2 bg-white rounded-full border border-slate-200 hover:bg-slate-50 transition shadow-sm">
            <ArrowLeft size={20} className="text-slate-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-[#0A2540] tracking-tight">Financial Analytics</h1>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Performance overview</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
          <Filter size={14} className="text-slate-400" />
          <select value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)} className="bg-transparent text-xs text-slate-700 outline-none uppercase font-bold">
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
            <option value="365">Last 365 Days</option>
            <option value="all">Lifetime</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Earnings" val={`₹${summary.total.toLocaleString()}`} color="text-emerald-600" bg="bg-emerald-50" icon={TrendingUp} />
        <StatCard label="Confirmed" val={summary.count} color="text-blue-600" bg="bg-blue-50" icon={Users} />
        <StatCard label="Cancelled" val={summary.cancelled} color="text-red-600" bg="bg-red-50" icon={XCircle} />
        <StatCard label="Pending" val={summary.pending} color="text-amber-600" bg="bg-amber-50" icon={Calendar} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-sm font-black text-[#0A2540] uppercase tracking-widest mb-8">Revenue Growth (₹)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.confirmed} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={COLORS.confirmed} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: COLORS.text, fontSize: 10, fontWeight: 700}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: COLORS.text, fontSize: 10, fontWeight: 700}} tickFormatter={(v) => `₹${v}`} />
                <RechartsTooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                <Area type="monotone" dataKey="revenue" stroke={COLORS.confirmed} fillOpacity={1} fill="url(#colorRev)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-sm font-black text-[#0A2540] uppercase tracking-widest mb-8">Booking Volume</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: COLORS.text, fontSize: 10, fontWeight: 700}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: COLORS.text, fontSize: 10, fontWeight: 700}} />
                <RechartsTooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }} />
                <Bar dataKey="confirmed" stackId="bookings" fill={COLORS.confirmed} barSize={20} name="Confirmed" />
                <Bar dataKey="pending" stackId="bookings" fill={COLORS.pending} barSize={20} name="Pending" />
                <Bar dataKey="cancelled" fill={COLORS.cancelled} radius={[4, 4, 0, 0]} barSize={20} name="Cancelled" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm max-w-md">
        <h3 className="text-sm font-black text-[#0A2540] uppercase mb-8">Status Mix</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                innerRadius={70}
                outerRadius={90}
                paddingAngle={8}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
                labelLine={false}
              >
                {statusData.map((entry, i) => (
                  <Cell 
                    key={i} 
                    fill={entry.name === 'Confirmed' ? COLORS.confirmed : entry.name === 'Cancelled' ? COLORS.cancelled : COLORS.pending} 
                  />
                ))}
              </Pie>
              <Legend iconType="circle" verticalAlign="bottom" wrapperStyle={{ paddingTop: '20px', fontWeight: 700, fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
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