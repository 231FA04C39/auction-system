import React from "react";
import { Link } from "react-router";

export const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-slate-900 min-h-[90vh] flex items-center justify-center">
      {/* Dynamic Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] rounded-full bg-violet-600/30 blur-[120px] mix-blend-screen" />
        <div className="absolute -bottom-[30%] -right-[10%] w-[70%] h-[70%] rounded-full bg-fuchsia-600/30 blur-[120px] mix-blend-screen" />
        <div className="absolute top-[20%] left-[20%] w-[30%] h-[30%] rounded-full bg-cyan-400/20 blur-[100px] mix-blend-screen mix-blend-screen" />
      </div>
      
      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik0wIDAuNWg0ME0wIDQwVjAiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIvPjwvc3ZnPg==')] opacity-40 pointer-events-none"></div>

      <div className="relative max-w-7xl mx-auto px-4 z-10">
        <div className="text-center max-w-4xl mx-auto flex flex-col items-center">
          {/* Glowing Badge */}
          <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 backdrop-blur-md px-5 py-2.5 rounded-full mb-10 shadow-2xl shadow-indigo-500/20">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]"></span>
            </span>
            <span className="text-sm font-medium text-cyan-50 tracking-wide uppercase letter-spacing-tightest">Active Global Bidding</span>
          </div>

          <h1 className="text-6xl sm:text-7xl md:text-8xl font-black text-white tracking-tighter leading-[1.05] mb-8">
            The Future of <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400 animate-gradient-x">
              Digital Auctions
            </span>
          </h1>
          
          <p className="text-xl sm:text-2xl text-slate-300/80 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
            Experience real-time bidding, unmatched security, and instant payouts on the world's most advanced auction protocol.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-5 justify-center w-full sm:w-auto">
            <Link
              to="/signup"
              className="group relative inline-flex items-center justify-center bg-white text-slate-900 px-8 py-4 rounded-2xl font-bold text-lg hover:scale-105 active:scale-95 transition-all duration-300 shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)] overflow-hidden"
            >
              <div className="absolute inset-0 rounded-2xl pointer-events-none group-hover:bg-cyan-100/40 transition-colors" />
              <span className="relative z-10 flex items-center">
                Start Bidding Now
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </Link>
            
            <Link
              to="/login"
              className="inline-flex items-center justify-center bg-white/5 border border-white/10 text-white backdrop-blur-md px-8 py-4 rounded-2xl hover:bg-white/10 active:scale-95 transition-all font-semibold text-lg"
            >
              Access Dashboard
            </Link>
          </div>

          {/* Social Proof */}
          <div className="mt-20 pt-10 border-t border-white/10 w-full">
            <p className="text-sm font-medium text-slate-500 uppercase tracking-widest mb-8">Trusted by global collectors</p>
            <div className="flex flex-wrap justify-center gap-10 opacity-60 mix-blend-luminosity">
               <div className="text-2xl font-black italic tracking-tighter text-white">STRIPE</div>
               <div className="text-2xl font-black tracking-widest text-white">RAZORPAY</div>
               <div className="text-2xl font-black uppercase text-white tracking-widest">CLOUDINARY</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
