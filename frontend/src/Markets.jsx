import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Search, RefreshCw } from 'lucide-react';

/* ── data ───────────────────────────────────────────────────────────────────── */
const indices = [
  { name: 'NIFTY 50',    value: '22,147.00', change: '+0.83%', pts: '+182.50', up: true  },
  { name: 'SENSEX',      value: '73,088.33', change: '+0.79%', pts: '+575.20', up: true  },
  { name: 'NIFTY BANK',  value: '47,512.60', change: '-0.34%', pts: '-163.40', up: false },
  { name: 'NIFTY IT',    value: '36,284.10', change: '+1.47%', pts: '+524.80', up: true  },
  { name: 'NIFTY MID150',value: '18,920.55', change: '+0.55%', pts: '+103.30', up: true  },
  { name: 'S&P 500',     value: '5,308.13',  change: '+0.48%', pts: '+25.30',  up: true  },
];

const sparkline = (base, n = 20, vol = 0.02) => {
  const pts = [base];
  for (let i = 1; i < n; i++) pts.push(+(pts[i-1] * (1 + (Math.random()-0.48)*vol)).toFixed(2));
  return pts.map((v, i) => ({ x: i, v }));
};

const topMovers = [
  { symbol:'RELIANCE', name:'Reliance Industries', price:'2,947', change:'+3.12%', vol:'42.1M', up:true },
  { symbol:'TCS',      name:'Tata Consultancy',    price:'3,821', change:'+2.74%', vol:'18.4M', up:true },
  { symbol:'INFY',     name:'Infosys Ltd',         price:'1,482', change:'+1.91%', vol:'29.6M', up:true },
  { symbol:'HDFC',     name:'HDFC Bank',           price:'1,563', change:'-1.23%', vol:'35.2M', up:false},
  { symbol:'ICICIBANK',name:'ICICI Bank',          price:'1,107', change:'+0.88%', vol:'22.8M', up:true },
  { symbol:'WIPRO',    name:'Wipro Ltd',           price:'468',   change:'-0.62%', vol:'11.3M', up:false},
];

const sectors = [
  { name:'IT',           change: 2.47, color:'#3B82F6' },
  { name:'Pharma',       change: 1.83, color:'#10B981' },
  { name:'FMCG',         change: 0.94, color:'#8B5CF6' },
  { name:'Auto',         change: 0.61, color:'#F59E0B' },
  { name:'Energy',       change:-0.28, color:'#EF4444' },
  { name:'Banking',      change:-0.34, color:'#EC4899' },
  { name:'Real Estate',  change:-0.72, color:'#6B7280' },
  { name:'Metal',        change: 1.22, color:'#14B8A6' },
];

const niftyHistory = [
  {d:'Jan',v:20800},{d:'Feb',v:21400},{d:'Mar',v:21100},{d:'Apr',v:22200},
  {d:'May',v:21700},{d:'Jun',v:22900},{d:'Jul',v:22147},
];

const RANGES = ['1D','1W','1M','3M','1Y'];

/* ── components ─────────────────────────────────────────────────────────────── */
const MiniSparkline = ({ data, up }) => (
  <ResponsiveContainer width={80} height={32}>
    <LineChart data={data}>
      <Line type="monotone" dataKey="v" stroke={up ? '#10B981' : '#EF4444'} strokeWidth={1.5} dot={false} />
    </LineChart>
  </ResponsiveContainer>
);

