import React from 'react';
import { LayoutDashboard, Lightbulb, Search, Settings, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={cn(
      "group relative flex items-center gap-3 w-full px-4 py-3 rounded-2xl transition-all duration-300",
      active 
        ? "bg-brand-500/10 text-brand-500 shadow-[0_0_20px_rgba(99,102,241,0.1)]" 
        : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/30"
    )}
  >
    {active && (
      <motion.div
        layoutId="sidebar-active"
        className="absolute left-0 w-1 h-6 bg-brand-500 rounded-r-full"
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      />
    )}
    <Icon className={cn("w-5 h-5 transition-transform duration-300 group-hover:scale-110", active ? "text-brand-500" : "text-zinc-500")} />
    <span className="text-sm font-semibold tracking-tight">{label}</span>
  </button>
);

const Sidebar = ({ currentView, onViewChange }) => {
  return (
    <motion.div 
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-64 h-screen border-r border-zinc-800/50 bg-zinc-950/50 backdrop-blur-2xl flex flex-col p-6 fixed left-0 top-0 z-40"
    >
      <div className="flex items-center gap-3 mb-12 px-2">
        <div className="relative group">
          <div className="absolute -inset-2 bg-gradient-to-r from-brand-500 to-accent-purple rounded-xl opacity-20 group-hover:opacity-40 transition-opacity blur-lg" />
          <div className="relative w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-2xl">
            <TrendingUp className="w-6 h-6 text-brand-500" />
          </div>
        </div>
        <div>
          <h1 className="text-white text-lg font-heading font-bold tracking-tight leading-tight">TrendIntel</h1>
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em]">Geo-Intelligence</p>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-4 px-4">Menu</div>
        <SidebarItem 
          icon={LayoutDashboard} 
          label="Overview" 
          active={currentView === 'dashboard'} 
          onClick={() => onViewChange('dashboard')} 
        />
        <SidebarItem 
          icon={Search} 
          label="Market Explorer" 
          active={currentView === 'search'} 
          onClick={() => onViewChange('search')} 
        />
        <SidebarItem 
          icon={Lightbulb} 
          label="AI Strategist" 
          active={currentView === 'insights'} 
          onClick={() => onViewChange('insights')} 
        />
      </nav>

      <div className="mt-auto pt-6 border-t border-zinc-800/50">
        <SidebarItem icon={Settings} label="Global Settings" />
        <div className="mt-6 p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/50">
          <p className="text-xs text-zinc-500 mb-2">System Status</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-accent-emerald animate-pulse" />
            <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-wider">Operational</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Sidebar;
