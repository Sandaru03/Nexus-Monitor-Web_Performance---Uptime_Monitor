import React from 'react';
import { Clock, Globe, Shield, TrendingUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const SiteCard = ({ site, onSelect }) => {
  const isUp = site.status === 'UP';
  const sslWarning = site.ssl_days_left !== -1 && site.ssl_days_left <= 7;

  return (
    <div 
      className="glass-panel p-6 hover:border-emerald-500/50 transition-all duration-300 cursor-pointer group hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]"
      onClick={onSelect}
    >
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className={`p-2 rounded-full flex-shrink-0 ${isUp ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
            <Globe size={20} />
          </div>
          <h3 className="font-semibold text-lg truncate" title={site.url}>
            {site.url.replace(/https?:\/\//, '')}
          </h3>
        </div>
        
        {/* Neon Status Badge */}
        <div className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider shadow-[0_0_10px_currentColor] border ${
          isUp 
            ? 'text-neon-green border-neon-green/50 bg-neon-green/10' 
            : 'text-neon-red border-neon-red/50 bg-neon-red/10'
        }`}>
          {site.status}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Response Time */}
        <div className="bg-slate-800/50 rounded-lg p-3">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <Clock size={14} />
            <span className="text-xs uppercase tracking-wider">Latency</span>
          </div>
          <div className="flex items-end gap-1">
            <span className="text-xl font-bold text-slate-200">
              {site.response_time.toFixed(0)}
            </span>
            <span className="text-sm text-slate-500 mb-0.5">ms</span>
          </div>
        </div>

        {/* SSL Expiry */}
        <div className="bg-slate-800/50 rounded-lg p-3">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <Shield size={14} />
            <span className="text-xs uppercase tracking-wider">SSL Exp</span>
          </div>
          <div className="flex items-end gap-1">
            <span className={`text-xl font-bold ${sslWarning ? 'text-amber-400' : 'text-slate-200'}`}>
              {site.ssl_days_left === -1 ? 'N/A' : site.ssl_days_left}
            </span>
            <span className="text-sm text-slate-500 mb-0.5">days</span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-between items-center text-xs text-slate-500">
        <span>Checked {formatDistanceToNow(new Date(site.checked_at), { addSuffix: true })}</span>
        <div className="flex items-center gap-1 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
          <span>View Trends</span>
          <TrendingUp size={14} />
        </div>
      </div>
    </div>
  );
};

export default SiteCard;
