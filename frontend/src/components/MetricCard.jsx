import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

const MetricCard = ({ title, value, change, icon: Icon, isPositive, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5, ease: "easeOut" }}
      className="glass-card p-6 flex flex-col gap-6 hover-glow group"
    >
      <div className="flex justify-between items-start">
        <div className="relative">
          <div className="absolute -inset-2 bg-brand-500 rounded-lg opacity-10 group-hover:opacity-20 blur-lg transition-opacity" />
          <div className="relative p-2.5 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-zinc-400 group-hover:text-brand-500 transition-colors">
            <Icon size={20} />
          </div>
        </div>
        {change && (
          <div className={cn(
            "px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase flex items-center gap-1",
            isPositive 
              ? "bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/20" 
              : "bg-accent-rose/10 text-accent-rose border border-accent-rose/20"
          )}>
            {isPositive ? '▲' : '▼'} {Math.abs(change)}%
          </div>
        )}
      </div>
      <div>
        <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-2 group-hover:text-zinc-400 transition-colors">
          {title}
        </h3>
        <p className="text-white text-3xl font-heading font-extrabold tracking-tight group-hover:text-brand-500 transition-colors">
          {value}
        </p>
      </div>
      
      {/* Subtle Shimmer Overlay */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
      </div>
    </motion.div>
  );
};

export default MetricCard;
