import React from 'react';
import { Button } from '../Elements/Button';

export interface SystemHealthPanelProps {
  apiStatus: 'online' | 'offline' | 'checking';
  latencyMs: number | null;
  serverInfo?: {
    service?: string;
    version?: string;
    timestamp?: string;
  } | null;
  onRunIntegrityCheck?: () => void;
}

export const SystemHealthPanel: React.FC<SystemHealthPanelProps> = ({
  apiStatus,
  latencyMs,
  serverInfo,
  onRunIntegrityCheck,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="p-6 rounded-2xl bg-white border border-bolt-border space-y-4">
        <h2 className="font-poppins font-bold text-sm text-bolt-graphite">
          Cloud Server Status
        </h2>
        <p className="text-xs text-bolt-slate">
          Operational status of Billbolt cloud services
        </p>

        <div className="space-y-3 pt-2">
          <div className="p-3.5 rounded-xl border border-bolt-border bg-bolt-surface flex items-center justify-between">
            <div>
              <div className="font-semibold text-xs text-bolt-graphite">Service Name</div>
              <div className="text-[11px] text-bolt-slate">{serverInfo?.service || 'Billbolt Cloud'}</div>
            </div>
            <span className="text-xs font-mono font-semibold text-bolt-graphite">
              {serverInfo?.version ? `v${serverInfo.version}` : 'v1.0.0'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl border border-bolt-border bg-bolt-surface flex items-center justify-between">
            <div>
              <div className="font-semibold text-xs text-bolt-graphite">Server Time</div>
              <div className="text-[11px] text-bolt-slate">
                {serverInfo?.timestamp
                  ? new Date(serverInfo.timestamp).toLocaleString()
                  : 'Awaiting ping...'}
              </div>
            </div>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider capitalize ${
                apiStatus === 'online'
                  ? 'bg-bolt-success-bg text-bolt-success-text border border-bolt-success-border'
                  : 'bg-bolt-danger-bg text-bolt-danger-text border border-bolt-danger-border'
              }`}
            >
              {apiStatus}
            </span>
          </div>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-white border border-bolt-border space-y-4">
        <h2 className="font-bold text-sm text-bolt-graphite">
          Connection & Latency
        </h2>
        <p className="text-xs text-bolt-slate">
          Real-time responsiveness and connectivity
        </p>

        <div className="space-y-3 pt-2">
          <div className="p-3.5 rounded-xl border border-bolt-border bg-bolt-surface flex items-center justify-between">
            <div>
              <div className="font-semibold text-xs text-bolt-graphite">
                Round-Trip Latency
              </div>
              <div className="text-[11px] text-bolt-slate">Round-trip response time</div>
            </div>
            <span className="font-bold text-sm text-bolt-graphite font-mono">
              {latencyMs != null ? `${latencyMs} ms` : '—'}
            </span>
          </div>

          <div className="p-4 rounded-xl border border-bolt-border bg-bolt-surface flex items-center justify-between">
            <div>
              <div className="font-semibold text-xs text-bolt-graphite">
                Test Connection
              </div>
              <div className="text-[11px] text-bolt-slate">
                Checks server response speed
              </div>
            </div>
            <Button variant="secondary" size="sm" onClick={onRunIntegrityCheck}>
              Test Speed
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
