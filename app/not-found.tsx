import Link from 'next/link';
import { Home, ArrowRight } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen w-full bg-white flex items-center justify-center p-6 font-sans">
      <div className="max-w-2xl w-full text-center space-y-12">
        
        {/* Logo / 404 Visual */}
        <div className="space-y-4">
          <h1 className="text-[120px] md:text-[180px] leading-none font-bold tracking-tighter text-black">
            404<span className="text-[#289BD0]">.</span>
          </h1>
          <div className="flex justify-center items-center gap-2">
            <span className="text-2xl font-bold tracking-tighter uppercase">
              <span className="text-[#289BD0]">Chill</span> Thrive
            </span>
          </div>
        </div>

        {/* Messaging */}
        <div className="space-y-6">
          <h2 className="text-4xl md:text-5xl font-bold text-black tracking-tight">
            Lost in <span className="text-[#5DB4DB]">Recovery?</span>
          </h2>
          <p className="text-gray-500 text-lg font-light max-w-sm mx-auto leading-relaxed">
            This page has been moved or doesn't exist. Let's get you back to your session.
          </p>
        </div>

        {/* Action Button */}
        <div className="max-w-xs mx-auto pt-4">
          <Link 
            href="/"
            className="group flex items-center justify-between p-6 bg-[#F9F9F9] rounded-[32px] hover:bg-[#F0F9FF] transition-all duration-500 border-2 border-transparent hover:border-[#289BD0]/20"
          >
            <div className="text-left">
              <p className="text-[10px] font-black text-[#289BD0] uppercase tracking-[0.3em]">Return</p>
              <p className="text-xl font-bold text-black">Back to Home</p>
            </div>
            <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center group-hover:bg-[#289BD0] transition-colors duration-500">
              <Home size={20} />
            </div>
          </Link>
        </div>

        {/* Footer help */}
        <div className="pt-12">
          <p className="text-xs text-gray-300 font-bold uppercase tracking-[0.2em]">
            Need help? Contact support
          </p>
        </div>
      </div>
    </div>
  );
}