'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import {
  Plus, Trash2, Save, Eye, EyeOff, Loader2, Edit2, Upload, Image as ImageIcon
} from 'lucide-react';

/* ================= TYPES ================= */
interface Testimonial {
    id?: string;
    type: 'text' | 'video'; 
    name: string;
    role?: string; 
    feedback: string | null;
    rating: number | null;
    video_url: string | null;
    thumbnail_url: string | null;
    is_visible: boolean;
    created_at?: string;
}

interface Founder {
    id: string;
    founder_name: string;
    photo_url: string;
    quote: string;
    story_journey: string;
    story_vision: string;
    story_why: string;
    mission: string;
    updated_at?: string;
}

interface AwarenessRow {
  id: string;
  section_key: string;
  title: string;
  description: string;
  benefits: string[];
  media_url: string;
  is_active: boolean;
}

interface GalleryEvent {
  id: string;
  title: string;
  description: string;
  category: string;
}

interface GalleryImage {
  id: string;
  event_id: string;
  image_url: string;
}

/* ================= UI CLASSES ================= */
const input = 'w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white';
const textarea = 'w-full rounded-md border border-slate-300 px-3 py-2 text-sm min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white';
const labelClass = 'text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block';
const primaryBtn = 'inline-flex items-center gap-2 rounded-md bg-[#0A2540] px-4 py-2 text-sm font-semibold text-white hover:bg-[#081d33] transition-colors disabled:opacity-50';
const secondaryBtn = 'inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors';

