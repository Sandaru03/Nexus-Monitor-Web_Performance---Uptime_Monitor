import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

const ChartModal = ({ url, onClose, apiBase }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get(`${apiBase}/history/${encodeURIComponent(url)}`);
        const formattedData = res.data.map(item => ({
          ...item,
          time: format(new Date(item.checked_at), 'HH:mm:ss'),
        }));
        setData(formattedData);
      } catch (error) {
        console.error("Error fetching history", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHistory();
  }, [url, apiBase]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="glass-panel w-full max-w-4xl p-6 relative animate-in fade-in zoom-in-95 duration-200">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-bold mb-2">Performance History</h2>
        <p className="text-slate-400 mb-6 truncate max-w-2xl">{url}</p>

        {loading ? (
          <div className="h-72 flex justify-center items-center">
            <div className="animate-pulse flex gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <div className="w-3 h-3 bg-blue-500 rounded-full animation-delay-200"></div>
              <div className="w-3 h-3 bg-blue-500 rounded-full animation-delay-400"></div>
            </div>
          </div>
        ) : data.length === 0 ? (
          <div className="h-72 flex justify-center items-center text-slate-500">
            No history data available yet.
          </div>
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis 
                  dataKey="time" 
                  stroke="#94a3b8" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}ms`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    backdropFilter: 'blur(8px)'
                  }}
                  itemStyle={{ color: '#38bdf8' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="response_time" 
                  stroke="#38bdf8" 
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 6, fill: '#38bdf8', stroke: '#0f172a', strokeWidth: 2 }}
                  animationDuration={1500}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChartModal;
