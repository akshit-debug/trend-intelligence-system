import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { motion } from 'framer-motion';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const val = payload[0].value;
    const isPositive = val >= 0;
    return (
      <div className="glass-card bg-zinc-950 border-zinc-800 p-4 shadow-2xl">
        <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-2">{label}</p>
        <p className={`text-lg font-heading font-black ${isPositive ? 'text-accent-emerald' : 'text-accent-rose'}`}>
          {isPositive ? '+' : ''}{val}% <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Growth</span>
        </p>
      </div>
    );
  }
  return null;
};

const GrowthBarChart = ({ data }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.5 }}
      className="glass-card p-8 w-full h-[400px] flex flex-col"
    >
      <div className="flex justify-between items-center mb-8 px-2">
        <div>
          <h2 className="text-lg font-heading font-bold text-white tracking-tight">Growth Archetypes</h2>
          <p className="text-xs text-zinc-500 font-medium tracking-wide">Comparative Velocity Mapping</p>
        </div>
      </div>
      <div className="w-full h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#18181b" vertical={false} />
            <XAxis 
              dataKey="keyword" 
              stroke="#52525b" 
              tick={{ fill: '#52525b', fontSize: 10, fontWeight: '700' }} 
              axisLine={false} 
              tickLine={false}
              tickFormatter={(value) => value.length > 8 ? `${value.substring(0, 8)}..` : value}
            />
            <YAxis 
              stroke="#52525b" 
              tick={{ fill: '#52525b', fontSize: 10, fontWeight: '700' }} 
              axisLine={false} 
              tickLine={false} 
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#18181b', opacity: 0.4 }} />
            <Bar dataKey="growth" radius={[8, 8, 0, 0]} animationDuration={1000}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.growth >= 0 ? '#10b981' : '#f43f5e'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default GrowthBarChart;
