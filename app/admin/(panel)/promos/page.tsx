'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import {
  Plus, Edit2, Trash2, Save, X, Tag, Percent, CalendarClock, Zap,
  CheckSquare, Square, Loader2, Users, Infinity, AlertCircle, Info
} from 'lucide-react';

/* ---------- TYPES ---------- */

interface Service {
  id: string;
  title: string;
}

interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discount_type: 'percent' | 'fixed';
  discount_amount: number;
  max_uses: number | null;
  used_count: number;
  valid_from: string | null;
  valid_until: string | null;
  is_active: boolean;
  is_auto_apply: boolean;
  applicable_services: string[] | null;
}

export default function PromoCodesPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const initialForm: Partial<Coupon> = {
    code: '',
    description: '',
    discount_type: 'percent',
    discount_amount: 0,
    max_uses: null,
    used_count: 0,
    valid_from: null,
    valid_until: null,
    is_active: true,
    is_auto_apply: false,
    applicable_services: [],
  };

  const [formData, setFormData] = useState<Partial<Coupon>>(initialForm);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: couponData } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
      if (couponData) setCoupons(couponData);
      const { data: serviceData } = await supabase.from('services').select('id, title');
      if (serviceData) setServices(serviceData);
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const payload = { ...formData, code: formData.code?.toUpperCase() };

    if (formData.id) {
      const { error } = await supabase.from('coupons').update(payload).eq('id', formData.id);
      if (!error) setCoupons(coupons.map(c => c.id === formData.id ? { ...c, ...payload } as Coupon : c));
    } else {
      const { data, error } = await supabase.from('coupons').insert([payload]).select().single();
      if (data) setCoupons([data, ...coupons]);
    }
    setIsSaving(false);
    resetForm();
  };

  const resetForm = () => { setFormData(initialForm); setIsEditing(false); };

  const getStatusInfo = (c: Coupon) => {
    const now = new Date();
    if (!c.is_active) return { label: 'Inactive', color: 'bg-slate-100 text-slate-600' };
    if (c.max_uses && c.used_count >= c.max_uses) return { label: 'Exhausted', color: 'bg-amber-100 text-amber-700' };
    if (c.valid_from && new Date(c.valid_from) > now) return { label: 'Scheduled', color: 'bg-blue-100 text-blue-700' };
    if (c.valid_until && new Date(c.valid_until) < now) return { label: 'Expired', color: 'bg-red-100 text-red-700' };
    return { label: 'Active', color: 'bg-emerald-100 text-emerald-700' };
  };

  /* ---------- ACTIONS ---------- */

  const handleEdit = (coupon: Coupon) => {
    // Populate the form with existing data
    setFormData(coupon);
    setIsEditing(true);
    
    // Smooth scroll to the editor for better UX
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    // Standard safety check for admin actions
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this campaign? This action cannot be undone and will stop the code from working immediately."
    );

    if (!isConfirmed) return;

    const { error } = await supabase
      .from('coupons')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Delete Error:", error.message);
      alert("Failed to delete the coupon. Please try again.");
    } else {
      // Optimistically update the local UI state
      setCoupons(coupons.filter(c => c.id !== id));
    }
  };

  if (loading) return (
    <div className="flex flex-col h-96 items-center justify-center space-y-4">
      <Loader2 className="animate-spin text-indigo-500" size={48} />
      <p className="text-slate-500 font-medium">Syncing promotional data...</p>
    </div>
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4 md:p-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Campaigns & Offers</h2>
          <p className="text-slate-500 font-medium">Configure logic for discounts and auto-apply rewards</p>
        </div>
        {!isEditing && (
          <button onClick={() => setIsEditing(true)} className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
            <Plus size={20}/> Create Code
          </button>
        )}
      </div>

      {/* EDITOR */}
      {isEditing && (
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-top-4">
          <div className="bg-slate-900 px-6 py-4 flex justify-between items-center text-white">
            <h3 className="font-bold flex items-center gap-2">
              <Tag size={18} className="text-indigo-400"/>
              {formData.id ? `Edit Campaign: ${formData.code}` : 'Define New Campaign'}
            </h3>
            <button onClick={resetForm} className="hover:rotate-90 transition-transform"><X/></button>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              {/* Identity & Logic */}
              <div className="md:col-span-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Coupon Code</label>
                    <input required placeholder="E.g. WINTER50" value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} className="w-full p-3 border rounded-xl font-mono text-xl font-bold uppercase tracking-widest focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Short Description</label>
                    <input placeholder="E.g. Valid on first visit" value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full p-3 border rounded-xl outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl">
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Discount Type</label>
                    <div className="flex gap-2">
                      {['percent', 'fixed'].map((t) => (
                        <button key={t} type="button" onClick={() => setFormData({ ...formData, discount_type: t as any })} className={`flex-1 py-2 rounded-lg font-bold text-sm border-2 transition-all ${formData.discount_type === t ? 'bg-white border-indigo-600 text-indigo-600 shadow-sm' : 'border-transparent text-slate-400'}`}>
                          {t === 'percent' ? 'Percentage (%)' : 'Fixed Amount (₹)'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Amount</label>
                    <input type="number" required value={formData.discount_amount} onChange={e => setFormData({ ...formData, discount_amount: Number(e.target.value) })} className="w-full p-2 border-b-2 border-slate-200 bg-transparent text-2xl font-black focus:border-indigo-600 outline-none" />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Applies To:</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {services.map(s => {
                      const sel = formData.applicable_services?.includes(s.id);
                      return (
                        <button key={s.id} type="button" onClick={() => setFormData({ ...formData, applicable_services: sel ? formData.applicable_services?.filter(x => x !== s.id) : [...(formData.applicable_services || []), s.id] })} 
                        className={`p-2.5 border rounded-xl text-left text-xs font-bold flex items-center gap-2 transition-all ${sel ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white text-slate-500 border-slate-200'}`}>
                          {sel ? <CheckSquare size={14}/> : <Square size={14}/>}
                          <span className="truncate">{s.title}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Limits & Rules */}
              <div className="md:col-span-4 bg-slate-50 p-6 rounded-2xl space-y-6">
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><CalendarClock size={14}/> Availability Period</h4>
                  <div className="space-y-3">
                    <input type="datetime-local" value={formData.valid_from ? new Date(formData.valid_from).toISOString().slice(0,16) : ''} onChange={e => setFormData({ ...formData, valid_from: e.target.value })} className="w-full p-2 text-sm border rounded-lg" />
                    <input type="datetime-local" value={formData.valid_until ? new Date(formData.valid_until).toISOString().slice(0,16) : ''} onChange={e => setFormData({ ...formData, valid_until: e.target.value })} className="w-full p-2 text-sm border rounded-lg" />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Users size={14}/> Usage Cap</h4>
                  <input type="number" placeholder="No limit (leave empty)" value={formData.max_uses || ''} onChange={e => setFormData({ ...formData, max_uses: e.target.value ? Number(e.target.value) : null })} className="w-full p-3 bg-white border rounded-xl font-bold" />
                </div>

                <div className="space-y-3 pt-4 border-t">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`p-1 rounded ${formData.is_auto_apply ? 'bg-amber-400' : 'bg-slate-200'}`}><Zap size={14} className={formData.is_auto_apply ? 'text-white' : 'text-slate-400'}/></div>
                    <span className="text-sm font-bold text-slate-700">Auto-apply at Checkout</span>
                    <input type="checkbox" className="hidden" checked={formData.is_auto_apply} onChange={e => setFormData({ ...formData, is_auto_apply: e.target.checked })} />
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`p-1 rounded ${formData.is_active ? 'bg-emerald-500' : 'bg-slate-200'}`}><AlertCircle size={14} className="text-white"/></div>
                    <span className="text-sm font-bold text-slate-700">Active Campaign</span>
                    <input type="checkbox" className="hidden" checked={formData.is_active} onChange={e => setFormData({ ...formData, is_active: e.target.checked })} />
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t">
              <button type="button" onClick={resetForm} className="px-6 py-2 font-bold text-slate-500">Discard</button>
              <button type="submit" disabled={isSaving} className="bg-indigo-600 text-white font-bold px-10 py-3 rounded-xl shadow-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2">
                {isSaving ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>}
                Publish Offer
              </button>
            </div>
          </form>
        </div>
      )}

      {/* LIST */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {coupons.map(c => {
          const status = getStatusInfo(c);
          const usagePercent = c.max_uses ? (c.used_count / c.max_uses) * 100 : 0;

          return (
            <div key={c.id} className="bg-white p-6 border border-slate-200 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group hover:border-indigo-300 transition-all shadow-sm">
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-black text-xl tracking-tighter text-slate-900 bg-slate-50 px-3 py-1 rounded-lg border">{c.code}</span>
                  <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${status.color}`}>{status.label}</span>
                  {c.is_auto_apply && <div className="bg-amber-100 p-1 rounded-full"><Zap size={12} className="text-amber-600 fill-amber-600"/></div>}
                </div>
                
                <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                   <div className="flex items-center gap-1"><Percent size={14} className="text-indigo-400"/> {c.discount_type === 'percent' ? `${c.discount_amount}% OFF` : `₹${c.discount_amount} OFF`}</div>
                   <div className="flex items-center gap-1"><Users size={14} className="text-indigo-400"/> {c.used_count} Redemptions</div>
                </div>

                {/* Usage Bar */}
                {c.max_uses && (
                  <div className="w-full max-w-xs space-y-1">
                    <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase">
                      <span>Usage</span>
                      <span>{c.used_count}/{c.max_uses}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full transition-all duration-1000 ${usagePercent > 90 ? 'bg-red-500' : 'bg-indigo-500'}`} style={{ width: `${Math.min(usagePercent, 100)}%` }} />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2 self-end md:self-center">
                <button onClick={() => handleEdit(c)} className="p-2.5 bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"><Edit2 size={20}/></button>
                <button onClick={() => handleDelete(c.id)} className="p-2.5 bg-slate-50 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={20}/></button>
              </div>
            </div>
          );
        })}
      </div>

      {coupons.length === 0 && !loading && (
        <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
           <Tag className="mx-auto text-slate-300 mb-4" size={48}/>
           <h3 className="text-xl font-bold text-slate-800">No active campaigns</h3>
           <p className="text-slate-500">Create your first promo code to boost bookings.</p>
        </div>
      )}
    </div>
  );
}