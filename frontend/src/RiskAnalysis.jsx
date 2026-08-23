import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts';
import { AlertTriangle, TrendingDown, Shield, Activity, Info } from 'lucide-react';

/* ── data ───────────────────────────────────────────────────────────────────── */
const riskRadar = [
  { axis:'Concentration', value:72 },
  { axis:'Volatility',    value:58 },
  { axis:'Liquidity',     value:85 },
  { axis:'Beta',          value:63 },
  { axis:'Drawdown',      value:47 },
  { axis:'Correlation',   value:69 },
];

const varData = [
  { label:'-5%+', count:2  },
  { label:'-4%',  count:3  },
  { label:'-3%',  count:5  },
  { label:'-2%',  count:9  },
  { label:'-1%',  count:18 },
  { label:'0%',   count:28 },
  { label:'+1%',  count:22 },
  { label:'+2%',  count:11 },
  { label:'+3%',  count:6  },
  { label:'+4%',  count:3  },
  { label:'+5%+', count:1  },
];

const holdings = [
  { name:'RELIANCE', weight:22.4, beta:1.18, vol:24.2, corr:0.84, risk:'High'   },
  { name:'TCS',      weight:18.1, beta:0.92, vol:18.7, corr:0.71, risk:'Medium' },
  { name:'INFY',     weight:14.7, beta:0.88, vol:19.1, corr:0.74, risk:'Medium' },
  { name:'HDFC',     weight:12.3, beta:1.05, vol:22.4, corr:0.88, risk:'High'   },
  { name:'ICICI',    weight:10.8, beta:1.11, vol:21.8, corr:0.82, risk:'High'   },
  { name:'WIPRO',    weight:8.2,  beta:0.79, vol:17.4, corr:0.66, risk:'Low'    },
  { name:'Cash',     weight:13.5, beta:0.00, vol:0.0,  corr:0.00, risk:'None'   },
];

const stressTests = [
  { scenario:'2020 COVID Crash',  impact:'-34.2%', recovery:'8 months',  color:'#EF4444' },
  { scenario:'2008 Financial',    impact:'-58.1%', recovery:'4.5 years', color:'#EF4444' },
  { scenario:'2022 Rate Hike',    impact:'-18.4%', recovery:'14 months', color:'#F59E0B' },
  { scenario:'2015 China Slump',  impact:'-22.7%', recovery:'18 months', color:'#F59E0B' },
  { scenario:'+10% Market Rally', impact:'+9.8%',  recovery:'—',         color:'#10B981' },
];

const allocationPie = [
  { name:'Large Cap',  value:55, color:'#3B82F6' },
  { name:'Mid Cap',    value:22, color:'#8B5CF6' },
  { name:'Small Cap',  value:10, color:'#10B981' },
  { name:'Cash',       value:13, color:'#F59E0B' },
];

const riskBadgeColor = {
  High:   'bg-red-500/10 text-red-400',
  Medium: 'bg-amber-500/10 text-amber-400',
  Low:    'bg-emerald-500/10 text-emerald-400',
  None:   'bg-white/5 text-textMuted',
};

const MetricCard = ({ label, value, sub, icon: Icon, color, delay }) => (
  <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay}}
    className="glass-panel p-5 flex items-start gap-4"
  >
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
      <Icon className="w-5 h-5"/>
    </div>
    <div>
      <p className="text-xs text-textMuted font-medium mb-0.5">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
      {sub && <p className="text-xs text-textMuted mt-0.5">{sub}</p>}
    </div>
  </motion.div>
);