const IndexCard = ({ name, value, change, pts, up }) => {
  const spark = sparkline(parseFloat(value.replace(/,/g,'')));
  return (
    <motion.div
      initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
      className="glass-panel p-4 flex flex-col gap-2"
    >
      <div className="flex justify-between items-start">
        <p className="text-xs text-textMuted font-medium">{name}</p>
        <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${up?'bg-emerald-500/10 text-emerald-400':'bg-red-500/10 text-red-400'}`}>
          {change}
        </span>
      </div>
      <p className="text-lg font-bold text-white">{value}</p>
      <div className="flex items-center justify-between">
        <span className={`text-xs ${up?'text-emerald-400':'text-red-400'}`}>{pts}</span>
        <MiniSparkline data={spark} up={up} />
      </div>
    </motion.div>
  );
};

const Markets = () => {
  const [search, setSearch]   = useState('');
  const [range,  setRange]    = useState('1M');
  const [lastUp, setLastUp]   = useState(Date.now());

  const filtered = topMovers.filter(s =>
    s.symbol.toLowerCase().includes(search.toLowerCase()) ||
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 p-6 lg:p-10 overflow-y-auto">
      {/* Header */}
      <motion.header initial={{y:-20,opacity:0}} animate={{y:0,opacity:1}} className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white mb-1">Market Overview</h2>
          <p className="text-textMuted text-sm">Live indices · Sector performance · Top movers</p>
        </div>
        <button
          onClick={() => setLastUp(Date.now())}
          className="glass-button flex items-center gap-2 text-sm"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </motion.header>

      {/* Index grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {indices.map((idx, i) => <IndexCard key={idx.name} {...idx} />)}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        {/* NIFTY chart */}
        <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:.1}}
          className="xl:col-span-2 glass-panel p-6"
        >
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white">NIFTY 50</h3>
              <p className="text-textMuted text-xs">National Stock Exchange of India</p>
            </div>
            <div className="flex gap-1">
              {RANGES.map(r => (
                <button key={r} onClick={() => setRange(r)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    range===r ? 'bg-primary text-white' : 'text-textMuted hover:text-white hover:bg-white/10'
                  }`}
                >{r}</button>
              ))}
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={niftyHistory}>
                <defs>
                  <linearGradient id="niftyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false}/>
                <XAxis dataKey="d" tick={{fill:'rgba(255,255,255,0.5)',fontSize:11}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fill:'rgba(255,255,255,0.5)',fontSize:11}} axisLine={false} tickLine={false}
                  tickFormatter={v=>`${(v/1000).toFixed(0)}k`} domain={['auto','auto']}/>
                <Tooltip contentStyle={{backgroundColor:'rgba(13,18,32,0.95)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:10}}
                  itemStyle={{color:'#fff'}} formatter={v=>[v.toLocaleString(),'NIFTY 50']}/>
                <Area type="monotone" dataKey="v" stroke="#3B82F6" strokeWidth={2.5}
                  fill="url(#niftyGrad)" dot={false} activeDot={{r:6,fill:'#3B82F6',stroke:'#fff',strokeWidth:2}}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Sector heatmap */}
        <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:.2}}
          className="glass-panel p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Sector Performance</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sectors} layout="vertical" margin={{left:8}}>
                <XAxis type="number" tick={{fill:'rgba(255,255,255,0.4)',fontSize:10}} axisLine={false} tickLine={false}
                  tickFormatter={v=>`${v>0?'+':''}${v}%`}/>
                <YAxis type="category" dataKey="name" tick={{fill:'rgba(255,255,255,0.6)',fontSize:11}} axisLine={false} tickLine={false} width={70}/>
                <Tooltip contentStyle={{backgroundColor:'rgba(13,18,32,0.95)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:10}}
                  itemStyle={{color:'#fff'}} formatter={v=>[`${v>0?'+':''}${v}%`,'Change']}/>
                <Bar dataKey="change" radius={[0,4,4,0]}>
                  {sectors.map((s,i) => <Cell key={i} fill={s.change>=0?'#10B981':'#EF4444'} opacity={0.8}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Top Movers */}
      <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:.3}} className="glass-panel p-6">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-lg font-semibold text-white">Top Movers</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textMuted"/>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search symbol…"
              className="glass-input pl-9 py-1.5 text-sm w-48"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 text-xs text-textMuted">
                <th className="pb-3 font-medium">Symbol</th>
                <th className="pb-3 font-medium">Price (₹)</th>
                <th className="pb-3 font-medium">Change</th>
                <th className="pb-3 font-medium">Volume</th>
                <th className="pb-3 font-medium">Trend</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.symbol} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white">
                        {s.symbol.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{s.symbol}</p>
                        <p className="text-xs text-textMuted">{s.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 font-semibold text-white">₹{s.price}</td>
                  <td className="py-3">
                    <span className={`flex items-center text-sm font-medium ${s.up?'text-emerald-400':'text-red-400'}`}>
                      {s.up ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5"/> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5"/>}
                      {s.change}
                    </span>
                  </td>
                  <td className="py-3 text-sm text-textMuted">{s.vol}</td>
                  <td className="py-3">
                    <MiniSparkline data={sparkline(parseFloat(s.price.replace(/,/g,'')))} up={s.up}/>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="py-8 text-center text-textMuted text-sm">No results found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default Markets;
