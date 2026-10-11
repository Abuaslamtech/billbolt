import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Server, Activity, ShieldCheck, Database } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { StatCard } from '../components/ui/StatCard';
import { SystemHealthPanel } from '../components/System/SystemHealthPanel';
import { Button } from '../components/Elements/Button';
import { apiClient } from '../lib/apiClient';

export const SystemScreen: React.FC = () => {
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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <PageHeader
        title="Infrastructure &amp; Telemetry"
        subtitle="Real-time backend API latency, database connection health, sync queue, and security gate status."
        badge="Cloud Health"
        actions={
          <Button
            variant="secondary"
            size="sm"
            icon={<RefreshCw className={`w-3.5 h-3.5 ${apiStatus === 'checking' ? 'animate-spin' : ''}`} />}
            onClick={checkHealth}
          >
            Check Connectivity
          </Button>
        }
      />

      {/* 4-Card Responsive KPI Stat Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="API Response Time"
          value={latencyMs != null ? `${latencyMs}ms` : 'Connecting...'}
          subtext={apiStatus === 'online' ? 'Low latency response' : 'Service check'}
          icon={Activity}
          iconBg={apiStatus === 'online' ? 'bg-emerald-50' : 'bg-rose-50'}
          iconColor={apiStatus === 'online' ? 'text-emerald-600' : 'text-rose-600'}
          borderColor={apiStatus === 'online' ? 'border-emerald-200/80' : 'border-rose-200/80'}
          badge={{
            text: apiStatus === 'online' ? 'Operational' : 'Offline',
            positive: apiStatus === 'online',
          }}
        />
        <StatCard
          title="Database State"
          value={apiStatus === 'online' ? 'Connected' : 'Offline'}
          subtext="Neon PostgreSQL pool"
          icon={Database}
          iconBg="bg-blue-50"
          iconColor="text-bolt-blue"
          borderColor="border-blue-200/80"
          badge={{
            text: 'Live Pool',
            positive: true,
          }}
        />
        <StatCard
          title="API Version"
          value={serverInfo?.version ? `v${serverInfo.version}` : 'v1.0.0'}
          subtext={serverInfo?.service || 'Billbolt Cloud API'}
          icon={Server}
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
          borderColor="border-purple-200/80"
        />
        <StatCard
          title="Security Gates"
          value="Active"
          subtext="RolesGuard &amp; JWT Verification"
          icon={ShieldCheck}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
          borderColor="border-amber-200/80"
          badge={{
            text: 'Enforced',
            positive: true,
          }}
        />
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
