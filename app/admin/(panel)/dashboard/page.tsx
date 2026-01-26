'use client';

import { useEffect, useState } from 'react';
import { 
  Calendar, TrendingUp, AlertCircle, LogOut, Loader2, 
  Users, CheckCircle2, Clock, ArrowUpRight, Plus 
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';

import { logoutAction } from '@/app/actions/auth'; // Ensure this path is correct

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({
    totalBookings: 0,
    todayBookings: 0,
    totalRevenue: 0,
    pendingActions: 0,
    confirmedRate: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];

    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !bookings) {
      setLoading(false);
      return;
    }

    // Process Metrics
    const active = bookings.filter(b => b.status !== 'cancelled');
    const confirmed = bookings.filter(b => b.status === 'confirmed');
    
    setMetrics({
      totalBookings: active.length,
      todayBookings: bookings.filter(b => b.booking_date === today).length,
      totalRevenue: confirmed.reduce((sum, b) => sum + Number(b.final_amount ?? 0), 0),
      pendingActions: bookings.filter(b => b.status === 'pending').length,
      confirmedRate: Math.round((confirmed.length / active.length) * 100) || 0,
    });

    setRecentBookings(bookings.slice(0, 5));
    setLoading(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 space-y-8 max-w-7xl mx-auto font-sans">
      
      {/* Header Section */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Overview</h1>
          <p className="text-slate-500 font-medium flex items-center gap-2">
            Welcome back, Chief. <span className="w-1 h-1 bg-slate-300 rounded-full"/> {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
          </p>
        </div>
{/* Updated Logout Form */}
<form action={logoutAction}>
          <button 
            type="submit"
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-red-600 font-bold rounded-xl hover:bg-red-50 transition-all shadow-sm active:scale-95"
          >
            <LogOut size={18} />
            Logout
          </button>
        </form>
      </header>

      {/* Primary Metrics Grid */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
  {[
    { 
      label: 'Confirmed Revenue', 
      val: formatCurrency(metrics.totalRevenue), 
      icon: TrendingUp, 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-50',
      href: '/admin/analytics' // Added navigation target
    },
    // { label: 'Total active', val: metrics.totalBookings, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Today\'s Confirmed Bookings', val: metrics.todayBookings, icon: Calendar, color: 'text-indigo-600', bg: 'bg-indigo-50', href: '/admin/booking'},
    { label: 'Pending Approval', val: metrics.pendingActions, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', href: '/admin/booking' },
  ].map((stat, i) => {
    const CardContent = (
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-3 h-full hover:border-indigo-200 transition-colors">
        <div className={`w-12 h-12 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
          <stat.icon size={24} />
        </div>
        <div>
          <p className="text-slate-400 text-xs font-black uppercase tracking-widest">{stat.label}</p>
          <h4 className="text-2xl font-black text-slate-800">{loading ? '...' : stat.val}</h4>
        </div>
      </div>
    );

    return stat.href ? (
      <Link key={i} href={stat.href}>
        {CardContent}
      </Link>
    ) : (
      <div key={i}>{CardContent}</div>
    );
  })}
</div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Activity Feed */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center">
            <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">Recent Reservations</h3>
            <Link href="/admin/booking" className="text-indigo-600 text-xs font-bold hover:underline">View All</Link>
          </div>
          <div className="divide-y divide-slate-50">
            {recentBookings.map((b) => (
              <div key={b.id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${b.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {b.customer_name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-800">{b.customer_name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">{b.service_title} • {b.booking_date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-slate-800">₹{b.final_amount}</p>
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${b.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                    {b.status}
                  </span>
                </div>
              </div>
            ))}
            {recentBookings.length === 0 && !loading && (
              <div className="p-10 text-center text-slate-400 font-medium">No recent bookings</div>
            )}
          </div>
        </div>

        {/* Action Center */}
        <div className="space-y-6">
          <div className="bg-[#0A2540] p-6 rounded-3xl text-white space-y-4 shadow-xl shadow-blue-900/20">
            <h3 className="font-black uppercase text-xs tracking-widest opacity-60">Control Center</h3>
            <div className="grid gap-3">
              <Link href="/admin/services" className="flex items-center justify-between p-4 bg-white/10 rounded-2xl hover:bg-white/20 transition-all border border-white/5 group">
                <span className="font-bold text-sm">New Service</span>
                <Plus size={18} className="group-hover:rotate-90 transition-transform" />
              </Link>
              <Link href="/admin/bookings" className="flex items-center justify-between p-4 bg-white/10 rounded-2xl hover:bg-white/20 transition-all border border-white/5 group">
                <span className="font-bold text-sm">Manage Schedule</span>
                <Calendar size={18} />
              </Link>
              <Link href="/admin/content" className="flex items-center justify-between p-4 bg-white/10 rounded-2xl hover:bg-white/20 transition-all border border-white/5 group">
                <span className="font-bold text-sm">Gallery Upload</span>
                <ArrowUpRight size={18} />
              </Link>
            </div>
          </div>

          <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-3xl space-y-2">
            <div className="flex items-center gap-2 text-indigo-700">
              <CheckCircle2 size={18}/>
              <span className="text-sm font-black uppercase">Efficiency</span>
            </div>
            <p className="text-2xl font-black text-indigo-900">{metrics.confirmedRate}%</p>
            <p className="text-xs text-indigo-600/70 font-medium">Of your active bookings are confirmed. Keep it up!</p>
          </div>
        </div>

      </div>
    </div>
  );
}