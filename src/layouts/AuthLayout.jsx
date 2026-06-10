import React from 'react';
import { Outlet } from 'react-router-dom';
import { Heart, Wind, ShieldCheck, Sparkles } from 'lucide-react';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-theme-sec text-theme-text flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-theme-card border border-theme-border rounded-2xl overflow-hidden shadow-xl grid md:grid-cols-2">
        {/* Left Pane - Motivation / Wellness Theme */}
        <div className="hidden md:flex flex-col justify-between p-10 bg-gradient-to-br from-theme-primary to-theme-secondary text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -ml-20 -mb-20"></div>

          <div className="flex items-center gap-3 relative z-10">
            <div className="p-2 bg-white/10 rounded-xl text-white">
              <Sparkles className="w-6 h-6" />
            </div>
            <span className="font-display font-semibold text-xl tracking-tight text-white">Focus</span>
          </div>

          <div className="my-auto py-8 relative z-10 text-left">
            <h2 className="text-3xl font-bold font-display leading-tight mb-4 text-white">
              Rediscover the Beauty of the Real World
            </h2>
            <p className="text-white/90 text-sm leading-relaxed mb-6">
              Track your screen time, log healthy offline activities, build mindful habits, and improve your overall digital well-being.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Heart className="w-5 h-5 text-white/80" />
                <span className="text-xs text-white/90 font-medium">Reclaim hours of focused quality time.</span>
              </div>
              <div className="flex items-center gap-3">
                <Wind className="w-5 h-5 text-white/80" />
                <span className="text-xs text-white/90 font-medium">Reduce brain fog and restore peace of mind.</span>
              </div>
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-white/80" />
                <span className="text-xs text-white/90 font-medium">100% customizable goals and logs.</span>
              </div>
            </div>
          </div>

          <div className="text-xs text-white/80 relative z-10 text-left">
            © {new Date().getFullYear()} Focus. Build Better Digital Habits.
          </div>
        </div>

        {/* Right Pane - Form Output */}
        <div className="p-8 sm:p-10 flex flex-col justify-center bg-theme-card">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
