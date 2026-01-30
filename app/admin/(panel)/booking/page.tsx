'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import {
  Search, Trash2, Loader2, 
  IndianRupee, Phone, Mail, 
  ChevronDown, Calendar, Clock,
  XCircle, CheckCircle2, Archive, History, Timer
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
  slot_start_time: string | null;
  slot_end_time: string | null;
}

export default function AdminBookings() {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'active' | 'cancelled' | 'archive'>('active');

  useEffect(() => {
    fetchBookings();
  }, []);

  /* ---------- UPDATED FETCH WITH CREATED_AT SORT ---------- */
  const fetchBookings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      // Primary sort by the time the booking was MADE
      .order('created_at', { ascending: false });
    
    if (data) setBookings(data as Booking[]);
    if (error) console.error("Fetch Error:", error.message);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: Booking['status']) => {
    setBookings(prev => prev.map(x => x.id === id ? { ...x, status } : x));
    const { error } = await supabase.from('bookings').update({ status }).eq('id', id);
    if (error) {
      alert("Failed to update status");
      fetchBookings(); 
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Permanently delete this record?")) return;
    setBookings(prev => prev.filter(b => b.id !== id));
    const { error } = await supabase.from('bookings').delete().eq('id', id);
    if (error) {
      alert("Error deleting record");
      fetchBookings();
    }
  };

  /* ---------- FILTERING LOGIC ---------- */
  const now = new Date();
  const localToday = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .split('T')[0];

  const filteredBookings = bookings.filter(b => {
    const matchesSearch = 
      b.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      b.customer_phone.includes(searchTerm);
    
    const isPast = b.booking_date < localToday;

    let matchesView = false;
    if (viewMode === 'archive') {
      matchesView = isPast;
    } else if (viewMode === 'cancelled') {
      matchesView = !isPast && b.status === 'cancelled';
    } else {
      matchesView = !isPast && (b.status === 'pending' || b.status === 'confirmed');
    }

    return matchesSearch && matchesView;
  });

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-slate-900" size={40} />
    </div>
  );

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen space-y-8 max-w-7xl mx-auto">
      
      {/* HEADER & TOGGLE */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Reservations</h1>
          <p className="text-slate-500 font-medium text-sm">Review current, past, and cancelled bookings</p>
        </div>

        <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm w-full lg:w-auto overflow-x-auto">
          {[
            { id: 'active', label: 'Active', icon: <Clock size={14}/> },
            { id: 'archive', label: 'Archive', icon: <Archive size={14}/> },
            { id: 'cancelled', label: 'Cancelled', icon: <XCircle size={14}/> },
          ].map((mode) => (
            <button 
              key={mode.id}
              onClick={() => setViewMode(mode.id as any)}
              className={`flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                viewMode === mode.id 
                  ? (mode.id === 'cancelled' ? 'bg-red-600 text-white shadow-md' : 'bg-[#0A2540] text-white shadow-md')
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {mode.icon}
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {/* SEARCH BAR */}
        <div className="relative">
          <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
          <input 
            placeholder="Search by client name or phone..." 
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
                  <th className="p-5 text-[10px] font-black uppercase tracking-widest">Client / Contact</th>
                  <th className="p-5 text-[10px] font-black uppercase tracking-widest">Service & Time</th>
                  <th className="p-5 text-[10px] font-black uppercase tracking-widest">Pricing</th>
                  <th className="p-5 text-[10px] font-black uppercase tracking-widest">Status</th>
                  <th className="p-5 text-[10px] font-black uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBookings.map((b) => (
                  <tr key={b.id} className={`hover:bg-slate-50 transition-colors ${viewMode !== 'active' && 'opacity-80'}`}>
                    <td className="p-5">
                      <div className="font-black text-slate-800 uppercase tracking-tighter text-lg">{b.customer_name}</div>
                      <div className="flex flex-col gap-1 mt-1">
                        <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5"><Mail size={12}/> {b.customer_email}</span>
                        <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5"><Phone size={12}/> {b.customer_phone}</span>
                        <span className="text-[9px] text-indigo-400 font-bold uppercase tracking-widest flex items-center gap-1.5 mt-1">
                          <History size={10}/> Booked: {new Date(b.created_at).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                        </span>
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="text-sm font-bold text-slate-700">{b.service_title}</div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-[10px] font-black flex items-center gap-1">
                           <Calendar size={10}/> {new Date(b.booking_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                        </span>
                        <span className="bg-indigo-50 text-indigo-600 px-2 py-1 rounded text-[10px] font-black flex items-center gap-1">
                           <Clock size={10}/> {b.slot_start_time?.slice(0, 5)} - {b.slot_end_time?.slice(0, 5)}
                        </span>
                        <span className="bg-amber-50 text-amber-600 px-2 py-1 rounded text-[10px] font-black flex items-center gap-1">
                           <Timer size={10}/> {b.duration_minutes} MIN
                        </span>
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="text-lg font-black text-slate-800 flex items-center gap-0.5">
                        <IndianRupee size={16} strokeWidth={3} />
                        {b.final_amount}
                      </div>
                      <div className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-tighter">
                        {b.payment_method} {b.coupon_code && `· ${b.coupon_code}`}
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="relative inline-block w-full min-w-[120px]">
                        <select 
                          // disabled={viewMode === 'archive'}
                          className={`w-full appearance-none text-[10px] font-black pl-3 pr-8 py-2.5 rounded-lg border-0 outline-none cursor-pointer transition-colors shadow-sm disabled:cursor-not-allowed ${
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
                        <ChevronDown className="absolute right-2 top-3 pointer-events-none text-current opacity-50" size={12} />
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
                    <History size={32} className="text-slate-300" />
                </div>
                <p className="text-slate-400 font-black uppercase text-xs tracking-[0.2em]">No records in {viewMode} list</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}