const Tooltip2 = ({ text }) => (
  <span className="group relative inline-flex items-center ml-1.5 cursor-pointer">
    <Info className="w-3.5 h-3.5 text-textMuted"/>
    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 text-xs text-white bg-[#0d1220] border border-white/10 rounded-lg px-3 py-2 shadow-xl z-10">
      {text}
    </span>
  </span>
);

/* ── main ───────────────────────────────────────────────────────────────────── */
const RiskAnalysis = () => {
  const [activeHolding, setActiveHolding] = useState(null);

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-10 overflow-y-auto overflow-x-hidden min-w-0">
      {/* Header */}
      <motion.header initial={{y:-20,opacity:0}} animate={{y:0,opacity:1}} className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1">Risk Analysis</h2>
        <p className="text-textMuted text-sm">Portfolio risk score · VaR · Stress tests · Holdings breakdown</p>
      </motion.header>

      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <MetricCard label="Overall Risk Score" value="63 / 100" sub="Moderate risk profile" icon={Shield}      color="bg-amber-500/15 text-amber-400"   delay={0.05}/>
        <MetricCard label="Portfolio Beta"      value="0.97"    sub="Near market correlation" icon={Activity}   color="bg-primary/15 text-primary"      delay={0.10}/>
        <MetricCard label="1-Day VaR (95%)"     value="−₹2,240" sub="Max expected daily loss" icon={TrendingDown} color="bg-red-500/15 text-red-400"    delay={0.15}/>
        <MetricCard label="Max Drawdown"        value="−18.4%"  sub="Historical worst case"   icon={AlertTriangle} color="bg-red-500/15 text-red-400"  delay={0.20}/>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        {/* Radar */}
        <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:.25}}
          className="glass-panel p-6 flex flex-col"
        >
          <h3 className="text-lg font-semibold text-white mb-1">Risk Dimensions</h3>
          <p className="text-xs text-textMuted mb-4">Multi-factor risk radar (0–100)</p>
          <div className="flex-1 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={riskRadar} cx="50%" cy="50%">
                <PolarGrid stroke="rgba(255,255,255,0.07)"/>
                <PolarAngleAxis dataKey="axis" tick={{fill:'rgba(255,255,255,0.5)',fontSize:11}}/>
                <Radar dataKey="value" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.2} strokeWidth={2}/>
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Return distribution */}
        <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:.3}}
          className="glass-panel p-6 xl:col-span-2"
        >
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold text-white">Return Distribution</h3>
            <Tooltip2 text="Historical daily returns distribution. VaR marks the 5th percentile." />
          </div>
          <p className="text-xs text-textMuted mb-4">Daily returns over 90 trading sessions</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={varData} margin={{left:-10}}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false}/>
                <XAxis dataKey="label" tick={{fill:'rgba(255,255,255,0.4)',fontSize:10}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fill:'rgba(255,255,255,0.4)',fontSize:10}} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{backgroundColor:'rgba(13,18,32,0.95)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:10}}
                  itemStyle={{color:'#fff'}} formatter={v=>[`${v} days`,'Frequency']}/>
                <Bar dataKey="count" radius={[3,3,0,0]}>
                  {varData.map((d,i) => (
                    <Cell key={i} fill={d.label.startsWith('-') && d.label!=='-1%' ? '#EF4444' : d.label==='+1%'||d.label==='0%'||d.label==='-1%' ? '#3B82F6' : '#10B981'} opacity={0.85}/>
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        {/* Stress tests */}
        <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:.35}}
          className="glass-panel p-6 xl:col-span-2"
        >
          <h3 className="text-lg font-semibold text-white mb-5">Stress Test Scenarios</h3>
          <div className="space-y-3">
            {stressTests.map(s => (
              <div key={s.scenario} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors min-w-0">
                <div>
                  <p className="text-sm font-medium text-white">{s.scenario}</p>
                  <p className="text-xs text-textMuted mt-0.5">Recovery: {s.recovery}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold" style={{color:s.color}}>{s.impact}</p>
                  <p className="text-xs text-textMuted">Simulated impact</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Cap allocation */}
        <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:.40}}
          className="glass-panel p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Market Cap Mix</h3>
          <div className="h-44 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={allocationPie} innerRadius={52} outerRadius={72} paddingAngle={4} dataKey="value" stroke="none">
                  {allocationPie.map((e,i) => <Cell key={i} fill={e.color}/>)}
                </Pie>
                <Tooltip contentStyle={{backgroundColor:'rgba(13,18,32,0.95)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8}} formatter={v=>[`${v}%`]}/>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className="text-xl font-bold text-white">87%</span>
              <span className="text-[10px] text-textMuted">Invested</span>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {allocationPie.map(a => (
              <div key={a.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor:a.color}}/>
                  <span className="text-white/70">{a.name}</span>
                </div>
                <span className="font-medium text-white">{a.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Holdings risk table */}
      <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:.45}} className="glass-panel p-6">
        <h3 className="text-lg font-semibold text-white mb-5">Holdings Risk Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 text-xs text-textMuted">
                <th className="pb-3 font-medium">Asset</th>
                <th className="pb-3 font-medium">Weight</th>
                <th className="pb-3 font-medium">Beta<Tooltip2 text="Beta measures sensitivity to market moves. &gt;1 = amplified."/></th>
                <th className="pb-3 font-medium">Volatility<Tooltip2 text="Annualised standard deviation of daily returns."/></th>
                <th className="pb-3 font-medium">Correlation<Tooltip2 text="Correlation with NIFTY 50."/></th>
                <th className="pb-3 font-medium">Risk Level</th>
                <th className="pb-3 font-medium">Weight Bar</th>
              </tr>
            </thead>
            <tbody>
              {holdings.map(h => (
                <tr key={h.name}
                  onClick={() => setActiveHolding(activeHolding===h.name ? null : h.name)}
                  className="border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors"
                >
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                        {h.name.charAt(0)}
                      </div>
                      <span className="text-sm font-semibold text-white">{h.name}</span>
                    </div>
                  </td>
                  <td className="py-3 text-sm text-white">{h.weight}%</td>
                  <td className="py-3 text-sm text-white">{h.beta.toFixed(2)}</td>
                  <td className="py-3 text-sm text-white">{h.vol > 0 ? `${h.vol}%` : '—'}</td>
                  <td className="py-3 text-sm text-white">{h.corr > 0 ? h.corr.toFixed(2) : '—'}</td>
                  <td className="py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${riskBadgeColor[h.risk]}`}>
                      {h.risk}
                    </span>
                  </td>
                  <td className="py-3 w-32">
                    <div className="w-full bg-white/10 rounded-full h-1.5">
                      <div className="bg-primary h-1.5 rounded-full transition-all duration-500"
                        style={{width:`${h.weight}%`}}/>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default RiskAnalysis;
