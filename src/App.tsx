import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { 
  Radio, 
  Settings2, 
  CheckCircle2, 
  BrainCircuit, 
  Cpu, 
  Database, 
  Terminal, 
  History, 
  Settings, 
  LayoutDashboard,
  Wifi,
  Lock,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Log {
  timestamp: string;
  message: string;
  type: 'success' | 'warn' | 'info';
}

interface SystemStatus {
  status: string;
  temperature: number;
  humidity: number;
  mae_error: number;
  adaptivity: { current: number; target: number };
  ram: { used: number; total: number };
  cpu: number;
  storage: number;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'monitoring' | 'history' | 'settings'>('monitoring');
  const [logs, setLogs] = useState<Log[]>([]);
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const socketRef = useRef<any>(null);
  const logEndRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    // Fetch initial status
    fetch('/api/status')
      .then(res => res.json())
      .then(data => setStatus(data));

    // Connect to Socket.io for real-time logs
    socketRef.current = io();
    socketRef.current.on('log', (newLog: Log) => {
      setLogs(prev => [...prev.slice(-19), newLog]);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="min-h-screen bg-surface text-on-surface font-sans selection:bg-primary selection:text-surface">
      {/* Top AppBar */}
      <header className="fixed top-0 left-0 w-full z-50 bg-surface/80 backdrop-blur-md border-b border-outline-variant/10 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Radio className="text-primary-container w-6 h-6" />
          <span className="font-headline font-black uppercase tracking-widest text-xl">
            SmartCoop Monitor
          </span>
        </div>
        <button className="hover:bg-surface-bright p-2 rounded-sm transition-colors">
          <Settings2 className="w-5 h-5 text-outline" />
        </button>
      </header>


      <main className="pt-24 pb-28 px-4 max-w-5xl mx-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'monitoring' && (
            <motion.section
              key="monitoring"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Bento Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Primary Gauge */}
                <div className="md:col-span-2 bg-surface-container-low p-8 relative overflow-hidden flex flex-col justify-between h-80 border border-outline-variant/5">
                  <div className="scanline" />
                  <div className="flex justify-between items-start relative z-10">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-outline">Environmental Sensors</p>
                      <h2 className="font-headline text-6xl font-black text-primary mt-2">
                        {status?.temperature ?? '--.-'}°C
                      </h2>
                      <p className="text-sm text-on-surface-variant font-medium mt-1">Temperature Index</p>
                    </div>
                    <div className="text-right">
                      <h2 className="font-headline text-6xl font-black text-primary-container">
                        {status?.humidity ?? '--'}%
                      </h2>
                      <p className="text-sm text-on-surface-variant font-medium mt-1">Humidity Ratio</p>
                    </div>
                  </div>
                  <div className="mt-auto relative z-10">
                    <div className="flex gap-1 items-end h-16 opacity-20">
                      {[...Array(20)].map((_, i) => (
                        <div 
                          key={i} 
                          className="w-full bg-primary" 
                          style={{ height: `${Math.random() * 100}%` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Status Card */}
                <div className="bg-secondary/5 flex flex-col items-center justify-center p-8 border border-secondary/20 relative group">
                  <CheckCircle2 className="text-secondary w-16 h-16 mb-4 group-hover:scale-110 transition-transform" />
                  <p className="font-headline text-4xl font-black text-secondary tracking-tighter">
                    {status?.status ?? 'LOADING'}
                  </p>
                  <p className="font-mono text-[10px] text-secondary mt-2 uppercase tracking-widest opacity-80">
                    System Optimized
                  </p>
                </div>

                {/* AI Engine */}
                <div className="md:col-span-2 bg-surface-container p-6 space-y-4 border border-outline-variant/10">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <BrainCircuit className="text-tertiary w-5 h-5" />
                      <span className="font-mono text-xs font-bold uppercase tracking-wider">Kinetic AI Engine</span>
                    </div>
                    <span className="bg-surface-container-highest px-2 py-0.5 font-mono text-[10px] text-tertiary border border-outline-variant/20">
                      V 3.2.0
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-surface-container-highest p-4 border border-outline-variant/5">
                      <p className="text-[10px] text-outline font-mono uppercase">MAE Error Rate</p>
                      <p className="font-mono text-2xl text-primary-dim">{status?.mae_error ?? '0.0000'}</p>
                    </div>
                    <div className="bg-surface-container-highest p-4 border border-outline-variant/5">
                      <p className="text-[10px] text-outline font-mono uppercase">Adaptivity Threshold</p>
                      <p className="font-mono text-2xl text-tertiary-dim">
                        {status?.adaptivity.current ?? '0.00'} → {status?.adaptivity.target ?? '0.00'}
                      </p>
                    </div>
                  </div>
                  <div className="bg-surface-container-low p-3 font-mono text-[11px] border-l-2 border-tertiary flex items-center gap-2">
                    <span className="text-tertiary">[INF]</span> 
                    <span className="text-on-surface-variant">UPDATE MODEL ONLINE: Inference #80</span>
                  </div>
                </div>

                {/* System Health */}
                <div className="bg-surface-container p-6 space-y-6 border border-outline-variant/10">
                  <div className="space-y-4">
                    <HealthBar 
                      label="RAM USAGE" 
                      value={`${status?.ram.used}KB / ${status?.ram.total}KB`} 
                      percent={(status?.ram.used ?? 0) / (status?.ram.total ?? 1) * 100} 
                      color="bg-primary-dim"
                    />
                    <HealthBar 
                      label="CPU LOAD" 
                      value={`${status?.cpu}%`} 
                      percent={status?.cpu ?? 0} 
                      color="bg-secondary"
                    />
                    <HealthBar 
                      label="NVS STORAGE" 
                      value={`${status?.storage}% FREE`} 
                      percent={100 - (status?.storage ?? 0)} 
                      color="bg-tertiary"
                    />
                  </div>
                </div>
              </div>

              {/* Terminal Logs */}
              <div className="bg-surface-container-low border border-outline-variant/10 rounded-sm overflow-hidden">
                <div className="bg-surface-container p-3 border-b border-outline-variant/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-outline" />
                    <span className="text-[10px] font-mono uppercase tracking-widest text-outline">Live System Logs</span>
                  </div>
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-error/40" />
                    <div className="w-2 h-2 rounded-full bg-tertiary/40" />
                    <div className="w-2 h-2 rounded-full bg-secondary/40" />
                  </div>
                </div>
                <div className="p-4 font-mono text-[11px] leading-6 h-48 overflow-y-auto scrollbar-hide">
                  {logs.map((log, i) => (
                    <div key={i} className="flex gap-3">
                      <span className="text-outline shrink-0">[{log.timestamp}]</span>
                      <span className="text-outline-variant shrink-0">&gt;</span>
                      <span className={
                        log.type === 'success' ? 'text-secondary' : 
                        log.type === 'warn' ? 'text-tertiary' : 
                        'text-on-surface-variant'
                      }>
                        {log.message}
                      </span>
                    </div>
                  ))}
                  <div ref={logEndRef} />
                </div>
              </div>
            </motion.section>
          )}

          {activeTab === 'history' && (
            <motion.section
              key="history"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 mb-8">
                <History className="w-8 h-8 text-primary" />
                <h2 className="font-headline text-3xl font-black uppercase tracking-tight">Telemetri Riwayat</h2>
              </div>
              
              <div className="bg-surface-container-low border border-outline-variant/10">
                <div className="grid grid-cols-4 px-6 py-4 border-b border-outline-variant/20 font-mono text-[10px] uppercase tracking-widest text-outline">
                  <span>Timestamp</span>
                  <span>Temperature</span>
                  <span>Humidity</span>
                  <span className="text-right">Status</span>
                </div>
                <div className="divide-y divide-outline-variant/10">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="grid grid-cols-4 px-6 py-5 items-center font-mono text-sm hover:bg-surface-bright/30 transition-colors">
                      <span className="text-on-surface-variant">14:0{7-i}:22</span>
                      <span className="text-primary font-bold">30.{Math.floor(Math.random()*9)}°C</span>
                      <span className="text-primary-container">8{Math.floor(Math.random()*5)}%</span>
                      <span className="flex justify-end">
                        {Math.random() > 0.1 ? (
                          <CheckCircle2 className="w-4 h-4 text-secondary" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-tertiary" />
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.section>
          )}

          {activeTab === 'settings' && (
            <motion.section
              key="settings"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-md mx-auto"
            >
              <div className="bg-surface-container p-8 border border-outline-variant/10 space-y-8">
                <div className="space-y-2">
                  <h3 className="font-headline text-2xl font-black uppercase tracking-tight">Network Config</h3>
                  <p className="text-xs text-outline font-medium">Configure ESP32 local connectivity parameters.</p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-outline">WiFi SSID</label>
                    <div className="relative">
                      <Wifi className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                      <input 
                        type="text" 
                        className="w-full bg-surface-container-low border-b-2 border-outline-variant focus:border-primary transition-all py-3 pl-10 text-sm outline-none"
                        placeholder="Scanning for nodes..."
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-outline">Security Key</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                      <input 
                        type="password" 
                        className="w-full bg-surface-container-low border-b-2 border-outline-variant focus:border-primary transition-all py-3 pl-10 text-sm outline-none"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <button className="w-full bg-secondary text-surface font-headline font-black uppercase py-4 tracking-widest hover:brightness-110 active:scale-[0.98] transition-all">
                    Simpan & Hubungkan
                  </button>

                  <p className="text-[10px] text-center text-outline-variant leading-relaxed italic">
                    Data akan dikirim ke ESP32 via konfigurasi lokal. Pastikan perangkat berada dalam mode Access Point.
                  </p>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 w-full z-50 bg-surface/90 backdrop-blur-xl border-t border-outline-variant/10 px-6 pb-8 pt-4 flex justify-around items-center">
        <NavButton 
          active={activeTab === 'monitoring'} 
          onClick={() => setActiveTab('monitoring')}
          icon={<LayoutDashboard className="w-5 h-5" />}
          label="Monitoring"
        />
        <NavButton 
          active={activeTab === 'history'} 
          onClick={() => setActiveTab('history')}
          icon={<History className="w-5 h-5" />}
          label="History"
        />
        <NavButton 
          active={activeTab === 'settings'} 
          onClick={() => setActiveTab('settings')}
          icon={<Settings className="w-5 h-5" />}
          label="Settings"
        />
      </nav>
    </div>
  );
}

function HealthBar({ label, value, percent, color }: { label: string, value: string, percent: number, color: string }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-[10px] font-mono">
        <span className="text-outline uppercase tracking-widest">{label}</span>
        <span className="text-on-surface font-bold">{value}</span>
      </div>
      <div className="h-1 bg-surface-container-highest overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          className={`h-full ${color}`} 
        />
      </div>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${
        active ? 'text-primary' : 'text-outline hover:text-on-surface'
      }`}
    >
      <div className={`p-2 rounded-sm transition-all ${active ? 'bg-primary/10' : ''}`}>
        {icon}
      </div>
      <span className="text-[10px] font-mono uppercase tracking-widest font-bold">{label}</span>
      {active && (
        <motion.div 
          layoutId="nav-indicator"
          className="w-1 h-1 bg-primary rounded-full absolute -bottom-1"
        />
      )}
    </button>
  );
}

