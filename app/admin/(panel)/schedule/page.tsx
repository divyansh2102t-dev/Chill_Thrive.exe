'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase/client';
import {
  Clock, AlertCircle, Plus, Trash2, 
  XCircle, RotateCcw, Lock, Unlock, Globe, Users, CalendarDays, RefreshCcw, Save
} from 'lucide-react';
import { format } from 'date-fns';

/* ---------- TYPES ---------- */
interface Service {
  id: string;
  title: string;
}

interface SlotTiming {
  id: string;
  start_time: string;
  end_time: string;
  capacity: number;
  service_id: string;
}

interface ScheduleException {
  id: string;
  exception_date: string;
  slot_id: string | null;
  service_id: string;
  is_blocked: boolean;
  start_time?: string;
  end_time?: string;
  capacity?: number;
  is_added?: boolean;
  slots_booked?: number; // Added to track bookings for exception-only slots
}

interface BlockedDate {
  id: string;
  blocked_date: string;
  reason: string;
}

interface MergedSlot {
  type: 'default' | 'modified' | 'added' | 'blocked';
  id: string; 
  exceptionId?: string;
  start_time: string;
  end_time: string;
  capacity: number;
  bookedCount: number;
  remaining: number;
  originalData?: SlotTiming;
}

export default function ScheduleManager() {
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [defaultSlots, setDefaultSlots] = useState<SlotTiming[]>([]);
  const [exceptions, setExceptions] = useState<ScheduleException[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [upcomingBlocks, setUpcomingBlocks] = useState<BlockedDate[]>([]);
  
  const [isDayBlocked, setIsDayBlocked] = useState(false);
  const [blockReason, setBlockReason] = useState('');
  const [blockedDateId, setBlockedDateId] = useState<string | null>(null);

  const [isAddingSlot, setIsAddingSlot] = useState(false);
  const [newSlot, setNewSlot] = useState({ start: '09:00:00', end: '10:00:00', cap: 5 });

  useEffect(() => {
    fetchServices();
    fetchUpcomingBlocks();
  }, []);

  useEffect(() => {
    if (selectedServiceId) {
      fetchScheduleData();
    }
  }, [selectedServiceId, selectedDate]);

  const fetchServices = async () => {
    const { data } = await supabase.from('services').select('id, title').order('title');
    if (data && data.length > 0) {
      setServices(data);
      setSelectedServiceId(data[0].id);
    }
  };

  const fetchUpcomingBlocks = async () => {
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('blocked_dates')
      .select('*')
      .gte('blocked_date', today)
      .order('blocked_date', { ascending: true })
      .limit(10);
    if (data) setUpcomingBlocks(data);
  };

  const fetchScheduleData = async () => {
    setLoading(true);
    const [defaultsRes, exceptsRes, blockedRes, bookingsRes] = await Promise.all([
      supabase.from('slot_timings').select('*').eq('service_id', selectedServiceId).order('start_time'),
      supabase.from('schedule_exceptions').select('*').eq('service_id', selectedServiceId).eq('exception_date', selectedDate),
      supabase.from('blocked_dates').select('*').eq('blocked_date', selectedDate).maybeSingle(),
      supabase.from('bookings').select('slot_id').eq('service_id', selectedServiceId).eq('booking_date', selectedDate).neq('status', 'cancelled')
    ]);

    if (defaultsRes.data) setDefaultSlots(defaultsRes.data);
    if (exceptsRes.data) setExceptions(exceptsRes.data);
    if (bookingsRes.data) setBookings(bookingsRes.data);
    
    if (blockedRes.data) {
      setIsDayBlocked(true);
      setBlockedDateId(blockedRes.data.id);
      setBlockReason(blockedRes.data.reason || '');
    } else {
      setIsDayBlocked(false);
      setBlockedDateId(null);
      setBlockReason('');
    }
    setLoading(false);
  };

  /* ---------- MERGE LOGIC ---------- */
  const { standardSlots, addedSlots } = useMemo(() => {
    const standard: MergedSlot[] = [];
    const added: MergedSlot[] = [];
    const usedExceptionIds = new Set<string>();

    // Map bookings to slot IDs (Only works for standard slots where slot_id is not null)
    const bookingCounts: Record<string, number> = {};
    bookings.forEach((b: any) => {
      if (b.slot_id) bookingCounts[b.slot_id] = (bookingCounts[b.slot_id] || 0) + 1;
    });

    // Helper to build slot object with conditional booking counting
    const buildSlot = (
      type: MergedSlot['type'], 
      id: string, 
      start: string, 
      end: string, 
      cap: number, 
      exceptionId?: string, 
      original?: SlotTiming,
      manualBookedCount?: number // New parameter for exception-based booking counts
    ): MergedSlot => {
      
      let totalBooked = 0;

      if (manualBookedCount !== undefined) {
        // CASE 1: Added Slots (Exception Table)
        // These don't have a slot_id in the bookings table (it's null).
        // We rely on the 'slots_booked' column from schedule_exceptions.
        totalBooked = manualBookedCount;
      } else {
        // CASE 2: Standard/Modified Slots (Slot Timings Table)
        // These are linked via FK in bookings table. We use the mapped count.
        totalBooked = bookingCounts[id] || 0;
      }

      return {
        type, id, exceptionId,
        start_time: start, end_time: end, capacity: cap,
        bookedCount: totalBooked,
        remaining: Math.max(0, cap - totalBooked),
        originalData: original
      };
    };

    // 1. Process Default Slots (Standard Schedule)
    defaultSlots.forEach(slot => {
      let exception = exceptions.find(e => e.slot_id === slot.id || (e.start_time === slot.start_time && !e.slot_id));

      if (exception) {
        usedExceptionIds.add(exception.id);
        if (exception.is_blocked) {
          standard.push(buildSlot('blocked', slot.id, slot.start_time, slot.end_time, slot.capacity, exception.id, slot));
        } else {
          // Modified slot: Still uses bookingCounts based on slot.id (Standard logic)
          standard.push(buildSlot('modified', slot.id, exception.start_time || slot.start_time, exception.end_time || slot.end_time, exception.capacity ?? slot.capacity, exception.id, slot));
        }
      } else {
        standard.push(buildSlot('default', slot.id, slot.start_time, slot.end_time, slot.capacity, undefined, slot));
      }
    });

    // 2. Process Purely Added Slots (Exceptions without parents)
    exceptions.filter(e => !e.slot_id && !e.is_blocked && !usedExceptionIds.has(e.id)).forEach(exc => {
      // Added slot: Uses exc.slots_booked (Exception logic)
      added.push(buildSlot(
        'added', 
        exc.id, 
        exc.start_time!, 
        exc.end_time!, 
        exc.capacity!, 
        exc.id, 
        undefined, 
        exc.slots_booked // Pass the DB count explicitly
      ));
    });

    return {
        standardSlots: standard.sort((a, b) => a.start_time.localeCompare(b.start_time)),
        addedSlots: added.sort((a, b) => a.start_time.localeCompare(b.start_time))
    };
  }, [defaultSlots, exceptions, bookings]);

  /* ---------- ACTIONS ---------- */

  const toggleDayBlock = async () => {
    const originalState = { isDayBlocked, blockedDateId };
    setIsDayBlocked(!isDayBlocked); // Optimistic

    if (isDayBlocked && blockedDateId) {
      const { error } = await supabase.from('blocked_dates').delete().eq('id', blockedDateId);
      if (error) {
        setIsDayBlocked(originalState.isDayBlocked);
        alert("Failed to update");
      } else {
        setBlockedDateId(null);
        fetchUpcomingBlocks();
      }
    } else {
      const { data, error } = await supabase.from('blocked_dates').insert([{
        blocked_date: selectedDate,
        reason: blockReason || 'Maintenance'
      }]).select().single();
      
      if (error) {
        setIsDayBlocked(originalState.isDayBlocked);
        alert("Failed to block day");
      } else {
        setBlockedDateId(data.id);
        fetchUpcomingBlocks();
      }
    }
  };

  const createExceptionSlot = async () => {
    const timeExists = exceptions.find(e => e.start_time === newSlot.start);
    if (timeExists) return alert("A custom rule for this time already exists.");

    const matchingDefault = defaultSlots.find(s => s.start_time === newSlot.start);

    const { error } = await supabase.from('schedule_exceptions').insert([{
      service_id: selectedServiceId,
      exception_date: selectedDate,
      start_time: newSlot.start,
      end_time: newSlot.end,
      capacity: newSlot.cap,
      is_blocked: false,
      is_added: !matchingDefault,
      slot_id: matchingDefault?.id || null
    }]);

    if (!error) {
      setIsAddingSlot(false);
      fetchScheduleData();
    }
  };

  const createDefaultSlot = async () => {
    const { error } = await supabase.from('slot_timings').insert([{
      service_id: selectedServiceId,
      start_time: newSlot.start,
      end_time: newSlot.end,
      capacity: newSlot.cap,
      is_enabled: true
    }]);
    if (!error) {
      setIsAddingSlot(false);
      fetchScheduleData();
    }
  };

  // UPDATED: Override Capacity for Today (Optimistic)
  const updateSlotOverride = async (slot: MergedSlot, newCap: number) => {
    setExceptions(prev => {
        if (slot.exceptionId) {
            return prev.map(e => e.id === slot.exceptionId ? { ...e, capacity: newCap } : e);
        }
        return [...prev, { id: 'temp-opt', exception_date: selectedDate, slot_id: slot.id, service_id: selectedServiceId, capacity: newCap, is_blocked: false }];
    });

    if (slot.type === 'default') {
      await supabase.from('schedule_exceptions').insert([{
        service_id: selectedServiceId,
        exception_date: selectedDate,
        slot_id: slot.id,
        start_time: slot.start_time,
        end_time: slot.end_time,
        capacity: newCap,
        is_blocked: false
      }]);
    } else if (slot.exceptionId) {
      await supabase.from('schedule_exceptions').update({ capacity: newCap }).eq('id', slot.exceptionId);
    }
    fetchScheduleData();
  };

  // UPDATED: Update Master Default Capacity (Cleans up local exceptions)
  const updateMasterCapacity = async (slotId: string, newCap: number) => {
    if(!confirm(`Update standard capacity to ${newCap} for ALL future dates?`)) return;

    // 1. Optimistic Update
    // Update default slot locally
    setDefaultSlots(prev => prev.map(s => s.id === slotId ? { ...s, capacity: newCap } : s));
    // Remove any local exceptions for this slot (resetting it to default visually)
    setExceptions(prev => prev.filter(e => e.slot_id !== slotId));

    // 2. DB Updates
    const [updateRes, deleteRes] = await Promise.all([
        supabase.from('slot_timings').update({ capacity: newCap }).eq('id', slotId),
        supabase.from('schedule_exceptions').delete().eq('slot_id', slotId).eq('exception_date', selectedDate)
    ]);

    if (updateRes.error) {
        alert("Failed to update master slot.");
        fetchScheduleData(); // Revert
    } 
  };

  const handleSlotAction = async (slot: MergedSlot) => {
    const previousExceptions = [...exceptions];
    try {
      if (slot.type === 'modified' || slot.type === 'blocked') {
        // Remove exception (Reset to default)
        setExceptions(prev => prev.filter(e => e.id !== slot.exceptionId));
        if(slot.exceptionId) {
          await supabase.from('schedule_exceptions').delete().eq('id', slot.exceptionId);
        }
      } else if (slot.type === 'default') {
        // Add blocked exception
        const tempId = `temp-${Date.now()}`;
        setExceptions(prev => [...prev, {
          id: tempId, service_id: selectedServiceId, exception_date: selectedDate,
          slot_id: slot.id, is_blocked: true, is_added: false
        }]);
        await supabase.from('schedule_exceptions').insert([{
          service_id: selectedServiceId, exception_date: selectedDate, slot_id: slot.id, is_blocked: true
        }]);
      }
    } catch (error) {
      setExceptions(previousExceptions);
      alert("Action failed");
    } finally {
      fetchScheduleData();
    }
  };

  // UPDATED: Delete Added Slot with Validation
  const deleteAddedSlot = async (exceptionId: string) => {
    if (!confirm("Remove this additional slot?")) return;
    
    // Attempt delete
    const { error } = await supabase.from('schedule_exceptions').delete().eq('id', exceptionId);
    
    if (error) {
        if (error.code === '23503') {
            alert("⚠️ Cannot delete: There are active bookings associated with this slot.");
        } else {
            alert("Error deleting slot: " + error.message);
        }
    } else {
        setExceptions(prev => prev.filter(e => e.id !== exceptionId));
        fetchScheduleData();
    }
  };

  // UPDATED: Delete Default Slot with Validation
  const deleteDefaultSlot = async (slotId: string) => {
    if (!confirm("⚠️ WARNING: Permanent global deletion.\n\nAre you sure?")) return;
    
    const { error } = await supabase.from('slot_timings').delete().eq('id', slotId);
    
    if (error) {
        if (error.code === '23503') {
            alert("⚠️ Cannot delete Master Slot: There are bookings (past or future) linked to this slot.\n\nConsider blocking it for specific dates instead.");
        } else {
            alert("Error deleting slot: " + error.message);
        }
    } else {
        setDefaultSlots(prev => prev.filter(s => s.id !== slotId));
        fetchScheduleData();
    }
  };

  /* Helper to render a slot row */
  const SlotRow = ({ slot, isExtra }: { slot: MergedSlot, isExtra?: boolean }) => {
    const isBlocked = slot.type === 'blocked';
    let borderClass = 'border-slate-100';
    let bgClass = 'bg-white';
    let accentColor = 'text-slate-600';

    if (slot.type === 'modified') { borderClass = 'border-blue-200'; bgClass = 'bg-blue-50/30'; accentColor = 'text-blue-600'; }
    if (slot.type === 'added') { borderClass = 'border-emerald-200'; bgClass = 'bg-emerald-50/30'; accentColor = 'text-emerald-600'; }
    if (isBlocked) { borderClass = 'border-red-100'; bgClass = 'bg-red-50/50 grayscale opacity-75'; accentColor = 'text-red-400'; }

    return (
        <div className={`group relative p-4 rounded-xl border-2 ${borderClass} ${bgClass} transition-all flex items-center justify-between`}>
          <div className="flex items-center gap-6">
            <div className={`p-3 rounded-lg ${isBlocked ? 'bg-red-100' : 'bg-slate-100'} ${accentColor}`}>
              <Clock size={20} />
            </div>
            <div>
              <h4 className={`text-lg font-black ${isBlocked ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
              </h4>
              <div className="flex items-center gap-2">
                 <span className={`text-[10px] font-black uppercase tracking-widest ${accentColor}`}>
                    {slot.type === 'default' ? 'Standard' : slot.type}
                 </span>
                 {slot.type === 'default' && (
                   <span className="flex items-center gap-1 text-[9px] bg-slate-100 px-2 py-0.5 rounded text-slate-400 font-bold ml-2">
                     <Globe size={10} /> GLOBAL
                   </span>
                 )}
                 {!isBlocked && (
                   <div className={`ml-2 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide flex items-center gap-1 ${
                     slot.remaining === 0 ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'
                   }`}>
                     <Users size={10} />
                     {slot.bookedCount} Booked / {slot.remaining} Left
                   </div>
                 )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {!isBlocked && (
              <div className="flex items-center gap-1">
                <div className="flex flex-col items-center">
                    <label className="text-[9px] font-black text-slate-300 uppercase mb-1">Cap</label>
                    <input 
                    type="number" 
                    disabled={slot.type === 'blocked'}
                    value={slot.capacity}
                    onChange={(e) => updateSlotOverride(slot, parseInt(e.target.value))}
                    className={`w-16 p-2 text-center font-bold rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none ${slot.type === 'modified' ? 'bg-white border-blue-200 text-blue-600' : 'bg-slate-50 border-slate-200 text-slate-700'}`}
                    />
                </div>
                {/* Save to Master Button - Only for Default/Modified types */}
                {!isExtra && (
                    <button 
                        onClick={() => updateMasterCapacity(slot.id, slot.capacity)}
                        className="p-2 mt-4 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Save this capacity to Master (All future dates)"
                    >
                        <Globe size={16} />
                    </button>
                )}
              </div>
            )}
            <div className="w-px h-10 bg-slate-100 mx-2"></div>
            <div className="flex items-center gap-1">
              {isExtra ? (
                  <button onClick={() => deleteAddedSlot(slot.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={18} />
                  </button>
              ) : (
                <>
                  <button 
                    onClick={() => handleSlotAction(slot)} 
                    className={`p-2 rounded-lg transition-colors ${
                      isBlocked 
                      ? 'text-emerald-500 hover:bg-emerald-50' 
                      : slot.type === 'modified' 
                        ? 'text-blue-400 hover:text-blue-600 hover:bg-blue-50'
                        : 'text-slate-300 hover:text-orange-500 hover:bg-orange-50'
                    }`}
                    title={isBlocked ? "Unblock" : slot.type === 'modified' ? "Reset to Default" : "Block Slot"}
                  >
                    {isBlocked ? <RotateCcw size={18} /> : slot.type === 'modified' ? <RefreshCcw size={18}/> : <XCircle size={18} />}
                  </button>
                  <button onClick={() => deleteDefaultSlot(slot.id)} className="p-2 rounded-lg transition-colors text-slate-300 hover:text-red-600 hover:bg-red-50" title="Delete Master Slot">
                    <Trash2 size={18} />
                  </button>
                </>
              )}
            </div>
          </div>
          <div className={`absolute top-1/2 -translate-y-1/2 left-0 w-1 h-12 rounded-r-full ${
            slot.type === 'default' ? 'bg-slate-300' : 
            slot.type === 'modified' ? 'bg-blue-500' : 
            slot.type === 'added' ? 'bg-emerald-500' : 'bg-red-500'
          }`}></div>
        </div>
    );
  };

  return (
    <div className="p-6 md:p-10 bg-slate-50 min-h-screen space-y-8 max-w-7xl mx-auto">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Slot Manager</h1>
          <p className="text-slate-500 font-medium">Configure defaults and daily exceptions</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-slate-200 overflow-x-auto max-w-full">
           {services.map(s => (
             <button
              key={s.id}
              onClick={() => setSelectedServiceId(s.id)}
              className={`px-4 py-2 rounded-lg text-sm font-black transition-all whitespace-nowrap ${
                selectedServiceId === s.id 
                ? 'bg-[#0A2540] text-white' 
                : 'text-slate-500 hover:bg-slate-50'
              }`}
             >
               {s.title}
             </button>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-4 space-y-6">
           {/* Date Picker & Block Day Controls (Same as before) */}
           <div className="bg-white p-6 rounded-xl border border-slate-200">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 block">Selected Date</label>
              <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full text-lg font-black text-slate-800 bg-slate-50 p-4 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <div className="mt-4 flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                <AlertCircle className="text-blue-600 shrink-0" size={20} />
                <p className="text-xs text-blue-800 leading-relaxed font-medium">
                  Editing <strong>{format(new Date(selectedDate), 'dd MMM yyyy')}</strong>.
                </p>
              </div>
           </div>

           <div className={`p-6 rounded-xl border-2 transition-all ${isDayBlocked ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center gap-3 mb-4">
                 <div className={`p-2 rounded-lg ${isDayBlocked ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
                    {isDayBlocked ? <Lock size={20} /> : <Unlock size={20} />}
                 </div>
                 <h3 className="font-black text-sm uppercase tracking-widest text-slate-800">Full Day Closure</h3>
              </div>

              {isDayBlocked ? (
                <div className="space-y-4">
                  <p className="text-sm text-red-600 font-bold bg-white/50 p-3 rounded-lg border border-red-100">
                     Blocked: "{blockReason}"
                  </p>
                  <button onClick={toggleDayBlock} className="w-full py-3 bg-white border-2 border-red-200 text-red-500 hover:bg-red-50 font-black rounded-lg text-xs uppercase tracking-widest transition-colors">
                    Open Bookings
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <input 
                    type="text" 
                    placeholder="Reason (e.g. Holiday)" 
                    value={blockReason}
                    onChange={(e) => setBlockReason(e.target.value)}
                    className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-slate-400 font-bold placeholder:font-medium"
                  />
                  <button onClick={toggleDayBlock} className="w-full py-3 bg-slate-900 text-white hover:bg-slate-800 font-black rounded-lg text-xs uppercase tracking-widest transition-colors">
                    Block Entire Day
                  </button>
                </div>
              )}
           </div>

           {/* Upcoming Blocks */}
           <div className="bg-white p-6 rounded-xl border border-slate-200 max-h-[300px] overflow-y-auto">
              <div className="flex items-center gap-2 mb-4">
                <CalendarDays size={18} className="text-slate-400"/>
                <h3 className="font-black text-sm uppercase tracking-widest text-slate-800">Upcoming Closures</h3>
              </div>
              {upcomingBlocks.length === 0 ? (
                <p className="text-xs text-slate-400 font-medium italic">No upcoming blocked dates.</p>
              ) : (
                <div className="space-y-3">
                  {upcomingBlocks.map(block => (
                    <div key={block.id} className="group flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-red-100 transition-colors">
                      <div>
                        <p className="text-xs font-black text-slate-800">{format(new Date(block.blocked_date), 'dd MMM yyyy')}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{block.reason}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
           </div>

           <div className="p-6 bg-[#0A2540] rounded-xl text-white">
              <h3 className="font-black text-lg mb-4">Legend</h3>
              <div className="space-y-3 text-sm font-medium opacity-80">
                <div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full bg-slate-400"></div> Default Slot</div>
                <div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full bg-blue-500"></div> Modified Capacity</div>
                <div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full bg-emerald-500"></div> Added for this day</div>
                <div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full bg-red-500"></div> Blocked Slot</div>
              </div>
           </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className={`lg:col-span-8 space-y-4 transition-all ${isDayBlocked ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
          
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-bold text-slate-800">
              Slots for {format(new Date(selectedDate), 'MMMM do')}
            </h2>
            <button onClick={() => setIsAddingSlot(true)} className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-colors">
              <Plus size={16} /> Add Slot
            </button>
          </div>

          {isAddingSlot && (
            <div className="bg-white border-2 border-indigo-100 p-6 rounded-lg mb-6 animate-in slide-in-from-top-4">
              <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-4">New Slot Details</h3>
              <div className="flex gap-4 mb-4">
                <div className="flex-1 space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Start</label>
                  <input type="time" value={newSlot.start} onChange={e => setNewSlot({...newSlot, start: e.target.value})} className="w-full p-2 bg-slate-50 rounded-lg font-bold" />
                </div>
                <div className="flex-1 space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">End</label>
                  <input type="time" value={newSlot.end} onChange={e => setNewSlot({...newSlot, end: e.target.value})} className="w-full p-2 bg-slate-50 rounded-lg font-bold" />
                </div>
                <div className="w-24 space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Cap</label>
                  <input type="number" value={newSlot.cap} onChange={e => setNewSlot({...newSlot, cap: parseInt(e.target.value)})} className="w-full p-2 bg-slate-50 rounded-lg font-bold" />
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={createExceptionSlot} className="flex-1 py-3 bg-indigo-600 text-white rounded-lg font-bold text-sm">Add for {format(new Date(selectedDate), 'MMM do')} Only</button>
                <button onClick={createDefaultSlot} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-lg font-bold text-sm">Add to Defaults (All Days)</button>
                <button onClick={() => setIsAddingSlot(false)} className="px-4 py-3 text-slate-400 font-bold text-sm">Cancel</button>
              </div>
            </div>
          )}

          <div className="space-y-6">
            
            {/* 1. EXTRA SLOTS SECTION (Added) */}
            {addedSlots.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-xs font-black text-emerald-600 uppercase tracking-widest px-1">Extra Slots (Date Specific)</h3>
                    {addedSlots.map((slot, idx) => (
                        <SlotRow key={`${slot.id}-${idx}`} slot={slot} isExtra={true} />
                    ))}
                </div>
            )}

            {/* 2. STANDARD SLOTS SECTION (Default, Modified, Blocked) */}
            <div className="space-y-3">
                {(addedSlots.length > 0 && standardSlots.length > 0) && (
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-1 mt-6">Standard Schedule</h3>
                )}
                
                {standardSlots.map((slot, idx) => (
                    <SlotRow key={`${slot.id}-${idx}`} slot={slot} isExtra={false} />
                ))}

                {standardSlots.length === 0 && addedSlots.length === 0 && !loading && (
                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                        <p className="text-slate-400 font-medium">No slots configured for this day.</p>
                    </div>
                )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}