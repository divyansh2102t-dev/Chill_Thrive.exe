'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import {
  Search, Trash2, Loader2, 
  IndianRupee, Phone, Mail, 
  ChevronDown, Calendar, Clock, TrendingUp,
  XCircle, CheckCircle2
} from 'lucide-react';

/* ---------- TYPES ---------- */

interface Booking {
  id: string;
  created_at: string;
  service_id: string;
  service_title: string;
  booking_date: string;
  slot_id: string;
  duration_minutes: number;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  payment_method: 'QR' | 'CASH';
  final_amount: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  coupon_code?: string;
  slot_timings: {
    start_time: string;
    end_time: string;
  } | null;
}

export default function AdminBookings() {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'active' | 'cancelled'>('active');

  /* ---------- FETCH DATA ---------- */
  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        slot_timings (
          start_time,
          end_time
        )
      `)
      .order('booking_date', { ascending: false });
    
    if (data) setBookings(data as unknown as Booking[]);
    if (error) console.error("Fetch Error:", error.message);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: Booking['status']) => {
    // REQUIREMENT: No longer auto-deleting. Just updating the record.
    setBookings(prev => prev.map(x => x.id === id ? { ...x, status } : x));
    const { error } = await supabase.from('bookings').update({ status }).eq('id', id);
    if (error) {
      alert("Failed to update status");
      fetchBookings(); 
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Permanently delete this record from history?");
    if (!confirmed) return;

    setBookings(prev => prev.filter(b => b.id !== id));
    const { error } = await supabase.from('bookings').delete().eq('id', id);
    if (error) {
      alert("Error deleting record");
      fetchBookings();
    }
  };

  /* ---------- CALCULATIONS ---------- */
  const stats = {
    revenue: bookings.filter(b => b.status === 'confirmed').reduce((acc, curr) => acc + curr.final_amount, 0),
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    pending: bookings.filter(b => b.status === 'pending').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length
  };

  const filteredBookings = bookings.filter(b => {
    const matchesSearch = 
      b.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      b.customer_phone.includes(searchTerm);
    
    // REQUIREMENT: Filter based on toggle mode
    const matchesView = viewMode === 'active' 
      ? (b.status === 'pending' || b.status === 'confirmed')
      : b.status === 'cancelled';

    return matchesSearch && matchesView;
  });

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-slate-900" size={40} />
    </div>
  );

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen space-y-8 max-w-7xl mx-auto">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Reservations</h1>
          <p className="text-slate-500 font-medium text-sm">Review and manage your booking history</p>
        </div>

        {/* REQUIREMENT: VIEW TOGGLE BUTTON */}
        <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
          <button 
            onClick={() => setViewMode('active')}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              viewMode === 'active' ? 'bg-[#0A2540] text-white shadow-md' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Active
          </button>
          <button 
            onClick={() => setViewMode('cancelled')}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              viewMode === 'cancelled' ? 'bg-red-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Cancelled
          </button>
        </div>
      </div>

      {/* STATS RIBBON */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          // { label: 'Total Revenue', value: `₹${stats.revenue.toLocaleString()}`, icon: <TrendingUp className="text-emerald-600" />, bg: 'bg-emerald-50' },
          { label: 'Confirmed Requests', value: stats.confirmed, icon: <Clock className="text-amber-600" />, bg: 'bg-emerald-50' },
          { label: 'Pending Requests', value: stats.pending, icon: <Clock className="text-amber-600" />, bg: 'bg-amber-50' },
          { label: 'Cancelled count', value: stats.cancelled, icon: <XCircle className="text-red-600" />, bg: 'bg-red-50' }
        ].map((stat, i) => (
          <div key={i} className={`${stat.bg} p-6 rounded-2xl border border-white shadow-sm flex items-center justify-between`}>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
              <h3 className="text-2xl font-black text-slate-800">{stat.value}</h3>
            </div>
            <div className="p-3 bg-white rounded-xl shadow-sm">{stat.icon}</div>
          </div>
        ))}
      </div>

      <div className="space-y-6">
        {/* SEARCH BAR */}
        <div className="relative">
          <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
          <input 
            placeholder="Search by customer name or phone..." 
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900 transition-all shadow-sm font-medium"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-900 text-white">
                  <th className="p-5 text-[10px] font-black uppercase tracking-widest">Client</th>
                  <th className="p-5 text-[10px] font-black uppercase tracking-widest">Service Details</th>
                  <th className="p-5 text-[10px] font-black uppercase tracking-widest">Payment</th>
                  <th className="p-5 text-[10px] font-black uppercase tracking-widest">Status</th>
                  <th className="p-5 text-[10px] font-black uppercase tracking-widest text-right">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBookings.map((b) => (
                  <tr key={b.id} className={`hover:bg-slate-50 transition-colors ${viewMode === 'cancelled' && 'opacity-75'}`}>
                    <td className="p-5">
                      <div className="font-black text-slate-800 uppercase tracking-tighter">{b.customer_name}</div>
                      <div className="flex flex-col gap-1 mt-1 font-medium">
                        <span className="text-xs text-slate-400 flex items-center gap-1.5"><Mail size={12}/> {b.customer_email}</span>
                        <span className="text-xs text-slate-400 flex items-center gap-1.5"><Phone size={12}/> {b.customer_phone}</span>
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="text-sm font-bold text-slate-700">{b.service_title}</div>
                      <div className="text-[10px] text-indigo-500 font-black mt-1 uppercase tracking-tighter">
                        {new Date(b.booking_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                      <div className="text-[10px] text-slate-500 font-bold mt-1 flex items-center gap-1">
                        <Clock size={10} className="text-slate-400" />
                        {b.slot_timings ? `${b.slot_timings.start_time.slice(0, 5)} - ${b.slot_timings.end_time.slice(0, 5)}` : 'N/A'}
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="text-sm font-black text-slate-800 flex items-center gap-0.5">
                        <IndianRupee size={14} strokeWidth={3} />
                        {b.final_amount}
                      </div>
                      <div className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-tighter">
                        {b.payment_method} {b.coupon_code && `· ${b.coupon_code}`}
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="relative inline-block w-full">
                        <select 
                          className={`w-full appearance-none text-[10px] font-black pl-3 pr-8 py-2 rounded-lg border-0 outline-none cursor-pointer transition-colors shadow-sm ${
                            b.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : 
                            b.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                          }`}
                          value={b.status}
                          onChange={e => updateStatus(b.id, e.target.value as any)}
                        >
                          <option value="pending">PENDING</option>
                          <option value="confirmed">CONFIRMED</option>
                          <option value="cancelled">CANCELLED</option>
                        </select>
                        <ChevronDown className={`absolute right-2 top-2.5 pointer-events-none ${
                           b.status === 'confirmed' ? 'text-emerald-500' : 
                           b.status === 'pending' ? 'text-amber-500' : 'text-red-500'
                        }`} size={12} />
                      </div>
                    </td>
                    <td className="p-5 text-right">
                      <button 
                        onClick={() => handleDelete(b.id)}
                        className="p-2.5 hover:bg-red-50 text-red-400 hover:text-red-600 rounded-xl transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredBookings.length === 0 && (
            <div className="p-24 text-center">
                <div className="inline-flex p-4 bg-slate-50 rounded-full mb-4">
                    <Calendar size={32} className="text-slate-300" />
                </div>
                <p className="text-slate-400 font-black uppercase text-xs tracking-[0.2em]">No {viewMode} reservations found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}