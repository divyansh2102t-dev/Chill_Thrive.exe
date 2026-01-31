'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import {
  Search, Trash2, Loader2, 
  IndianRupee, Phone, Mail, 
  ChevronDown, Calendar, Clock,
  XCircle, Archive, History, Timer, 
  Wifi
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

  const fetchBookings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setBookings(data as Booking[]);
    if (error) console.error("Fetch Error:", error.message);
    setLoading(false);
  };

  useEffect(() => {
    fetchBookings();

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setBookings((prev) => [payload.new as Booking, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setBookings((prev) =>
              prev.map((b) => (b.id === payload.new.id ? (payload.new as Booking) : b))
            );
          } else if (payload.eventType === 'DELETE') {
            setBookings((prev) => prev.filter((b) => b.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const updateStatus = async (id: string, status: Booking['status']) => {
    const { error } = await supabase.from('bookings').update({ status }).eq('id', id);
    if (error) {
      alert("Failed to update status");
      fetchBookings(); 
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Permanently delete this record?")) return;
    const { error } = await supabase.from('bookings').delete().eq('id', id);
    if (error) {
      alert("Error deleting record");
      fetchBookings();
    }
  };

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
    if (viewMode === 'archive') matchesView = isPast;
    else if (viewMode === 'cancelled') matchesView = !isPast && b.status === 'cancelled';
    else matchesView = !isPast && (b.status === 'pending' || b.status === 'confirmed');

    return matchesSearch && matchesView;
  });

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-white">
      <Loader2 className="animate-spin text-slate-900" size={32} />
    </div>
  );

  return (
    <div className="p-4 md:p-6 bg-white min-h-screen space-y-6 max-w-7xl mx-auto">
      
      {/* HEADER & TOGGLE */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Reservations</h1>
            <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[9px] font-bold rounded border border-emerald-100">
              <Wifi size={10} /> LIVE
            </span>
          </div>
          <p className="text-slate-400 font-medium text-xs mt-1 uppercase tracking-wider">Management Portal</p>
        </div>

        <div className="flex bg-slate-50 p-1 rounded border border-slate-200 w-full lg:w-auto overflow-x-auto">
          {[
            { id: 'active', label: 'Active', icon: <Clock size={14}/> },
            { id: 'archive', label: 'Archive', icon: <Archive size={14}/> },
            { id: 'cancelled', label: 'Cancelled', icon: <XCircle size={14}/> },
          ].map((mode) => (
            <button 
              key={mode.id}
              onClick={() => setViewMode(mode.id as any)}
              className={`flex items-center gap-2 px-5 py-2 rounded text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                viewMode === mode.id 
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {mode.icon}
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {/* SEARCH BAR */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            placeholder="SEARCH BY CLIENT OR PHONE..." 
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded outline-none focus:border-slate-900 transition-all text-xs font-bold uppercase tracking-widest"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        {/* TABLE */}
        <div className="bg-white rounded border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Client / Contact</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Service Details</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Pricing</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Status</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBookings.map((b) => (
                  <tr key={b.id} className={`hover:bg-slate-50/50 transition-colors ${viewMode !== 'active' && 'opacity-75'}`}>
                    <td className="p-4">
                      <div className="font-black text-slate-800 uppercase tracking-tighter text-base">{b.customer_name}</div>
                      <div className="flex flex-col gap-0.5 mt-1">
                        <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1.5 uppercase tracking-wide"><Mail size={10}/> {b.customer_email}</span>
                        <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1.5 uppercase tracking-wide"><Phone size={10}/> {b.customer_phone}</span>
                        <span className="text-[9px] text-indigo-500 font-black uppercase tracking-widest flex items-center gap-1.5 mt-1">
                          <History size={10}/> {new Date(b.created_at).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-xs font-black text-slate-700 uppercase tracking-tight">{b.service_title}</div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        <span className="border border-slate-200 text-slate-500 px-2 py-0.5 rounded text-[9px] font-black flex items-center gap-1 uppercase">
                           <Calendar size={10}/> {new Date(b.booking_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                        </span>
                        <span className="bg-slate-900 text-white px-2 py-0.5 rounded text-[9px] font-black flex items-center gap-1 uppercase">
                           <Clock size={10}/> {b.slot_start_time?.slice(0, 5)} - {b.slot_end_time?.slice(0, 5)}
                        </span>
                        <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-[9px] font-black flex items-center gap-1 uppercase">
                           <Timer size={10}/> {b.duration_minutes} MIN
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-base font-black text-slate-800 flex items-center gap-0.5">
                        <IndianRupee size={14} strokeWidth={3} />
                        {b.final_amount}
                      </div>
                      <div className="text-[9px] font-bold text-slate-400 mt-0.5 uppercase tracking-widest">
                        {b.payment_method} {b.coupon_code && `· ${b.coupon_code}`}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="relative inline-block w-full min-w-[120px]">
                        <select 
                          className={`w-full appearance-none text-[10px] font-black px-3 py-2 rounded border outline-none cursor-pointer transition-colors ${
                            b.status === 'confirmed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                            b.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-red-50 text-red-700 border-red-200'
                          }`}
                          value={b.status}
                          onChange={e => updateStatus(b.id, e.target.value as any)}
                        >
                          <option value="pending">PENDING</option>
                          <option value="confirmed">CONFIRMED</option>
                          <option value="cancelled">CANCELLED</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-current opacity-50" size={12} />
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => handleDelete(b.id)}
                        className="p-2 hover:bg-red-50 text-slate-300 hover:text-red-500 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredBookings.length === 0 && (
            <div className="p-20 text-center">
                <p className="text-slate-300 font-black uppercase text-[10px] tracking-[0.3em]">No records found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}