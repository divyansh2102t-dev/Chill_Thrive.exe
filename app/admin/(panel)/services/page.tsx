'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import {
  Plus, Edit2, Trash2, Save, X, ToggleLeft, ToggleRight, 
  Loader2, UploadCloud, PlayCircle, 
  Tag, Info, Image as ImageIcon, MinusCircle,
  Link2, Trash, Wifi
} from 'lucide-react';

/* ================= TYPES ================= */

interface Service {
  id: string;
  slug: string;
  title: string;
  description: string;
  type: 'single' | 'combo';
  duration_minutes: number[];
  prices: number[];
  benefits: string[];
  original_price?: number;
  currency: string;
  media_url: string;
  media_type: 'image' | 'video';
  yt_url?: string;
  badge?: 'POPULAR' | 'BEST_VALUE' | null;
  is_active: boolean;
  sort_order: number;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);

  const [newBenefit, setNewBenefit] = useState('');
  const [tempDuration, setTempDuration] = useState<string>('');
  const [tempPrice, setTempPrice] = useState<string>('');

  const [formData, setFormData] = useState<any>({
    title: '',
    slug: '',
    description: '',
    prices: [],
    duration_minutes: [], 
    type: 'single',
    benefits: [],
    media_url: '',
    media_type: 'image',
    yt_url: '',
    badge: null,
    is_active: true,
  });

  useEffect(() => { 
    fetchServices(); 
    
    /* ---------- REALTIME SUBSCRIPTION ---------- */
    const channel = supabase
      .channel('services-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'services' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setServices((prev) => [...prev, payload.new as Service].sort((a, b) => a.sort_order - b.sort_order));
          } else if (payload.eventType === 'UPDATE') {
            setServices((prev) =>
              prev.map((s) => (s.id === payload.new.id ? (payload.new as Service) : s))
            );
          } else if (payload.eventType === 'DELETE') {
            setServices((prev) => prev.filter((s) => s.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    const { data } = await supabase.from('services').select('*').order('sort_order', { ascending: true });
    if (data) setServices(data);
    setLoading(false);
  };

  const handleTitleChange = (val: string) => {
    const slug = val.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    setFormData({ ...formData, title: val, slug });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setUploadingMedia(true);
    const file = e.target.files[0];
    const ext = file.name.split('.').pop()?.toLowerCase();
    const filePath = `services/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage.from('services-media').upload(filePath, file);
    if (uploadError) { alert('Upload failed'); setUploadingMedia(false); return; }

    const { data } = supabase.storage.from('services-media').getPublicUrl(filePath);
    setFormData({ 
      ...formData, 
      media_url: data.publicUrl, 
      media_type: ['mp4', 'webm', 'mov'].includes(ext || '') ? 'video' : 'image' 
    });
    setUploadingMedia(false);
  };

  const addPricingTier = () => {
    const d = parseInt(tempDuration);
    const p = parseFloat(tempPrice);
    if (isNaN(d) || isNaN(p)) return alert("Enter valid duration and price");
    if (formData.duration_minutes.includes(d)) return alert("Duration already exists");

    setFormData({
      ...formData,
      duration_minutes: [...formData.duration_minutes, d],
      prices: [...formData.prices, p]
    });
    setTempDuration('');
    setTempPrice('');
  };

  const removePricingTier = (index: number) => {
    setFormData({
      ...formData,
      duration_minutes: formData.duration_minutes.filter((_: any, i: number) => i !== index),
      prices: formData.prices.filter((_: any, i: number) => i !== index),
    });
  };

  const addBenefit = () => {
    if (!newBenefit.trim()) return;
    setFormData({ ...formData, benefits: [...formData.benefits, newBenefit.trim()] });
    setNewBenefit('');
  };

  const removeBenefit = (index: number) => {
    setFormData({ ...formData, benefits: formData.benefits.filter((_: any, i: number) => i !== index) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.duration_minutes.length === 0) return alert("Add at least one duration and price tier");
    if (!formData.media_url) return alert("Please upload media");
    
    setIsSaving(true);
    const payload = { ...formData };
    delete payload.created_at; // Ensure we don't try to update read-only fields

    const { error } = formData.id 
      ? await supabase.from('services').update(payload).eq('id', formData.id)
      : await supabase.from('services').insert([payload]);

    if (error) alert(error.message);
    else { resetForm(); fetchServices(); }
    setIsSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this service?")) return;
    const { error } = await supabase.from('services').delete().eq('id', id);
    if (error) alert("Delete failed");
  };

  const handleEditClick = (service: Service) => {
    setFormData({ ...service });
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setFormData({ title: '', slug: '', description: '', prices: [], duration_minutes: [], type: 'single', benefits: [], media_url: '', media_type: 'image', yt_url: '', badge: null, is_active: true });
    setIsEditing(false);
    setTempDuration('');
    setTempPrice('');
  };

  const handleToggle = async (service: Service) => {
    const nextStatus = !service.is_active;
    const { error } = await supabase.from('services').update({ is_active: nextStatus }).eq('id', service.id);
    if (error) alert("Toggle failed");
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-white"><Loader2 className="animate-spin text-slate-900" size={32} /></div>;

  return (
    <div className="min-h-screen bg-white p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Catalog Manager</h1>
            <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[9px] font-bold rounded border border-emerald-100">
              <Wifi size={10} /> LIVE
            </span>
          </div>
          <p className="text-slate-400 font-medium text-xs mt-1 uppercase tracking-wider">Service & Pricing Architecture</p>
        </div>
        {!isEditing && (
          <button onClick={() => setIsEditing(true)} className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white text-xs font-black uppercase tracking-widest rounded transition-all active:scale-95">
            <Plus size={16} /> New Service
          </button>
        )}
      </div>

      {/* EDITOR PANEL */}
      {isEditing && (
        <div className="bg-white rounded border border-slate-200 overflow-hidden animate-in fade-in duration-300">
          <div className="bg-slate-50 px-6 py-4 flex justify-between items-center border-b border-slate-200">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <Info size={14} /> {formData.id ? 'Modify Service' : 'Define New Service'}
            </h3>
            <button onClick={resetForm} className="text-slate-400 hover:text-slate-900 transition-colors"><X size={20} /></button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-7 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Service Title</label>
                  <input required value={formData.title} onChange={e => handleTitleChange(e.target.value)} className="w-full p-3 bg-white border border-slate-200 rounded outline-none focus:border-slate-900 text-xs font-bold uppercase" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Category Type</label>
                  <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} className="w-full p-3 border border-slate-200 rounded bg-white text-xs font-bold uppercase outline-none">
                    <option value="single">Single Service</option>
                    <option value="combo">Combo Package</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Description</label>
                <textarea rows={3} required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full p-3 bg-white border border-slate-200 rounded outline-none focus:border-slate-900 text-xs font-medium" />
              </div>

              {/* DYNAMIC PRICING SECTION */}
              <div className="space-y-4 p-4 bg-slate-50 border border-slate-200 rounded">
                <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                  <Tag size={14}/> Pricing Matrix (Mins + INR)
                </label>
                
                <div className="flex gap-2">
                  <input type="number" placeholder="MINS" value={tempDuration} onChange={e => setTempDuration(e.target.value)} className="flex-1 p-3 border border-slate-200 rounded text-[11px] font-bold uppercase outline-none" />
                  <input type="number" placeholder="PRICE" value={tempPrice} onChange={e => setTempPrice(e.target.value)} className="flex-1 p-3 border border-slate-200 rounded text-[11px] font-bold uppercase outline-none" />
                  <button type="button" onClick={addPricingTier} className="px-5 bg-slate-900 text-white rounded text-[10px] font-black uppercase">Add</button>
                </div>

                <div className="space-y-1">
                  {formData.duration_minutes.map((dur: number, idx: number) => (
                    <div key={idx} className="flex items-center justify-between bg-white p-3 border border-slate-200 rounded">
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{dur} Mins</span>
                        <span className="font-black text-slate-800 text-sm">₹{formData.prices[idx]}</span>
                      </div>
                      <button type="button" onClick={() => removePricingTier(idx)} className="text-slate-300 hover:text-red-500"><Trash size={16}/></button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Strategic Benefits</label>
                <div className="flex gap-2">
                  <input placeholder="ADD BENEFIT..." value={newBenefit} onChange={e => setNewBenefit(e.target.value)} className="flex-1 p-3 border border-slate-200 rounded text-[10px] font-bold uppercase outline-none focus:border-slate-900" />
                  <button type="button" onClick={addBenefit} className="px-5 bg-slate-100 text-slate-600 border border-slate-200 rounded text-[10px] font-black uppercase">Plus</button>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {formData.benefits.map((b: string, i: number) => (
                    <span key={i} className="inline-flex items-center gap-2 border border-slate-200 text-slate-600 px-3 py-1 rounded text-[9px] font-black uppercase">
                      {b} <button type="button" onClick={() => removeBenefit(i)} className="hover:text-red-500"><MinusCircle size={12}/></button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="md:col-span-5 space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Media Asset</label>
                <div className="relative aspect-video bg-slate-50 border border-slate-200 rounded overflow-hidden flex items-center justify-center">
                  {formData.media_url ? (
                    formData.media_type === 'video' ? <PlayCircle size={32} className="text-slate-900"/> : <img src={formData.media_url} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <UploadCloud size={32} className="text-slate-200" />
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Drop Asset Here</span>
                    </div>
                  )}
                  <input type="file" accept="image/*,video/*" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                  {uploadingMedia && <div className="absolute inset-0 bg-white/80 flex items-center justify-center"><Loader2 className="animate-spin text-slate-900"/></div>}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Link2 size={12} /> External Video Link</label>
                <input placeholder="YOUTUBE URL..." value={formData.yt_url || ''} onChange={e => setFormData({ ...formData, yt_url: e.target.value })} className="w-full p-3 border border-slate-200 rounded text-[10px] font-bold uppercase outline-none focus:border-slate-900" />
              </div>

              <div className="flex flex-col gap-2 pt-10">
                <button disabled={isSaving || uploadingMedia} type="submit" className="w-full flex items-center justify-center gap-2 py-4 bg-slate-900 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded">
                  {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Update Database
                </button>
                <button type="button" onClick={resetForm} className="w-full py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900">Cancel Entry</button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* SERVICE GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map(service => (
          <div key={service.id} className={`bg-white rounded border border-slate-200 overflow-hidden flex flex-col transition-all ${!service.is_active && 'opacity-60 grayscale'}`}>
            <div className="relative h-44 bg-slate-100">
              <img src={service.media_url} className="h-full w-full object-cover" />
              <div className="absolute top-3 left-3">
                <span className="px-2 py-1 bg-slate-900 text-white text-[9px] font-black tracking-widest uppercase rounded">
                  {service.type}
                </span>
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight leading-tight">{service.title}</h3>
                <div className="text-right">
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Starting from</div>
                  <div className="text-lg font-black text-slate-900 leading-none">₹{Math.min(...service.prices)}</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mb-6">
                {service.duration_minutes.map((m, i) => (
                  <span key={i} className="text-[8px] font-black border border-slate-100 text-slate-400 px-2 py-1 rounded uppercase">
                    {m}m / ₹{service.prices[i]}
                  </span>
                ))}
              </div>

              <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="flex gap-4">
                  <button onClick={() => handleEditClick(service)} className="text-slate-300 hover:text-slate-900 transition-colors"><Edit2 size={16} /></button>
                  <button onClick={() => handleDelete(service.id)} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                </div>
                <button onClick={() => handleToggle(service)} className="flex items-center gap-2 group">
                  <span className={`text-[9px] font-black tracking-[0.1em] ${service.is_active ? 'text-emerald-500' : 'text-slate-300'}`}>
                    {service.is_active ? 'ACTIVE' : 'HIDDEN'}
                  </span>
                  {service.is_active ? <ToggleRight size={20} className="text-emerald-500" /> : <ToggleLeft size={20} className="text-slate-300" />}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {services.length === 0 && !loading && (
        <div className="p-20 text-center border border-dashed border-slate-200 rounded">
          <p className="text-slate-300 font-black uppercase text-[10px] tracking-[0.3em]">Catalog Empty</p>
        </div>
      )}
    </div>
  );
}