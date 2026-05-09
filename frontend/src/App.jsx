import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Activity, ServerCrash, ShieldAlert } from 'lucide-react';
import SiteCard from './components/SiteCard';
import ChartModal from './components/ChartModal';

const API_BASE = 'http://localhost:8000/api';

function App() {
  const [sites, setSites] = useState([]);
  const [selectedSite, setSelectedSite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newSite, setNewSite] = useState('');

  const fetchStatus = async () => {
    try {
      const res = await axios.get(`${API_BASE}/status`);
      setSites(res.data);
    } catch (error) {
      console.error("Error fetching status", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSite = async () => {
    if (!newSite.trim() || !newSite.startsWith('http')) {
      alert("Please enter a valid URL starting with http:// or https://");
      return;
    }
    try {
      await axios.post(`${API_BASE}/targets`, { url: newSite });
      setNewSite('');
      // Wait a short moment to allow the backend to do the initial ping
      setTimeout(() => fetchStatus(), 1500);
    } catch (e) {
      console.error(e);
      alert("Failed to add site");
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // 30s refresh
    return () => clearInterval(interval);
  }, []);

  const stats = {
    total: sites.length,
    down: sites.filter(s => s.status !== 'UP').length,
    sslWarnings: sites.filter(s => s.ssl_days_left > 0 && s.ssl_days_left <= 7).length,
  };

  const handleDeleteSite = async (url) => {
    if (!window.confirm(`Are you sure you want to remove ${url}?`)) return;
    try {
      await axios.delete(`${API_BASE}/targets/${encodeURIComponent(url)}`);
      setSites(sites.filter(s => s.url !== url));
    } catch (e) {
      console.error(e);
      alert("Failed to delete site");
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header section */}
      <header className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
            Nexus Monitor
          </h1>
          <p className="text-slate-400 mt-2">Real-time Web Performance & Uptime tracking</p>
        </div>
        
        {/* KPI Cards */}
        <div className="flex gap-4">
          <div className="glass-panel px-6 py-4 flex items-center gap-4">
            <div className="p-3 bg-blue-500/20 rounded-lg text-blue-400">
              <Activity size={24} />
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider">Monitored</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </div>
          
          <div className="glass-panel px-6 py-4 flex items-center gap-4">
            <div className="p-3 bg-red-500/20 rounded-lg text-red-400">
              <ServerCrash size={24} />
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider">Down</p>
              <p className="text-2xl font-bold">{stats.down}</p>
            </div>
          </div>
          
          <div className="glass-panel px-6 py-4 flex items-center gap-4">
            <div className="p-3 bg-amber-500/20 rounded-lg text-amber-400">
              <ShieldAlert size={24} />
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider">SSL Alerts</p>
              <p className="text-2xl font-bold">{stats.sslWarnings}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Add New Site */}
      <div className="glass-panel p-4 flex gap-4 items-center">
        <input 
          type="text" 
          placeholder="https://example.com" 
          className="flex-1 bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
          value={newSite}
          onChange={(e) => setNewSite(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddSite()}
        />
        <button 
          onClick={handleAddSite}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
        >
          Add Site
        </button>
      </div>

      {/* Main Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sites.map(site => (
            <SiteCard 
              key={site.id} 
              site={site} 
              onSelect={() => setSelectedSite(site.url)} 
              onDelete={() => handleDeleteSite(site.url)}
            />
          ))}
        </div>
      )}

      {/* History Modal */}
      {selectedSite && (
        <ChartModal 
          url={selectedSite} 
          onClose={() => setSelectedSite(null)} 
          apiBase={API_BASE}
        />
      )}
    </div>
  );
}

export default App;
