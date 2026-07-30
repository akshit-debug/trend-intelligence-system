import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rss, ExternalLink, RefreshCw, Wifi, WifiOff, Filter, X, Clock, Globe, Cpu, DollarSign, ChevronDown } from 'lucide-react';
import { api } from '../services/api';

const CATEGORIES = ['All', 'World', 'Tech', 'Finance', 'Business'];

const CATEGORY_ICONS = {
  World: Globe,
  Tech: Cpu,
  Finance: DollarSign,
  Business: DollarSign,
};

function timeSince(dateStr) {
  try {
    const date = new Date(dateStr);
    const seconds = Math.floor((Date.now() - date) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  } catch {
    return 'Just now';
  }
}

const SourceBadge = ({ source, color }) => (
  <span
    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
    style={{ backgroundColor: `${color}18`, color, border: `1px solid ${color}30` }}
  >
    {source}
  </span>
);

const CategoryBadge = ({ category }) => {
  const colors = {
    World: '#4ade80',
    Tech: '#06b6d4',
    Finance: '#f59e0b',
    Business: '#f97316',
  };
  const c = colors[category] || '#a1a1aa';
  const Icon = CATEGORY_ICONS[category] || Globe;
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
      style={{ backgroundColor: `${c}15`, color: c, border: `1px solid ${c}25` }}
    >
      <Icon size={9} />
      {category}
    </span>
  );
};

