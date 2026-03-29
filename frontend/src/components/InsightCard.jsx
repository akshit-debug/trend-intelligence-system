import React from 'react';
import { AlertCircle, Zap, ShieldAlert, Hexagon } from 'lucide-react';
import { motion } from 'framer-motion';

const InsightCard = ({ insight, index }) => {
  const getSeverityStyles = (severity) => {
    switch(severity) {
      case 'high':
        return {
          bg: 'bg-accent-rose/5 group-hover:bg-accent-rose/10',
          border: 'border-accent-rose/20 group-hover:border-accent-rose/40',
          glow: 'bg-accent-rose',
          icon: <ShieldAlert size={20} className="text-accent-rose" />,
          title: 'text-accent-rose'
        };
      case 'medium':
        return {
          bg: 'bg-brand-500/5 group-hover:bg-brand-500/10',
          border: 'border-brand-500/20 group-hover:border-brand-500/40',
          glow: 'bg-brand-500',
          icon: <Zap size={20} className="text-brand-500" />,
          title: 'text-brand-500'
        };
      default:
        return {
          bg: 'bg-zinc-800/20 group-hover:bg-zinc-800/40',
          border: 'border-zinc-800 group-hover:border-zinc-700',
          glow: 'bg-zinc-500',
          icon: <AlertCircle size={20} className="text-zinc-500" />,
          title: 'text-zinc-200'
        };
    }
  };

  const style = getSeverityStyles(insight.severity);

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`relative p-6 rounded-3xl border ${style.border} ${style.bg} transition-all duration-300 group hover:-translate-y-1 hover:shadow-2xl overflow-hidden`}
    >
      <div className="flex gap-6">
        <div className="flex-shrink-0">
          <div className="relative">
            <div className={`absolute -inset-2 ${style.glow} rounded-full opacity-0 group-hover:opacity-20 blur-xl transition-opacity`} />
            <div className="relative w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
               {style.icon}
            </div>
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className={`font-heading font-extrabold text-lg ${style.title}`}>{insight.title}</h3>
            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest bg-zinc-900/50 border border-zinc-800 px-2 py-1 rounded">#{insight.severity}</span>
          </div>
          <p className="text-zinc-400 text-sm leading-relaxed mb-6 font-medium">
            {insight.description}
          </p>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 group-hover:text-white transition-colors">
                <Hexagon size={12} className="text-brand-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Signal Source: {insight.related_keyword}</span>
             </div>
             <div className="h-px flex-1 bg-zinc-800/50" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default InsightCard;
