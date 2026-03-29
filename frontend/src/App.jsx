import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './components/Sidebar';
import MetricCard from './components/MetricCard';
import TrendTable from './components/TrendTable';
import SentimentCard from './components/SentimentCard';
import InsightCard from './components/InsightCard';
import GrowthBarChart from './charts/GrowthBarChart';
import TrendLineChart from './charts/TrendLineChart';
import { api } from './services/api';
import { Hash, TrendingUp, Users, SearchIcon, Loader2, PlayCircle, ShieldCheck } from 'lucide-react';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [trends, setTrends] = useState([]);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [trendsData, insightsData, statusData] = await Promise.all([
          api.getTrends(),
          api.getInsights(),
          api.getStatus()
        ]);
        setTrends(trendsData);
        setInsights(insightsData);
        setLastUpdated(statusData.last_updated);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setTimeout(() => setLoading(false), 800); // Shorter artificial lag for "classy" feel
      }
    };
    fetchData();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await api.refreshTrends();
      const [trendsData, insightsData, statusData] = await Promise.all([
        api.getTrends(),
        api.getInsights(),
        api.getStatus()
      ]);
      setTrends(trendsData);
      setInsights(insightsData);
      setLastUpdated(statusData.last_updated);
    } catch (error) {
      console.error("Refresh failed:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const results = await api.searchTrends(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsSearching(false);
    }
  };

  // Metrics Logic
  const topTrending = useMemo(() => [...trends].sort((a, b) => b.mentions - a.mentions)[0], [trends]);
  const highestGrowth = useMemo(() => [...trends].sort((a, b) => b.growth - a.growth)[0], [trends]);
  const totalAnalyzed = trends.length * 12500;
  
  // Overall Sentiment Logic
  const overallSentiment = useMemo(() => {
    if (!trends.length) return null;
    const avgScore = (trends.reduce((acc, curr) => acc + curr.sentiment.score, 0) / trends.length).toFixed(1);
    const avgPos = (trends.reduce((acc, curr) => acc + curr.sentiment.positive, 0) / trends.length).toFixed(0);
    const avgNeu = (trends.reduce((acc, curr) => acc + curr.sentiment.neutral, 0) / trends.length).toFixed(0);
    const avgNeg = (trends.reduce((acc, curr) => acc + curr.sentiment.negative, 0) / trends.length).toFixed(0);
    return { score: parseFloat(avgScore), positive: parseInt(avgPos), neutral: parseInt(avgNeu), negative: parseInt(avgNeg) };
  }, [trends]);

  // Line Chart Data Transformation
  const { lineData, lineKeys } = useMemo(() => {
    if (!trends.length) return { lineData: [], lineKeys: [] };
    const dates = [...new Set(trends.flatMap(t => t.historical_data.map(h => h.date)))].sort();
    const data = dates.map(date => {
      const point = { date };
      trends.forEach(trend => {
        const hData = trend.historical_data.find(h => h.date === date);
        point[trend.keyword] = hData ? hData.mentions : 0;
      });
      return point;
    });
    return { lineData: data, lineKeys: trends.map(t => t.keyword) };
  }, [trends]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950">
        <div className="relative">
          <div className="absolute -inset-10 bg-brand-500 rounded-full opacity-20 blur-3xl animate-pulse" />
          <Loader2 className="w-12 h-12 text-brand-500 animate-spin relative" />
        </div>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 text-zinc-500 font-bold uppercase tracking-[0.3em] text-[10px]"
        >
          Synchronizing Market Data
        </motion.p>
      </div>
    );
  }

  const renderDashboard = () => (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-8"
    >
      <div className="flex justify-between items-end mb-4">
        <div>
          <h2 className="text-3xl font-heading font-black text-white tracking-tight">Intelligence Hub</h2>
          <p className="text-zinc-500 font-medium mt-1">Real-time analytical oversight of global market vectors.</p>
          {lastUpdated && (
            <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-accent-emerald rounded-full animate-pulse" />
              Pulse Sync: {new Date(lastUpdated).toLocaleTimeString()}
            </p>
          )}
        </div>
        <div className="flex items-center gap-4">
           <button 
             onClick={handleRefresh}
             disabled={isRefreshing}
             className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all disabled:opacity-50"
           >
             <Loader2 size={16} className={isRefreshing ? "animate-spin" : ""} />
             <span className="text-xs font-bold uppercase tracking-wider">Sync Feeds</span>
           </button>
           <div className="w-px h-8 bg-zinc-800" />
           <div className="text-right">
              <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Active Signals</p>
              <p className="text-sm font-bold text-accent-emerald">247 Live Feeds</p>
           </div>
           <div className="w-px h-8 bg-zinc-800" />
           <PlayCircle className="text-zinc-600 hover:text-white cursor-pointer transition-colors" size={24} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <MetricCard 
          index={0}
          title="Top Trending Index" 
          value={topTrending?.keyword || 'N/A'} 
          icon={Hash}
        />
        <MetricCard 
          index={1}
          title="Growth Alpha" 
          value={highestGrowth?.keyword || 'N/A'} 
          change={highestGrowth?.growth} 
          isPositive={highestGrowth?.growth >= 0} 
          icon={TrendingUp}
        />
        <MetricCard 
          index={2}
          title="Surveillance Coverage" 
          value={totalAnalyzed.toLocaleString()} 
          icon={Users}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <div className="lg:col-span-8 flex flex-col h-full">
          <TrendLineChart data={lineData} lines={lineKeys} />
        </div>
        <div className="lg:col-span-4 flex flex-col h-full">
          <SentimentCard sentiment={overallSentiment} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <TrendTable trends={trends} />
        </div>
        <div className="lg:col-span-4 transition-all duration-300">
          <GrowthBarChart data={trends} />
        </div>
      </div>
    </motion.div>
  );

  const renderInsights = () => (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="max-w-5xl space-y-10"
    >
      <div className="mb-12">
        <h2 className="text-3xl font-heading font-black text-white tracking-tight flex items-center gap-4">
          <span className="p-3 bg-brand-500/10 border border-brand-500/20 rounded-2xl">
            <ShieldCheck size={28} className="text-brand-500" />
          </span>
          Executive AI Insights
        </h2>
        <p className="text-zinc-500 font-medium mt-4 ml-2">Strategic intelligence synthesized from high-growth trend vectors.</p>
      </div>
      
      <div className="grid grid-cols-1 gap-8">
        {insights.map((insight, idx) => (
          <InsightCard key={insight.id} insight={insight} index={idx} />
        ))}
      </div>
    </motion.div>
  );

  const renderSearch = () => (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-12"
    >
      <div>
        <h2 className="text-3xl font-heading font-black text-white tracking-tight">Market Explorer</h2>
        <p className="text-zinc-500 font-medium mt-1">Drill down into specific sector intelligence.</p>
      </div>
      
      <form onSubmit={handleSearch} className="relative max-w-3xl">
        <div className="absolute -inset-1 bg-gradient-to-r from-brand-500 to-accent-purple rounded-3xl opacity-20 blur-xl group-focus-within:opacity-40 transition-opacity" />
        <div className="relative flex items-center bg-zinc-900/80 border border-zinc-800 rounded-3xl backdrop-blur-3xl overflow-hidden focus-within:border-brand-500/50 transition-all shadow-2xl">
          <div className="pl-6 pointer-events-none">
            <SearchIcon className="h-6 w-6 text-zinc-500" />
          </div>
          <input
            type="text"
            className="flex-1 pl-4 pr-4 py-6 bg-transparent text-white placeholder-zinc-600 focus:outline-none text-lg font-medium"
            placeholder="Interrogate market keyword (e.g. AI, Quantum)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button 
            type="submit"
            disabled={isSearching}
            className="mr-3 px-8 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl font-bold tracking-tight shadow-lg transition-all active:scale-95 disabled:opacity-50"
          >
            {isSearching ? <Loader2 className="animate-spin" /> : 'Analyze'}
          </button>
        </div>
      </form>

      <AnimatePresence mode="wait">
        {searchResults.length > 0 && (
          <motion.div 
            key="results"
            className="space-y-10"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <TrendTable trends={searchResults} />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full items-stretch">
               <div className="lg:col-span-7">
                  <GrowthBarChart data={searchResults} />
               </div>
               <div className="lg:col-span-5">
                  <SentimentCard sentiment={searchResults[0].sentiment} />
               </div>
            </div>
          </motion.div>
        )}
        
        {searchResults.length === 0 && searchQuery && !isSearching && (
          <motion.div 
            key="no-results"
            className="p-20 text-center glass-card border-dashed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-xl font-heading font-bold text-zinc-300">Negative Correlation Found</p>
            <p className="text-zinc-500 mt-2">The keyword "{searchQuery}" does not match active high-value surveillance trends.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  return (
    <div className="flex bg-zinc-950 min-h-screen overflow-hidden text-zinc-300">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      <main className="flex-1 ml-64 h-screen overflow-y-auto w-full relative">
        {/* Subtle Ambient Background Glows */}
        <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-brand-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-accent-purple/5 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="p-12 pb-24 max-w-[1600px] mx-auto min-h-full">
          <AnimatePresence mode="wait">
            {currentView === 'dashboard' && renderDashboard()}
            {currentView === 'insights' && renderInsights()}
            {currentView === 'search' && renderSearch()}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

export default App;
