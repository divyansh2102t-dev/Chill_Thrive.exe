'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import {
  Calendar, Search, LayoutGrid, List,
  Trash2, Eye, EyeOff, Loader2, 
  CheckCircle2, XCircle, Clock, 
  Filter, IndianRupee, Phone, Mail, ChevronRight, Lock, Unlock
} from 'lucide-react';

/* ---------- TYPES ---------- */
// (Keep your interfaces as defined in the prompt)

export default function AdminBookings() {
  const [activeTab, setActiveTab] = useState<'list' | 'availability'>('list');
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<any[]>([]);
  const [slots, setSlots] = useState<any[]>([]);
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  /* ---------- FETCH DATA ---------- */
  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const fetchData = async () => {
    setLoading(true);
    const [{ data: b }, { data: sl }, { data: bd }] = await Promise.all([
      supabase.from('bookings').select('*').order('booking_date', { ascending: false }),
      supabase.from('slot_timings').select('*').order('start_time', { ascending: true }),
      supabase.from('blocked_dates').select('blocked_date'),
    ]);
    if (b) setBookings(b);
    if (sl) setSlots(sl);
    if (bd) setBlockedDates(bd.map(x => x.blocked_date));
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    setBookings(prev => prev.map(x => x.id === id ? { ...x, status } : x));
    await supabase.from('bookings').update({ status }).eq('id', id);
  };

  const handleDelete = async (id: string) => {
    // 1. Safety first - confirm before destroying data
    const confirmed = window.confirm(
      "Are you sure you want to delete this reservation? This action cannot be undone."
    );

    if (!confirmed) return;

    // 2. Optimistic Update: Remove it from the list immediately for a 'snappy' feel
    const previousBookings = [...bookings];
    setBookings(prev => prev.filter(b => b.id !== id));

    // 3. Delete from Supabase
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Delete Error:", error.message);
      alert("Failed to delete booking. Restoring record...");
      // Rollback if database call fails
      setBookings(previousBookings);
    }
  };

  /* ---------- CALCULATIONS ---------- */
  const stats = {
    revenue: bookings.filter(b => b.status === 'confirmed').reduce((acc, curr) => acc + curr.final_amount, 0),
    pending: bookings.filter(b => b.status === 'pending').length,
    today: bookings.filter(b => b.booking_date === new Date().toISOString().split('T')[0]).length
  };

  const filteredBookings = bookings.filter(b => {
    const matchesSearch = b.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) || b.customer_phone.includes(searchTerm);
    const matchesStatus = statusFilter === 'All' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen space-y-8 max-w-7xl mx-auto">
      
      {/* HEADER & TABS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Reservations</h1>
          <p className="text-slate-500 font-medium">Manage customer slots and schedule availability</p>
        </div>

        <div className="bg-white p-1.5 rounded-xl border shadow-sm flex gap-1">
          <button onClick={() => setActiveTab('list')} className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold transition-all ${activeTab === 'list' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>
            <List size={18} /> List
          </button>
          <button onClick={() => setActiveTab('availability')} className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold transition-all ${activeTab === 'availability' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>
            <Calendar size={18} /> Availability
          </button>
        </div>
      </div>

      {/* STATS RIBBON */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Confirmed Revenue', value: `₹${stats.revenue.toLocaleString()}`, icon: <IndianRupee className="text-green-600" />, bg: 'bg-green-50' },
          { label: 'Pending Requests', value: stats.pending, icon: <Clock className="text-amber-600" />, bg: 'bg-amber-50' },
          { label: 'Today\'s Bookings', value: stats.today, icon: <Calendar className="text-blue-600" />, bg: 'bg-blue-50' }
        ].map((stat, i) => (
          <div key={i} className={`${stat.bg} p-6 rounded-2xl border border-white shadow-sm flex items-center justify-between`}>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{stat.label}</p>
              <h3 className="text-2xl font-black text-slate-800">{stat.value}</h3>
            </div>
            <div className="p-3 bg-white rounded-xl shadow-sm">{stat.icon}</div>
          </div>
        ))}
      </div>

      {/* MAIN CONTENT */}
      {activeTab === 'list' ? (
        <div className="space-y-6">
          {/* SEARCH & FILTER BAR */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
              <input 
                placeholder="Search by name, email or phone..." 
                className="w-full pl-12 pr-4 py-3 bg-white border rounded-xl outline-none focus:ring-2 focus:ring-slate-900 transition-all shadow-sm"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <select 
              className="px-6 py-3 bg-white border rounded-xl font-bold text-slate-700 outline-none shadow-sm"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* TABLE */}
          <div className="bg-white rounded-2xl border shadow-xl overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-900 text-white">
                  <th className="p-5 text-xs font-bold uppercase tracking-widest">Customer Details</th>
                  <th className="p-5 text-xs font-bold uppercase tracking-widest">Service & Date</th>
                  <th className="p-5 text-xs font-bold uppercase tracking-widest">Payment</th>
                  <th className="p-5 text-xs font-bold uppercase tracking-widest">Status</th>
                  <th className="p-5 text-xs font-bold uppercase tracking-widest text-right">Manage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-5">
                      <div className="font-black text-slate-800">{b.customer_name}</div>
                      <div className="flex flex-col gap-1 mt-1">
                        <span className="text-xs text-slate-400 flex items-center gap-1"><Mail size={12}/> {b.customer_email}</span>
                        <span className="text-xs text-slate-400 flex items-center gap-1"><Phone size={12}/> {b.customer_phone}</span>
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="text-sm font-bold text-slate-700">{b.service_title}</div>
                      <div className="text-xs text-indigo-500 font-bold mt-1">
                        {new Date(b.booking_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="text-sm font-black text-slate-800">₹{b.final_amount}</div>
                      <div className="text-[10px] font-bold text-slate-400 mt-0.5">{b.payment_method} · {b.coupon_code || 'No Coupon'}</div>
                    </td>
                    <td className="p-5">
                      <select 
                        className={`text-xs font-black px-3 py-1.5 rounded-full border-0 outline-none cursor-pointer appearance-none ${
                          b.status === 'confirmed' ? 'bg-green-100 text-green-700' : 
                          b.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                        }`}
                        value={b.status}
                        onChange={e => updateStatus(b.id, e.target.value)}
                      >
                        <option value="pending">PENDING</option>
                        <option value="confirmed">CONFIRMED</option>
                        <option value="cancelled">CANCELLED</option>
                      </select>
                    </td>
                    <td className="p-5 text-right">
                      <button 
                        onClick={() => handleDelete(b.id)}
                        className="p-2 hover:bg-red-50 text-red-400 hover:text-red-600 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredBookings.length === 0 && !loading && (
              <div className="p-20 text-center text-slate-300 font-medium">No bookings match your filters.</div>
            )}
          </div>
        </div>
      ) : (
        /* AVAILABILITY VIEW OVERHAUL */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
            <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">Select Date</h3>
            <input 
              type="date" 
              className="w-full p-4 bg-slate-50 border-0 rounded-xl font-bold text-lg outline-none focus:ring-2 focus:ring-slate-900"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
            />
            <button 
              onClick={async () => {
                const isBlocked = blockedDates.includes(selectedDate);
                if (isBlocked) {
                  await supabase.from('blocked_dates').delete().eq('blocked_date', selectedDate);
                } else {
                  await supabase.from('blocked_dates').insert({ blocked_date: selectedDate });
                }
                fetchData();
              }}
              className={`w-full py-4 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 ${
                blockedDates.includes(selectedDate) 
                ? 'bg-green-50 text-green-700 hover:bg-green-100' 
                : 'bg-red-50 text-red-700 hover:bg-red-100'
              }`}
            >
              {blockedDates.includes(selectedDate) ? <Unlock size={18}/> : <Lock size={18}/>}
              {blockedDates.includes(selectedDate) ? 'UNBLOCK DATE' : 'BLOCK ENTIRE DATE'}
            </button>
          </div>

          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border shadow-sm space-y-6">
            <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">Slot Availability for {selectedDate}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {slots.map(slot => (
                <div key={slot.id} className="p-4 border rounded-xl flex items-center justify-between group hover:border-slate-300 transition-all">
                  <div>
                    <div className="text-sm font-black text-slate-800">{slot.start_time} - {slot.end_time}</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Regular Capacity: {slot.capacity}</div>
                  </div>
                  <button className="p-2 bg-slate-50 rounded-lg text-slate-400 hover:text-slate-900">
                    <Filter size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}