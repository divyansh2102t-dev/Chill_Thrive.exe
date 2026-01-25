'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import {
  Plus, Edit2, Trash2, Save, X, ToggleLeft, ToggleRight, 
  Loader2, Layers, UploadCloud, PlayCircle, 
  Tag, Info, CheckCircle2, Image as ImageIcon, MinusCircle,
  Link2, Trash
} from 'lucide-react';

/* ================= TYPES ================= */

interface Service {
  id: string;
  slug: string;
  title: string;
  description: string;
  type: 'single' | 'combo';
  duration_minutes: number[];
  prices: number[]; // Changed from price: number
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
  
  // UI state for adding new duration/price pairs
  const [tempDuration, setTempDuration] = useState<string>('');
  const [tempPrice, setTempPrice] = useState<string>('');

  const [formData, setFormData] = useState<any>({
    title: '',
    slug: '',
    description: '',
    prices: [], // Array to match durations
    duration_minutes: [], 
    type: 'single',
    benefits: [],
    media_url: '',
    media_type: 'image',
    yt_url: '',
    badge: null,
    is_active: true,
  });

  useEffect(() => { fetchServices(); }, []);

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
    if (!error) setServices((prev) => prev.filter((s) => s.id !== id));
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
    setServices(prev => prev.map(s => s.id === service.id ? { ...s, is_active: nextStatus } : s));
    const { error } = await supabase.from('services').update({ is_active: nextStatus }).eq('id', service.id);
    if (error) {
      alert("Toggle failed");
      setServices(prev => prev.map(s => s.id === service.id ? { ...s, is_active: !nextStatus } : s));
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-indigo-600" size={48} /></div>;

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Catalog Manager</h2>
            <p className="text-slate-500 mt-1">Manage durations and dynamic pricing tiers</p>
          </div>
          {!isEditing && (
            <button onClick={() => setIsEditing(true)} className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95">
              <Plus size={20} /> New Service
            </button>
          )}
        </div>

        {/* EDITOR PANEL */}
        {isEditing && (
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-top-4">
            <div className="bg-slate-900 px-6 py-4 flex justify-between items-center text-white">
              <h3 className="font-bold flex items-center gap-2"><Info size={18} className="text-indigo-400" /> {formData.id ? 'Modify Service' : 'Define New Service'}</h3>
              <button onClick={resetForm} className="text-slate-400 hover:text-white transition-colors"><X size={24} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-12 gap-8">
              <div className="md:col-span-7 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Service Title</label>
                    <input required value={formData.title} onChange={e => handleTitleChange(e.target.value)} className="w-full p-3 bg-slate-50 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Type</label>
                    <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} className="w-full p-3 border rounded-lg bg-white">
                      <option value="single">Single</option>
                      <option value="combo">Combo</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Description</label>
                  <textarea rows={3} required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full p-3 bg-slate-50 border rounded-lg outline-none" />
                </div>

                {/* DYNAMIC PRICING SECTION */}
                <div className="space-y-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="text-xs font-bold text-slate-900 uppercase flex items-center gap-2">
                    <Tag size={14} className="text-indigo-600"/> Pricing Tiers (Duration & Price)
                  </label>
                  
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <input type="number" placeholder="Mins (e.g. 30)" value={tempDuration} onChange={e => setTempDuration(e.target.value)} className="w-full p-3 border rounded-lg text-sm" />
                    </div>
                    <div className="flex-1">
                      <input type="number" placeholder="Price (INR)" value={tempPrice} onChange={e => setTempPrice(e.target.value)} className="w-full p-3 border rounded-lg text-sm" />
                    </div>
                    <button type="button" onClick={addPricingTier} className="px-4 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700">Add</button>
                  </div>

                  <div className="space-y-2">
                    {formData.duration_minutes.map((dur: number, idx: number) => (
                      <div key={idx} className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200">
                        <div className="flex items-center gap-4">
                          <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-md font-bold text-sm">{dur} Mins</span>
                          <span className="font-bold text-slate-700">₹{formData.prices[idx]}</span>
                        </div>
                        <button type="button" onClick={() => removePricingTier(idx)} className="text-slate-300 hover:text-red-500"><Trash size={18}/></button>
                      </div>
                    ))}
                    {formData.duration_minutes.length === 0 && <p className="text-xs text-slate-400 italic text-center py-2">No pricing tiers added yet</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Key Benefits</label>
                  <div className="flex gap-2">
                    <input placeholder="Add benefit..." value={newBenefit} onChange={e => setNewBenefit(e.target.value)} className="flex-1 p-3 bg-slate-50 border rounded-lg outline-none" />
                    <button type="button" onClick={addBenefit} className="px-4 bg-slate-900 text-white rounded-lg">Add</button>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {formData.benefits.map((b: string, i: number) => (
                      <span key={i} className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full text-sm font-semibold">
                        {b} <button type="button" onClick={() => removeBenefit(i)}><MinusCircle size={16}/></button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="md:col-span-5 space-y-6">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Media</label>
                  <div className="relative group aspect-video bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl overflow-hidden flex items-center justify-center">
                    {formData.media_url ? (
                      formData.media_type === 'video' ? <PlayCircle size={40} className="text-indigo-600"/> : <img src={formData.media_url} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center"><UploadCloud size={40} className="text-slate-300" /><span className="mt-2 text-sm font-bold text-slate-400">Upload Media</span></div>
                    )}
                    <input type="file" accept="image/*,video/*" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                    {uploadingMedia && <div className="absolute inset-0 bg-white/80 flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600"/></div>}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2"><Link2 size={14} className="text-indigo-500" /> YouTube URL (Optional)</label>
                  <input placeholder="https://youtube.com/..." value={formData.yt_url || ''} onChange={e => setFormData({ ...formData, yt_url: e.target.value })} className="w-full p-3 border rounded-lg text-sm" />
                </div>

                <div className="flex justify-end gap-3 pt-10">
                  <button type="button" onClick={resetForm} className="px-6 py-3 font-bold text-slate-600">Discard</button>
                  <button disabled={isSaving || uploadingMedia} type="submit" className="flex items-center gap-2 px-10 py-3 bg-indigo-600 text-white font-bold rounded-xl">
                    {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />} Save Service
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* SERVICE GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map(service => (
            <div key={service.id} className={`bg-white rounded-2xl overflow-hidden border border-slate-200 hover:shadow-xl transition-all ${!service.is_active && 'opacity-60'}`}>
              <div className="relative h-48 bg-slate-900">
                <img src={service.media_url} className="h-full w-full object-cover" />
                <div className="absolute top-4 left-4"><span className="px-3 py-1 bg-sky-400 text-sky-900 rounded-full text-[10px] font-black">{service.type.toUpperCase()}</span></div>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-bold text-slate-800">{service.title}</h3>
                  <div className="text-right">
                    <div className="text-sm font-bold text-indigo-600">Starting from</div>
                    <div className="text-xl font-black text-slate-900">₹{Math.min(...service.prices)}</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {service.duration_minutes.map((m, i) => (
                    <span key={i} className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded">{m}m - ₹{service.prices[i]}</span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex gap-3">
                    <button onClick={() => handleEditClick(service)} className="text-slate-400 hover:text-indigo-600"><Edit2 size={20} /></button>
                    <button onClick={() => handleDelete(service.id)} className="text-slate-400 hover:text-red-500"><Trash2 size={20} /></button>
                  </div>
                  <button onClick={() => handleToggle(service)} className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-bold ${service.is_active ? 'text-green-600' : 'text-slate-400'}`}>{service.is_active ? 'LIVE' : 'HIDDEN'}</span>
                    {service.is_active ? <ToggleRight size={24} className="text-green-500" /> : <ToggleLeft size={24} className="text-slate-300" />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}