export default function ContentManager() {
  const [tab, setTab] = useState<'gallery' | 'testimonials' | 'founder' | 'awareness'>('gallery');
  const [loading, setLoading] = useState(false);

  // Data States
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [founder, setFounder] = useState<Founder | null>(null);
  const [awarenessRows, setAwarenessRows] = useState<AwarenessRow[]>([]);
  const [events, setEvents] = useState<GalleryEvent[]>([]);
  const [activeEvent, setActiveEvent] = useState<GalleryEvent | null>(null);
  const [images, setImages] = useState<GalleryImage[]>([]);

  // Action States (Merged duplicates)
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [isSavingEvent, setIsSavingEvent] = useState(false);

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      const [tRes, fRes, aRes, eRes] = await Promise.all([
        supabase.from('testimonials').select('*').order('created_at', { ascending: false }),
        supabase.from('founder_content').select('*').maybeSingle(),
        supabase.from('awareness').select('*').order('section_key', { ascending: true }),
        supabase.from('gallery_events').select('*')
      ]);

      setTestimonials(tRes.data || []);
      setFounder(fRes.data);
      setAwarenessRows(aRes.data || []);
      setEvents(eRes.data || []);
      setLoading(false);
    };
    loadAll();
  }, []);

  const loadImages = async (eventId: string) => {
    const { data } = await supabase.from('gallery_images').select('*').eq('event_id', eventId);
    setImages(data || []);
  };

  /* ================= HELPERS ================= */
  const uploadFile = async (file: File, folder: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).slice(2, 9)}_${Date.now()}.${fileExt}`;
    const path = `${folder}/${fileName}`;

    const { error } = await supabase.storage.from('services-media').upload(path, file);
    if (error) throw error;

    return supabase.storage.from('services-media').getPublicUrl(path).data.publicUrl;
  };

  /* ================= AWARENESS ACTIONS ================= */
  const handleAwarenessUpload = async (file: File, index: number) => {
    const row = awarenessRows[index];
    setUploadingId(row.id);
    try {
      const url = await uploadFile(file, 'awareness');
      const updated = [...awarenessRows];
      updated[index].media_url = url;
      setAwarenessRows(updated);
    } catch (e: any) {
      alert("Upload failed: " + e.message);
    } finally {
      setUploadingId(null);
    }
  };

  const saveAwareness = async () => {
    setIsSaving(true);
    const { error } = await supabase.from('awareness').upsert(awarenessRows);
    setIsSaving(false);
    if (error) alert(error.message);
    else alert("Awareness content updated!");
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 bg-slate-50 p-6 min-h-screen">
      
      {/* TABS */}
      <div className="flex gap-2 rounded-xl border bg-white p-1.5 shadow-sm sticky top-4 z-20">
        {['founder', 'testimonials', 'gallery', 'awareness'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t as any)}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-bold transition-all
              ${tab === t ? 'bg-[#0A2540] text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {loading && <div className="flex flex-col items-center py-20 text-slate-400"><Loader2 className="animate-spin mb-2" /> Loading...</div>}

      {/* AWARENESS TAB */}
      {!loading && tab === 'awareness' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white p-6 rounded-xl border shadow-sm">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Awareness Management</h2>
              <p className="text-sm text-slate-500">Standardized educational sections for your website.</p>
            </div>
            <button className={primaryBtn} onClick={saveAwareness} disabled={isSaving}>
              {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
              Save All Changes
            </button>
          </div>

          <div className="grid gap-6">
            {awarenessRows.map((row, idx) => (
              <div key={row.id} className="bg-white border rounded-xl overflow-hidden shadow-sm grid grid-cols-1 lg:grid-cols-12">
                <div className="lg:col-span-3 bg-slate-50 p-6 border-r flex flex-col items-center justify-center space-y-3">
                  <label className={labelClass}>Section Media</label>
                  <div className="relative group aspect-video lg:aspect-square w-full bg-white rounded-lg border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden">
                    {row.media_url ? (
                      <img src={row.media_url} alt="preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="text-slate-300" size={32} />
                    )}
                    <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                      <div className="text-white text-xs font-bold flex items-center gap-2">
                        {uploadingId === row.id ? <Loader2 className="animate-spin" /> : <Upload size={14} />}
                        Upload Image
                      </div>
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleAwarenessUpload(e.target.files[0], idx)} />
                    </label>
                  </div>
                </div>

                <div className="lg:col-span-5 p-6 space-y-4">
                  <div>
                    <label className={labelClass}>Display Title</label>
                    <input className={input} value={row.title ?? ''} onChange={e => {
                      const updated = [...awarenessRows];
                      updated[idx].title = e.target.value;
                      setAwarenessRows(updated);
                    }} />
                  </div>
                  <div>
                    <label className={labelClass}>Description</label>
                    <textarea className={textarea} value={row.description ?? ''} onChange={e => {
                      const updated = [...awarenessRows];
                      updated[idx].description = e.target.value;
                      setAwarenessRows(updated);
                    }} />
                  </div>
                </div>

                <div className="lg:col-span-4 p-6 bg-slate-50/50">
                  <label className={labelClass}>Benefits (one per line)</label>
                  <textarea 
                    className={`${textarea} min-h-[160px] text-xs font-medium`} 
                    placeholder="Enter benefits..."
                    value={row.benefits?.join('\n') ?? ''} 
                    onChange={e => {
                      const updated = [...awarenessRows];
                      updated[idx].benefits = e.target.value.split('\n').filter(v => v.trim() !== '');
                      setAwarenessRows(updated);
                    }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* GALLERY TAB */}
      {!loading && tab === 'gallery' && (
        <div className="bg-white border rounded-xl p-6 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-8 min-h-[600px]">
          <div className="space-y-4 border-r pr-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-800">Events</h3>
              <button 
                className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                onClick={() => {
                  setActiveEvent({ 
                    id: crypto.randomUUID(), 
                    title: '', 
                    description: '', 
                    category: 'ice_bath' 
                  });
                  setImages([]); 
                }}
              >
                <Plus size={20} />
              </button>
            </div>
            
            <div className="space-y-2 overflow-y-auto max-h-[500px] pr-2">
              {events.map(ev => (
                <button 
                  key={ev.id} 
                  onClick={() => { setActiveEvent(ev); loadImages(ev.id); }}
                  className={`w-full text-left p-3 rounded-xl border text-sm transition-all
                    ${activeEvent?.id === ev.id 
                      ? 'bg-[#0A2540] text-white border-[#0A2540] shadow-md' 
                      : 'hover:bg-slate-50 border-slate-200 text-slate-600'}`}
                >
                  <p className="font-semibold truncate">{ev.title || 'Draft Event'}</p>
                  <p className={`text-[10px] uppercase tracking-wider ${activeEvent?.id === ev.id ? 'text-blue-200' : 'text-slate-400'}`}>
                     {ev.category.replace('_', ' ')}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-3 space-y-8">
            {activeEvent ? (
              <>
                <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className={labelClass}>Event Title</label>
                      <input className={`${input} !text-lg !font-bold`} value={activeEvent.title ?? ''} onChange={e => setActiveEvent({ ...activeEvent, title: e.target.value })} />
                    </div>
                    <div>
                      <label className={labelClass}>Category</label>
                      <select className={input} value={activeEvent.category} onChange={e => setActiveEvent({ ...activeEvent, category: e.target.value })}>
                        <option value="ice_bath">Ice Bath</option>
                        <option value="community_events">Community Events</option>
                        <option value="workshops">Workshops</option>
                        <option value="behind_the_scenes">Behind the Scenes</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className={labelClass}>Event Description</label>
                      <textarea className={textarea} value={activeEvent.description ?? ''} onChange={e => setActiveEvent({ ...activeEvent, description: e.target.value })} />
                    </div>
                  </div>
                  <div className="flex justify-end pt-2">
                    <button className={primaryBtn} onClick={async () => {
                      setIsSavingEvent(true);
                      await supabase.from('gallery_events').upsert(activeEvent);
                      setIsSavingEvent(false);
                      alert("Saved!");
                    }}>
                      {isSavingEvent ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Save Event
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h4 className="font-bold text-slate-700">Event Photos ({images.length})</h4>
                    <label className={secondaryBtn + " cursor-pointer"}>
                      <Upload size={16} /> Add Photos
                      <input type="file" multiple className="hidden" onChange={async e => {
                        const files = Array.from(e.target.files || []);
                        setIsUploadingImages(true);
                        for (const f of files) {
                          const url = await uploadFile(f, 'gallery');
                          await supabase.from('gallery_images').insert({ event_id: activeEvent.id, image_url: url });
                        }
                        await loadImages(activeEvent.id);
                        setIsUploadingImages(false);
                      }} />
                    </label>
                  </div>
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                    {images.map(img => (
                      <div key={img.id} className="relative aspect-square rounded-xl border overflow-hidden group">
                        <img src={img.image_url} className="object-cover w-full h-full" />
                        <button className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" onClick={async () => {
                          await supabase.from('gallery_images').delete().eq('id', img.id);
                          setImages(ims => ims.filter(i => i.id !== img.id));
                        }}><Trash2 size={14}/></button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : <div className="h-full flex items-center justify-center text-slate-400 italic">Select an event...</div>}
          </div>
        </div>
      )}

      {/* FOUNDER TAB */}
      {!loading && tab === 'founder' && founder && (
        <div className="max-w-4xl mx-auto bg-white border rounded-xl p-8 shadow-sm space-y-8">
          <div className="flex justify-between items-end border-b pb-6">
            <h2 className="text-2xl font-bold">Founder Profile</h2>
            <button className={primaryBtn} onClick={async () => {
              setIsSaving(true);
              await supabase.from('founder_content').update(founder).eq('id', founder.id);
              setIsSaving(false);
              alert("Saved!");
            }}>
              {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Save Profile
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative aspect-[3/4] rounded-2xl border-2 border-dashed overflow-hidden bg-slate-50 group cursor-pointer">
              {founder.photo_url ? <img src={founder.photo_url} className="w-full h-full object-cover" /> : <ImageIcon className="m-auto mt-20 text-slate-300" size={48} />}
              <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs font-bold cursor-pointer">
                <Upload size={20} className="mb-2" /> CHANGE PHOTO
                <input type="file" className="hidden" onChange={async e => {
                  if(e.target.files?.[0]) {
                    const url = await uploadFile(e.target.files[0], 'founder');
                    setFounder({...founder, photo_url: url});
                  }
                }} />
              </label>
            </div>
            <div className="md:col-span-2 space-y-4">
              <div><label className={labelClass}>Name</label><input className={input} value={founder.founder_name ?? ''} onChange={e => setFounder({...founder, founder_name: e.target.value})} /></div>
              <div><label className={labelClass}>Quote</label><textarea className={textarea} value={founder.quote ?? ''} onChange={e => setFounder({...founder, quote: e.target.value})} /></div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="md:col-span-3"><label className={labelClass}>Mission</label><textarea className={textarea} value={founder.mission ?? ''} onChange={e => setFounder({...founder, mission: e.target.value})} /></div>
             <div><label className={labelClass}>Journey</label><textarea className={textarea} value={founder.story_journey ?? ''} onChange={e => setFounder({...founder, story_journey: e.target.value})} /></div>
             <div><label className={labelClass}>Vision</label><textarea className={textarea} value={founder.story_vision ?? ''} onChange={e => setFounder({...founder, story_vision: e.target.value})} /></div>
             <div><label className={labelClass}>Why</label><textarea className={textarea} value={founder.story_why ?? ''} onChange={e => setFounder({...founder, story_why: e.target.value})} /></div>
          </div>
        </div>
      )}

      {/* TESTIMONIALS TAB */}
      {!loading && tab === 'testimonials' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white p-6 rounded-xl border shadow-sm">
            <h2 className="text-xl font-bold">Client Testimonials</h2>
            <button className={primaryBtn} onClick={() => setEditingTestimonial({ 
              type: 'text', // FIX: Included the required 'type' property
              name: '', 
              feedback: '', 
              rating: 5, 
              is_visible: true, 
              thumbnail_url: '', 
              video_url: '' 
            })}>
              <Plus size={16} /> New Testimonial
            </button>
          </div>

          {editingTestimonial && (
            <div className="bg-white border-2 border-blue-200 rounded-xl p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelClass}>Name</label><input className={input} value={editingTestimonial.name ?? ''} onChange={e => setEditingTestimonial({...editingTestimonial, name: e.target.value})} /></div>
                <div><label className={labelClass}>Type</label>
                  <select className={input} value={editingTestimonial.type} onChange={e => setEditingTestimonial({...editingTestimonial, type: e.target.value as any})}>
                    <option value="text">Text</option>
                    <option value="video">Video</option>
                  </select>
                </div>
                <div className="col-span-2"><label className={labelClass}>Feedback</label><textarea className={textarea} value={editingTestimonial.feedback ?? ''} onChange={e => setEditingTestimonial({...editingTestimonial, feedback: e.target.value})} /></div>
              </div>
              <div className="flex justify-end gap-2">
                <button className={secondaryBtn} onClick={() => setEditingTestimonial(null)}>Cancel</button>
                <button className={primaryBtn} onClick={async () => {
                  await supabase.from('testimonials').upsert(editingTestimonial);
                  setEditingTestimonial(null);
                  window.location.reload();
                }}>Save</button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map(t => (
              <div key={t.id} className="bg-white p-4 border rounded-xl shadow-sm relative group">
                <div className="flex items-center gap-3 mb-3">
                   <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden">
                     {t.thumbnail_url && <img src={t.thumbnail_url} className="w-full h-full object-cover" />}
                   </div>
                   <h4 className="font-bold text-sm">{t.name}</h4>
                </div>
                <p className="text-xs text-slate-600 italic line-clamp-3">"{t.feedback}"</p>
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1 hover:bg-slate-100 rounded" onClick={() => setEditingTestimonial(t)}><Edit2 size={12}/></button>
                  <button className="p-1 hover:bg-red-50 text-red-500 rounded" onClick={async () => {
                    await supabase.from('testimonials').delete().eq('id', t.id);
                    setTestimonials(ts => ts.filter(x => x.id !== t.id));
                  }}><Trash2 size={12}/></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}