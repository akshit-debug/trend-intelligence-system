import React from 'react';
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

const TrendTable = ({ trends }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass-card overflow-hidden"
    >
      <div className="px-8 py-6 border-b border-zinc-800/50 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-heading font-bold text-white tracking-tight">Market Momentum</h2>
          <p className="text-xs text-zinc-500 font-medium tracking-wide">Live Trend Surveillance</p>
        </div>
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all">
          View All <ArrowRight size={14} />
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-zinc-400">
          <thead className="bg-zinc-900/50 text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em]">
            <tr>
              <th className="px-8 py-4">Security / Keyword</th>
              <th className="px-8 py-4">Total Mentions</th>
              <th className="px-8 py-4">Weekly Flux %</th>
              <th className="px-8 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {trends.map((trend, i) => {
              const isRising = trend.status.toLowerCase() === 'rising';
              return (
                <motion.tr 
                  key={trend.id} 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + (i * 0.05) }}
                  className="group hover:bg-zinc-800/20 transition-all duration-300"
                >
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-brand-500/40 group-hover:bg-brand-500 transition-colors" />
                      <span className="font-semibold text-zinc-200 group-hover:text-white transition-colors">{trend.keyword}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 font-mono text-zinc-400 group-hover:text-zinc-300">
                    {trend.mentions.toLocaleString()}
                  </td>
                  <td className="px-8 py-5">
                    <span className={cn(
                      "font-bold text-xs",
                      trend.growth >= 0 ? "text-accent-emerald" : "text-accent-rose"
                    )}>
                      {trend.growth >= 0 ? '+' : ''}{trend.growth}%
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className={cn(
                      "inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase",
                      isRising 
                        ? "bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/20" 
                        : "bg-accent-rose/10 text-accent-rose border border-accent-rose/20"
                    )}>
                      {isRising ? <TrendingUp size={12} strokeWidth={3} /> : <TrendingDown size={12} strokeWidth={3} />}
                      {trend.status}
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default TrendTable;