const NewsCard = ({ item, index, isNew }) => (
  <motion.article
    layout
    initial={{ opacity: 0, x: -20, scale: 0.97 }}
    animate={{ opacity: 1, x: 0, scale: 1 }}
    exit={{ opacity: 0, x: 20, scale: 0.97 }}
    transition={{ duration: 0.35, delay: isNew ? 0 : index * 0.03 }}
    className="group relative"
  >
    {isNew && (
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 3, delay: 1 }}
        className="absolute -inset-px rounded-2xl pointer-events-none"
        style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.1))', border: '1px solid rgba(99,102,241,0.4)' }}
      />
    )}
    <div className="relative bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-5 hover:border-zinc-700/80 hover:bg-zinc-900/90 transition-all duration-300 cursor-pointer group-hover:shadow-xl group-hover:shadow-black/20">
      {/* Glow on hover */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `radial-gradient(circle at 50% 0%, ${item.color}06 0%, transparent 60%)` }} />

      <div className="flex items-start gap-4">
        {/* Color accent bar */}
        <div className="flex-shrink-0 w-1 h-full min-h-[60px] rounded-full mt-0.5"
          style={{ backgroundColor: item.color, opacity: 0.7 }} />

        <div className="flex-1 min-w-0">
          {/* Badges row */}
          <div className="flex items-center gap-2 flex-wrap mb-2.5">
            <SourceBadge source={item.source} color={item.color} />
            <CategoryBadge category={item.category} />
            {isNew && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-500/20 text-brand-400 border border-brand-500/30 animate-pulse">
                ● LIVE
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-sm font-semibold text-zinc-100 leading-snug mb-2 group-hover:text-white transition-colors line-clamp-2">
            {item.title}
          </h3>

          {/* Summary */}
          {item.summary && (
            <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2 mb-3">
              {item.summary}
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-zinc-600">
              <Clock size={10} />
              <span className="text-[10px] font-medium">{timeSince(item.fetched_at || item.published)}</span>
            </div>
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 text-[10px] font-bold text-zinc-500 hover:text-brand-400 transition-colors"
            >
              Read <ExternalLink size={10} />
            </a>
          </div>
        </div>
      </div>
    </div>
  </motion.article>
);

const LiveFeed = () => {
  const [articles, setArticles] = useState([]);
  const [newIds, setNewIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeSource, setActiveSource] = useState('All');
  const [sources, setSources] = useState(['All']);
  const [lastPulse, setLastPulse] = useState(null);
  const [showSourceFilter, setShowSourceFilter] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const autoRefreshRef = useRef(null);
  const seenIds = useRef(new Set());

  const mergeArticles = useCallback((incoming) => {
    const fresh = incoming.filter(a => !seenIds.current.has(a.id));
    if (fresh.length === 0) return;
    fresh.forEach(a => seenIds.current.add(a.id));
    const freshIds = new Set(fresh.map(a => a.id));
    setNewIds(freshIds);
    setArticles(prev => {
      const merged = [...fresh, ...prev];
      // Deduplicate
      const seen = new Set();
      return merged.filter(a => seen.has(a.id) ? false : seen.add(a.id)).slice(0, 200);
    });
    // Update sources list
    setSources(prev => {
      const newSources = [...new Set(['All', ...incoming.map(a => a.source)])];
      return newSources;
    });
    setLastPulse(new Date());
    // Clear "new" highlight after 4s
    setTimeout(() => setNewIds(new Set()), 4000);
  }, []);

  // Initial load
  useEffect(() => {
    const init = async () => {
      try {
        const data = await api.getNews(80);
        data.forEach(a => seenIds.current.add(a.id));
        setArticles(data);
        setSources(['All', ...new Set(data.map(a => a.source))]);
        setLastPulse(new Date());
      } catch (e) {
        console.error('LiveFeed init error:', e);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    if (!autoRefresh) {
      if (autoRefreshRef.current) clearInterval(autoRefreshRef.current);
      setIsConnected(false);
      return;
    }
    setIsConnected(true);
    const run = async () => {
      try {
        const data = await api.getNews(80);
        mergeArticles(data);
      } catch (e) {}
    };
    autoRefreshRef.current = setInterval(run, 60000);
    return () => clearInterval(autoRefreshRef.current);
  }, [autoRefresh, mergeArticles]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      const data = await api.getNews(80);
      mergeArticles(data);
    } catch (e) {}
    finally {
      setIsRefreshing(false);
    }
  };

  const filteredArticles = articles.filter(a => {
    const catMatch = activeCategory === 'All' || a.category === activeCategory;
    const srcMatch = activeSource === 'All' || a.source === activeSource;
    return catMatch && srcMatch;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="relative">
          <div className="absolute -inset-6 bg-brand-500/20 rounded-full blur-2xl animate-pulse" />
          <Rss className="w-10 h-10 text-brand-500 relative animate-pulse" />
        </div>
        <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Scanning Live Feeds…</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col gap-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-3xl font-heading font-black text-white tracking-tight flex items-center gap-3">
              <span className="p-2.5 bg-brand-500/10 border border-brand-500/20 rounded-2xl">
                <Rss size={26} className="text-brand-500" />
              </span>
              Live News Feed
            </h2>
            <p className="text-zinc-500 font-medium mt-2 ml-1">
              Real-time intelligence from {sources.length - 1} global sources · {filteredArticles.length} articles loaded
            </p>
            {lastPulse && (
              <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mt-2 ml-1 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-accent-emerald rounded-full animate-pulse" />
                Last pulse: {lastPulse.toLocaleTimeString()}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Live toggle */}
            <button
              onClick={() => setAutoRefresh(v => !v)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all border ${
                autoRefresh
                  ? 'bg-accent-emerald/10 border-accent-emerald/30 text-accent-emerald'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {autoRefresh ? <Wifi size={14} /> : <WifiOff size={14} />}
              {autoRefresh ? 'Live' : 'Paused'}
            </button>

            {/* Manual refresh */}
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all disabled:opacity-50 text-xs font-bold uppercase tracking-wider"
            >
              <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </div>

        {/* Category filter tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={14} className="text-zinc-600 mr-1" />
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                activeCategory === cat
                  ? 'bg-brand-500/15 border-brand-500/40 text-brand-400'
                  : 'bg-zinc-900/60 border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700'
              }`}
            >
              {cat}
            </button>
          ))}

          {/* Source dropdown */}
          <div className="relative ml-2">
            <button
              onClick={() => setShowSourceFilter(v => !v)}
              className="flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-zinc-900/60 border border-zinc-800 text-zinc-500 hover:text-zinc-300 transition-all"
            >
              {activeSource === 'All' ? 'All Sources' : activeSource}
              <ChevronDown size={12} className={showSourceFilter ? 'rotate-180' : ''} />
            </button>
            <AnimatePresence>
              {showSourceFilter && (
                <motion.div
                  initial={{ opacity: 0, y: -5, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -5, scale: 0.96 }}
                  className="absolute top-full left-0 mt-2 w-52 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl z-50 py-2 overflow-hidden"
                >
                  {sources.map(src => (
                    <button
                      key={src}
                      onClick={() => { setActiveSource(src); setShowSourceFilter(false); }}
                      className={`w-full text-left px-4 py-2.5 text-xs font-semibold transition-colors ${
                        activeSource === src ? 'text-brand-400 bg-brand-500/10' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                      }`}
                    >
                      {src}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {(activeCategory !== 'All' || activeSource !== 'All') && (
            <button
              onClick={() => { setActiveCategory('All'); setActiveSource('All'); }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-bold text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <X size={11} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {['World', 'Tech', 'Finance', 'Business'].map(cat => {
          const count = articles.filter(a => a.category === cat).length;
          const Icon = CATEGORY_ICONS[cat] || Globe;
          const colors = { World: '#4ade80', Tech: '#06b6d4', Finance: '#f59e0b', Business: '#f97316' };
          const c = colors[cat];
          return (
            <div key={cat} onClick={() => setActiveCategory(cat)}
              className="p-4 rounded-2xl border cursor-pointer transition-all hover:scale-[1.02]"
              style={{ backgroundColor: `${c}08`, borderColor: `${c}25` }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon size={13} style={{ color: c }} />
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: c }}>{cat}</span>
              </div>
              <p className="text-2xl font-black text-white">{count}</p>
              <p className="text-[10px] text-zinc-500 mt-0.5">articles</p>
            </div>
          );
        })}
      </div>

      {/* News grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredArticles.length > 0 ? (
            filteredArticles.map((item, index) => (
              <NewsCard
                key={item.id}
                item={item}
                index={index}
                isNew={newIds.has(item.id)}
              />
            ))
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-2 py-20 text-center"
            >
              <Rss size={40} className="text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-500 font-semibold">No articles match this filter.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default LiveFeed;
