import React from 'react';
import { motion } from 'framer-motion';

const SentimentCard = ({ sentiment }) => {
  if (!sentiment) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="glass-card p-8 flex flex-col h-full hover-glow group"
    >
      <div className="mb-10">
        <h2 className="text-lg font-heading font-bold text-white tracking-tight flex items-center gap-3">
          <span className="w-1.5 h-6 bg-accent-purple rounded-full block group-hover:bg-brand-500 transition-colors" />
          Sentiment Resonance
        </h2>
        <p className="text-xs text-zinc-500 font-medium tracking-wide">Public Emotional Indexing</p>
      </div>
      
      <div className="flex flex-col gap-10">
        <div className="flex items-center gap-4">
          <div className="text-6xl font-heading font-black text-white/90 drop-shadow-2xl">
            {sentiment.score}
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Aggregate</span>
            <span className="text-xs font-bold text-zinc-300">Net Score / 10.0</span>
          </div>
        </div>

        <div className="space-y-6">
          {/* Positive Bar */}
          <div className="group/bar">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-3 transition-colors group-hover/bar:text-zinc-300">
              <span className="text-zinc-500">Positive Reception</span>
              <span className="text-accent-emerald">{sentiment.positive}%</span>
            </div>
            <div className="w-full bg-zinc-900 border border-zinc-800 rounded-full h-3 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${sentiment.positive}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className="bg-accent-emerald h-full rounded-full shadow-[0_0_15px_rgba(16,185,129,0.3)]" 
              />
            </div>
          </div>

          {/* Neutral Bar */}
          <div className="group/bar">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-3 transition-colors group-hover/bar:text-zinc-300">
              <span className="text-zinc-500">Neutral Position</span>
              <span className="text-zinc-400">{sentiment.neutral}%</span>
            </div>
            <div className="w-full bg-zinc-900 border border-zinc-800 rounded-full h-3 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${sentiment.neutral}%` }}
                transition={{ duration: 1, delay: 0.6 }}
                className="bg-zinc-700 h-full rounded-full" 
              />
            </div>
          </div>

          {/* Negative Bar */}
          <div className="group/bar">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-3 transition-colors group-hover/bar:text-zinc-300">
              <span className="text-zinc-500">Negative Sentiment</span>
              <span className="text-accent-rose">{sentiment.negative}%</span>
            </div>
            <div className="w-full bg-zinc-900 border border-zinc-800 rounded-full h-3 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${sentiment.negative}%` }}
                transition={{ duration: 1, delay: 0.7 }}
                className="bg-accent-rose h-full rounded-full shadow-[0_0_15px_rgba(244,63,94,0.3)]" 
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SentimentCard;
