import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart
} from 'recharts';
import { motion } from 'framer-motion';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card bg-zinc-950 border-zinc-800 p-4 shadow-2xl">
        <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-3">{label}</p>
        <div className="space-y-2">
          {payload.map((entry, index) => (
            <p key={index} className="text-xs flex items-center justify-between gap-6">
              <span className="flex items-center gap-2 font-semibold text-zinc-300">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
                {entry.name}
              </span>
              <span className="font-mono font-bold text-white ml-auto">{entry.value.toLocaleString()}</span>
            </p>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const TrendLineChart = ({ data, lines }) => {
  const colors = ['#6366f1', '#a855f7', '#06b6d4', '#10b981', '#f43f5e'];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="glass-card w-full h-[450px] p-8 flex flex-col group"
    >
      <div className="flex justify-between items-center mb-8 px-2">
        <div>
          <h2 className="text-lg font-heading font-bold text-white flex items-center gap-3">
            <span className="w-1.5 h-6 bg-brand-500 rounded-full block" />
            Temporal Intelligence
          </h2>
          <p className="text-xs text-zinc-500 font-medium tracking-wide">Historical Mention Volatility</p>
        </div>
        <div className="flex gap-2">
          <div className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-[10px] font-bold text-zinc-400">7-Day Delta</div>
        </div>
      </div>
      
      <div className="w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              {lines.map((line, i) => (
                <linearGradient key={`gradient-${line}`} id={`color-${i}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors[i % colors.length]} stopOpacity={0.2}/>
                  <stop offset="95%" stopColor={colors[i % colors.length]} stopOpacity={0}/>
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#18181b" vertical={false} />
            <XAxis 
              dataKey="date" 
              stroke="#52525b" 
              tick={{ fill: '#52525b', fontSize: 10, fontBold: '700' }} 
              axisLine={false} 
              tickLine={false} 
              tickFormatter={(val) => {
                const dt = new Date(val);
                return `${dt.getMonth() + 1}/${dt.getDate()}`;
              }}
            />
            <YAxis 
              stroke="#52525b" 
              tick={{ fill: '#52525b', fontSize: 10, fontBold: '700' }} 
              axisLine={false} 
              tickLine={false}
              tickFormatter={(val) => val >= 1000 ? `${(val/1000).toFixed(0)}k` : val}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#27272a', strokeWidth: 2 }} />
            <Legend 
              wrapperStyle={{ fontSize: '10px', color: '#52525b', fontWeight: 'bold', paddingTop: '20px', textTransform: 'uppercase', letterSpacing: '1px' }} 
              iconType="circle" 
              align="right"
              verticalAlign="bottom"
            />
            
            {lines.map((lineKey, index) => (
              <React.Fragment key={lineKey}>
                <Area
                  type="monotone"
                  dataKey={lineKey}
                  stroke={colors[index % colors.length]}
                  strokeWidth={3}
                  fillOpacity={1}
                  fill={`url(#color-${index})`}
                  animationDuration={1500}
                />
              </React.Fragment>
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default TrendLineChart;
