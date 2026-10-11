import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Server, Cloud } from 'lucide-react';
import { SystemHealthPanel } from '../components/System/SystemHealthPanel';
import { Button } from '../components/Elements/Button';
import { apiClient } from '../lib/apiClient';

export interface SystemScreenProps {}

export const SystemScreen: React.FC<SystemScreenProps> = () => {
  const [apiStatus, setApiStatus] = useState<'online' | 'offline' | 'checking'>('checking');
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [serverInfo, setServerInfo] = useState<{ service?: string; version?: string; timestamp?: string } | null>(null);

  const checkHealth = useCallback(async () => {
    setApiStatus('checking');
    const start = performance.now();
    try {
      const data = await apiClient.get('');
      const elapsed = Math.round(performance.now() - start);
      setLatencyMs(elapsed);
      setServerInfo(data);
      setApiStatus('online');
    } catch {
      setLatencyMs(null);
      setServerInfo(null);
      setApiStatus('offline');
    }
  }, []);

  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  return (
    <div className="space-y-6">
      {/* Infrastructure Nodes with Real Health */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-bolt-border">
          <div className="flex items-center justify-between mb-3">
            <span className="text-2xs font-bold uppercase tracking-wider text-bolt-slate">
              Cloud Services
            </span>
            <span
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-2xs font-semibold capitalize ${
                apiStatus === 'online'
                  ? 'bg-bolt-success-bg text-bolt-success-text border border-bolt-success-border'
                  : 'bg-bolt-danger-bg text-bolt-danger-text border border-bolt-danger-border'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  apiStatus === 'online' ? 'bg-bolt-mint' : 'bg-bolt-red'
                }`}
              />
              {apiStatus}
            </span>
          </div>
          <div className="font-poppins font-bold text-2xl text-bolt-graphite">
            {latencyMs != null ? `${latencyMs} ms` : 'Unreachable'}
          </div>
          <p className="text-xs text-bolt-slate mt-1">Response speed</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-bolt-border">
          <div className="flex items-center justify-between mb-3">
            <span className="text-2xs font-bold uppercase tracking-wider text-bolt-slate">
              Service Version
            </span>
            <Server className="w-4 h-4 text-bolt-slate" />
          </div>
          <div className="font-poppins font-bold text-2xl text-bolt-graphite font-mono">
            {serverInfo?.version ? `v${serverInfo.version}` : '—'}
          </div>
          <p className="text-xs text-bolt-slate mt-1">{serverInfo?.service || 'Billbolt Cloud'}</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-bolt-border">
          <div className="flex items-center justify-between mb-3">
            <span className="text-2xs font-bold uppercase tracking-wider text-bolt-slate">
              Server Time
            </span>
            <Cloud className="w-4 h-4 text-bolt-slate" />
          </div>
          <div className="font-poppins font-bold text-sm text-bolt-graphite truncate mt-1">
            {serverInfo?.timestamp
              ? new Date(serverInfo.timestamp).toLocaleTimeString()
              : '—'}
          </div>
          <p className="text-xs text-bolt-slate mt-1">Last synchronized time</p>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          variant="secondary"
          size="sm"
          icon={<RefreshCw className={`w-3.5 h-3.5 text-bolt-slate ${apiStatus === 'checking' ? 'animate-spin' : ''}`} />}
          onClick={checkHealth}
        >
          Check Connection
        </Button>
      </div>

      {/* Diagnostics Panel */}
      <SystemHealthPanel
        apiStatus={apiStatus}
        latencyMs={latencyMs}
        serverInfo={serverInfo}
        onRunIntegrityCheck={checkHealth}
      />
    </div>
  );
};
