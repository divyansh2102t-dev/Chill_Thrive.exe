'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import {
  Plus, Edit2, Trash2, Save, X, ToggleLeft, ToggleRight, 
  Loader2, Layers, Users, UploadCloud, PlayCircle, 
  Tag, Link2, Info, ChevronRight, CheckCircle2
} from 'lucide-react';

interface Service {
  id: string;
  slug: string;
  title: string;
  description: string;
  type: 'single' | 'combo';
  duration_minutes: number[];
  benefits: string[];
  price: number;
  original_price?: number;
  currency: string;
  capacity: number;
  media_url: string;
  media_type: 'image' | 'video';
  yt_url?: string;
  badge?: 'POPULAR' | 'BEST_VALUE' | null;
  is_active: boolean;
  sort_order: number;
}

const DEFAULT_MEDIA = 'https://via.placeholder.com/600x400?text=No+Media+Uploaded';

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);

  const [formData, setFormData] = useState<any>({
    title: '',
    slug: '',
    description: '',
    price: 0,
    original_price: 0,
    duration_minutes: 60,
    type: 'single',
    capacity: 1,
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
    setFormData({ ...formData, media_url: data.publicUrl, media_type: ['mp4', 'webm'].includes(ext || '') ? 'video' : 'image' });
    setUploadingMedia(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const payload = {
      ...formData,
      duration_minutes: [Number(formData.duration_minutes)],
      benefits: Array.isArray(formData.benefits) ? formData.benefits : [],
      original_price: formData.original_price || null,
    };

    delete payload.id; // Clean ID for insert

    const { error } = formData.id 
      ? await supabase.from('services').update(payload).eq('id', formData.id)
      : await supabase.from('services').insert([payload]);

    if (error) alert(error.message);
    else { resetForm(); fetchServices(); }
    setIsSaving(false);
  };

  const handleDelete = async (id: string) => {
    // 1. Confirm intent
    const isConfirmed = window.confirm(
      "Permanently delete this service? This will also remove it from any active customer booking views."
    );
    if (!isConfirmed) return;

    // 2. Perform deletion
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', id);

    if (error) {
      // 3. Handle specific DB errors (like Foreign Key violations)
      console.error("Deletion failed:", error);
      alert(
        error.code === "23503" 
          ? "Cannot delete: This service is linked to existing bookings or other records. Deactivate it instead." 
          : `Error: ${error.message}`
      );
    } else {
      // 4. Update local state only on success
      setServices((prev) => prev.filter((s) => s.id !== id));
      
      // Optional: Reset form if the deleted item was being edited
      if (formData.id === id) resetForm();
    }
  };

  const handleToggle = async (service: Service) => {
    const next = !service.is_active;
    setServices(services.map(s => s.id === service.id ? { ...s, is_active: next } : s));
    await supabase.from('services').update({ is_active: next }).eq('id', service.id);
  };

  

  const handleEditClick = (service: Service) => {
    setFormData({ ...service, duration_minutes: service.duration_minutes[0] });
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setFormData({ title: '', slug: '', description: '', price: 0, original_price: 0, duration_minutes: 60, type: 'single', capacity: 1, benefits: [], media_url: '', media_type: 'image', yt_url: '', badge: null, is_active: true });
    setIsEditing(false);
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <div className="text-center space-y-4">
        <Loader2 className="animate-spin text-indigo-600 mx-auto" size={48} />
        <p className="text-slate-500 font-medium">Loading catalog...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Catalog Manager</h2>
            <p className="text-slate-500 mt-1">Manage your {services.length} services and promotional combos</p>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95"
            >
              <Plus size={20} /> New Service
            </button>
          )}
        </div>

        {/* EDITOR PANEL */}
        {isEditing && (
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="bg-slate-900 px-6 py-4 flex justify-between items-center">
              <h3 className="text-white font-bold flex items-center gap-2">
                <Info size={18} className="text-indigo-400" />
                {formData.id ? 'Modify Existing Service' : 'Define New Service'}
              </h3>
              <button onClick={resetForm} className="text-slate-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Left Column: Basic Details */}
              <div className="md:col-span-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Service Title</label>
                    <input required placeholder="E.g. Full Body Detox" value={formData.title} onChange={e => handleTitleChange(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Slug (URL)</label>
                    <input required placeholder="full-body-detox" value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} className="w-full p-3 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 font-mono text-sm" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Description</label>
                  <textarea rows={3} required placeholder="What makes this service special?" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Key Benefits (One per line)</label>
                  <textarea rows={4} placeholder="Detoxifies skin&#10;Improves blood flow" value={formData.benefits.join('\n')} 
                    onChange={e => setFormData({ ...formData, benefits: e.target.value.split('\n').filter(Boolean) })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-indigo-700" />
                </div>
              </div>

              {/* Right Column: Pricing & Meta */}
              <div className="md:col-span-4 space-y-6 bg-slate-50 p-6 rounded-xl border border-slate-100">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">TYPE</label>
                    <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} className="w-full p-2.5 border rounded-lg bg-white">
                      <option value="single">Single</option>
                      <option value="combo">Combo</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">BADGE</label>
                    <select value={formData.badge || ''} onChange={e => setFormData({ ...formData, badge: e.target.value || null })} className="w-full p-2.5 border rounded-lg bg-white">
                      <option value="">None</option>
                      <option value="POPULAR">Popular</option>
                      <option value="BEST_VALUE">Best Value</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">PRICE (INR)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 font-bold text-slate-400">₹</span>
                    <input type="number" required value={formData.price} onChange={e => setFormData({ ...formData, price: Number(e.target.value) })} className="w-full p-2.5 pl-8 border rounded-lg outline-none" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">ORIGINAL PRICE (FOR DISCOUNT)</label>
                  <input type="number" value={formData.original_price} onChange={e => setFormData({ ...formData, original_price: Number(e.target.value) })} className="w-full p-2.5 border rounded-lg outline-none" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">MINS</label>
                    <input type="number" value={formData.duration_minutes} onChange={e => setFormData({ ...formData, duration_minutes: Number(e.target.value) })} className="w-full p-2.5 border rounded-lg" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">CAPACITY</label>
                    <input type="number" value={formData.capacity} onChange={e => setFormData({ ...formData, capacity: Number(e.target.value) })} className="w-full p-2.5 border rounded-lg" />
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t">
                  <label className="text-xs font-bold text-slate-500 uppercase">Media Assets</label>
                  <div className="space-y-2">
                    <input type="file" accept="image/*,video/*" onChange={handleFileUpload} className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-indigo-50 file:text-indigo-700" />
                    <input placeholder="Or YouTube URL" value={formData.yt_url} onChange={e => setFormData({ ...formData, yt_url: e.target.value })} className="w-full p-2 text-sm border rounded bg-white" />
                  </div>
                </div>
              </div>

              <div className="md:col-span-12 flex justify-end gap-3 pt-6 border-t">
                <button type="button" onClick={resetForm} className="px-6 py-3 font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all">Discard</button>
                <button disabled={isSaving || uploadingMedia} type="submit" className="flex items-center gap-2 px-10 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 disabled:opacity-50">
                  {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                  {formData.id ? 'Update Service' : 'Publish Service'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* SERVICE GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map(service => (
            <div key={service.id} className={`group bg-white rounded-2xl overflow-hidden border border-slate-200 transition-all hover:shadow-2xl hover:-translate-y-1 ${!service.is_active && 'opacity-60'}`}>
              
              {/* Card Media */}
              <div className="relative h-56 bg-slate-900 overflow-hidden">
                {service.media_type === 'video' || service.yt_url ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-indigo-900/20 group-hover:bg-indigo-900/40 transition-all">
                    <PlayCircle className="text-white drop-shadow-lg" size={48} />
                    <span className="absolute bottom-3 right-3 bg-black/60 text-white text-[10px] px-2 py-1 rounded-md font-bold uppercase tracking-widest">Video Content</span>
                  </div>
                ) : (
                  <img src={service.media_url || DEFAULT_MEDIA} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                )}
                
                {/* Status Badge */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-tighter ${service.type === 'combo' ? 'bg-amber-400 text-amber-900' : 'bg-sky-400 text-sky-900'}`}>
                    {service.type.toUpperCase()}
                  </span>
                  {service.badge && (
                    <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-1 shadow-lg">
                      <Tag size={10} /> {service.badge}
                    </span>
                  )}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="text-xl font-bold text-slate-800 leading-tight">{service.title}</h3>
                  <div className="text-right">
                    <div className="text-2xl font-black text-indigo-600">₹{service.price}</div>
                    {service.original_price && (
                      <div className="text-xs text-slate-400 line-through">₹{service.original_price}</div>
                    )}
                  </div>
                </div>

                <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed h-10">
                  {service.description}
                </p>

                <div className="flex items-center gap-4 py-2 border-y border-slate-50">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Layers size={16} className="text-indigo-400" />
                    <span className="text-xs font-bold">{service.duration_minutes[0]}m</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Users size={16} className="text-indigo-400" />
                    <span className="text-xs font-bold">{service.capacity} Pax</span>
                  </div>
                  <div className="ml-auto text-[10px] font-mono text-slate-300 uppercase">/{service.slug}</div>
                </div>

                {/* Benefits Preview */}
                <div className="flex flex-wrap gap-2">
                  {service.benefits.slice(0, 2).map((b, i) => (
                    <span key={i} className="flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded">
                      <CheckCircle2 size={10} className="text-green-500" /> {b}
                    </span>
                  ))}
                  {service.benefits.length > 2 && <span className="text-[10px] font-bold text-slate-300">+{service.benefits.length - 2} more</span>}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="flex items-center justify-between px-6 py-4 bg-slate-50/80 border-t border-slate-100">
                <div className="flex gap-4">
                  <button onClick={() => handleEditClick(service)} className="text-slate-400 hover:text-indigo-600 transition-colors">
                    <Edit2 size={20} />
                  </button>
                  <button onClick={() => handleDelete(service.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                    <Trash2 size={20} />
                  </button>
                </div>
                
                <button onClick={() => handleToggle(service)} className="flex items-center gap-2 group/btn">
                  <span className={`text-[10px] font-bold ${service.is_active ? 'text-green-600' : 'text-slate-400'}`}>
                    {service.is_active ? 'LIVE' : 'HIDDEN'}
                  </span>
                  {service.is_active 
                    ? <ToggleRight size={28} className="text-green-500 group-hover/btn:scale-110 transition-transform" /> 
                    : <ToggleLeft size={28} className="text-slate-300 group-hover/btn:scale-110 transition-transform" />
                  }
                </button>
              </div>
            </div>
          ))}
        </div>

        {services.length === 0 && !loading && (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
            <UploadCloud className="mx-auto text-slate-300 mb-4" size={64} />
            <h3 className="text-xl font-bold text-slate-800">No Services Found</h3>
            <p className="text-slate-500">Get started by creating your first service or combo.</p>
          </div>
        )}
      </div>
    </div>
  );
}