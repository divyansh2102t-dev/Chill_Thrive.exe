"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { 
  User, 
  Phone, 
  MessageSquare, 
  Calendar, 
  Trash2, 
  Search,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import FullPageLoader from "@/components/FullPageLoader";

interface Inquiry {
  id: string;
  created_at: string;
  full_name: string;
  phone_number: string;
  message: string;
}

export default function AdminInquiries() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("inquiries")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setInquiries(data || []);
    } catch (err) {
      console.error("Error fetching inquiries:", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteInquiry = async (id: string) => {
    if (!confirm("Are you sure you want to remove this inquiry?")) return;
    
    const { error } = await supabase.from("inquiries").delete().eq("id", id);
    if (!error) {
      setInquiries(inquiries.filter(iq => iq.id !== id));
    }
  };

  const filteredInquiries = inquiries.filter(iq => 
    iq.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    iq.phone_number.includes(searchTerm)
  );

  return (
    <div className="bg-white min-h-screen font-sans text-black pb-24">
      {/* ---------- HEADER SECTION ---------- */}
      <section className="pt-24 pb-12 px-6">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <h1 className="text-[64px] md:text-[82px] leading-none font-bold tracking-tighter">
              Admin <span className="text-[#289BD0]">Portal</span>
            </h1>
            <p className="text-sm font-black tracking-[0.3em] uppercase text-gray-400">
              Manage incoming user inquiries
            </p>
          </div>

          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text"
              placeholder="Search by name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#F9F9F9] border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-[#289BD0] transition-all"
            />
          </div>
        </div>
      </section>

      {/* ---------- INQUIRIES GRID ---------- */}
      <main className="max-w-[1200px] mx-auto px-6">
        {!loading && filteredInquiries.length === 0 ? (
          <div className="text-center py-24 bg-[#F9F9F9] rounded-[40px]">
             <p className="text-gray-400 font-medium">No inquiries found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredInquiries.map((iq) => (
              <div 
                key={iq.id} 
                className="bg-[#F9F9F9] rounded-[32px] p-8 md:p-10 flex flex-col lg:flex-row gap-8 transition-all hover:shadow-xl hover:shadow-blue-100/50 group"
              >
                {/* User Info Column */}
                <div className="lg:w-1/3 space-y-6">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black tracking-widest uppercase text-[#289BD0]">Customer</span>
                    <h3 className="text-3xl font-bold flex items-center gap-3">
                      {iq.full_name}
                      <CheckCircle2 size={20} className="text-[#289BD0] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-4 text-gray-600">
                      <div className="bg-white p-2 rounded-lg shadow-sm">
                        <Phone size={16} className="text-black" />
                      </div>
                      <span className="font-medium">{iq.phone_number}</span>
                    </div>
                    <div className="flex items-center gap-4 text-gray-400">
                      <div className="bg-white p-2 rounded-lg shadow-sm">
                        <Calendar size={16} />
                      </div>
                      <span className="text-xs uppercase tracking-widest font-bold">
                        {new Date(iq.created_at).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Message Column */}
                <div className="flex-1 bg-white rounded-[24px] p-8 border border-black/5 relative">
                  <span className="text-[10px] font-black tracking-widest uppercase text-gray-300 absolute top-6 right-8">
                    Message
                  </span>
                  <MessageSquare className="text-[#F0F9FF] absolute bottom-6 right-8 w-16 h-16 -scale-x-100" />
                  <p className="text-lg leading-relaxed text-gray-700 relative z-10">
                    "{iq.message}"
                  </p>
                </div>

                {/* Action Column */}
                <div className="lg:w-auto flex items-center">
                  <Button 
                    variant="ghost" 
                    onClick={() => deleteInquiry(iq.id)}
                    className="h-14 w-14 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-colors text-gray-300"
                  >
                    <Trash2 size={24} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Stats Summary */}
      {!loading && (
        <div className="fixed bottom-8 right-8 bg-black text-white px-6 py-3 rounded-full flex items-center gap-4 shadow-2xl">
          <span className="text-[10px] font-black uppercase tracking-widest">Total Inquiries</span>
          <span className="text-xl font-bold text-[#289BD0]">{inquiries.length}</span>
        </div>
      )}
    </div>
  );
}