'use client';

import { useState, useEffect, useCallback } from 'react';
import { Download, Play, RefreshCw, AlertCircle, CheckCircle2, Loader2, Eye, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useT } from '@/hooks/use-t';

/* ─── Types ────────────────────────────────────────────────────────────── */

interface ImportSource {
  id: string; name: string; type: string; scraperKey: string; baseUrl: string;
  enabled: boolean; autoPublish: boolean; scheduleMinutes: number; defaultCategory: string | null;
  lastRunAt: string | null; lastRunStatus: string | null;
}

interface ImportRun {
  id: string; sourceId: string; source?: { name: string; type: string } | null;
  startedAt: string; finishedAt: string | null; status: string;
  found: number; imported: number; updated: number; skipped: number;
  duplicates: number; failed: number; processingMs: number;
  errors: string | null; triggeredBy: string | null;
}

interface ImportStats {
  totalImported: number; totalFailed: number; totalPending: number;
  lastSyncAt: string | null; lastRun: ImportRun | null; successRate: number;
  sources: ImportSource[]; recentRuns: ImportRun[];
}

/* ─── Component ─────────────────────────────────────────────────────────── */

export function AutoImportPanel() {
  const t = useT();
  const { toast } = useToast();

  const [stats, setStats] = useState<ImportStats | null>(null);
  const [runs, setRuns] = useState<ImportRun[]>([]);
  const [loading, set_loading] = useState(true);
  const [running, setRunning] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'sources' | 'logs'>('dashboard');
  const [expandedRun, setExpandedRun] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, runsRes] = await Promise.all([
        fetch('/api/admin/import/stats'),
        fetch('/api/admin/import/runs?limit=20'),
      ]);
      const statsData = await statsRes.json();
      const runsData = await runsRes.json();
      setStats(statsData);
      setRuns(runsData.items || []);
    } catch (e) {
      console.error('[auto-import] fetch error:', e);
    } finally {
      set_loading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const runImport = async (sourceId?: string, type?: string) => {
    setRunning(true);
    try {
      const res = await fetch('/api/admin/import/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceId, type }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      toast({ title: t('status.success'), description: `Imported: ${data.summary.imported}, Updated: ${data.summary.updated}, Failed: ${data.summary.failed}` });
      fetchData();
    } catch (e: any) {
      toast({ title: t('status.error'), description: e.message, variant: 'destructive' });
    } finally {
      setRunning(false);
    }
  };

  const retryFailed = async () => {
    setRunning(true);
    try {
      const res = await fetch('/api/admin/import/retry-failed', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      toast({ title: t('status.success'), description: `Previously failed: ${data.previouslyFailed}` });
      fetchData();
    } catch (e: any) {
      toast({ title: t('status.error'), description: e.message, variant: 'destructive' });
    } finally {
      setRunning(false);
    }
  };

  const toggleSource = async (id: string, field: 'enabled' | 'autoPublish', value: boolean) => {
    try {
      await fetch(`/api/admin/import/sources/${id}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field, value }),
      });
      fetchData();
    } catch (e) {
      toast({ title: t('status.error'), description: 'Toggle failed', variant: 'destructive' });
    }
  };

  const formatMs = (ms: number) => ms < 60000 ? `${Math.round(ms / 1000)}s` : `${(ms / 60000).toFixed(1)}m`;
  const formatDate = (d: string | null) => {
    if (!d) return '—';
    try { return new Date(d).toLocaleString(); } catch { return d; }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header + Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold">{t('import.title')}</h2>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => runImport()} disabled={running}>
            {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {running ? t('import.running') : t('import.runAll')}
          </Button>
          <Button variant="outline" onClick={retryFailed} disabled={running}>
            <RefreshCw className="h-4 w-4 mr-1" /> {t('import.retryFailed')}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        {(['dashboard', 'sources', 'logs'] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}>
            {tab === 'dashboard' && `📊 ${t('import.title')}`}
            {tab === 'sources' && `🔗 ${t('import.sources')}`}
            {tab === 'logs' && `📋 ${t('import.logs')}`}
          </button>
        ))}
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && stats && (
        <>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">{t('import.totalImported')}</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-bold">{stats.totalImported}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">{t('import.successRate')}</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-bold">{stats.successRate}%</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">{t('import.failed')}</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-bold text-destructive">{stats.totalFailed}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">{t('import.lastSync')}</CardTitle></CardHeader>
            <CardContent><div className="text-sm font-medium">{formatDate(stats.lastSyncAt)}</div></CardContent>
          </Card>
        </div>
        {stats.totalPending > 0 && (
          <Card className="sm:col-span-2 lg:col-span-4"><CardContent className="flex items-center gap-2"><AlertCircle className="h-4 w-4 text-yellow-500" /><span className="text-sm">{stats.totalPending} {t('import.pending')} — configure AI provider to process</span></CardContent></Card>
        )}
        {/* Recent runs */}
          <div className="sm:col-span-2 lg:col-span-4">
            <h3 className="mb-3 text-sm font-semibold">{t('import.logs')} (recent)</h3>
            <div className="rounded-lg border">
              <table className="w-full text-sm">
                <thead><tr className="border-b bg-muted/50"><th className="px-3 py-2 text-left">{t('import.sourceName')}</th><th className="px-3 py-2 text-left">{t('import.logStatus')}</th><th className="px-3 py-2 text-right">{t('import.logFound')}</th><th className="px-3 py-2 text-right">{t('import.logImported')}</th><th className="px-3 py-2 text-right">{t('import.logFailed')}</th><th className="px-3 py-2 text-right">{t('import.logDuration')}</th><th className="px-3 py-2 text-left">{t('import.logStarted')}</th></tr></thead>
                <tbody>
                  {(stats.recentRuns || []).map((r) => (
                    <tr key={r.id} className="border-b last:border-0 hover:bg-muted/30 cursor-pointer" onClick={() => setExpandedRun(expandedRun === r.id ? null : r.id)}>
                      <td className="px-3 py-2">{r.source?.name || '—'}</td>
                      <td className="px-3 py-2"><StatusBadge status={r.status} t={t} /></td>
                      <td className="px-3 py-2 text-right">{r.found}</td>
                      <td className="px-3 py-2 text-right">{r.imported}</td>
                      <td className="px-3 py-2 text-right">{r.failed}</td>
                      <td className="px-3 py-2 text-right">{formatMs(r.processingMs)}</td>
                      <td className="px-3 py-2 text-muted-foreground text-xs">{formatDate(r.startedAt)}</td>
                    </tr>
                  ))}
                  {!stats.recentRuns?.length && <tr><td colSpan={7} className="px-3 py-6 text-center text-muted-foreground">{t('import.noLogs')}</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Sources Tab */}
      {activeTab === 'sources' && stats && (
        <div className="space-y-3">
          {stats.sources.map((s) => (
            <div key={s.id} className="flex items-center gap-3 rounded-lg border p-3">
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{s.name}</div>
                <div className="text-xs text-muted-foreground truncate">{s.baseUrl} · {s.scraperKey} · {s.type}</div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => toggleSource(s.id, 'enabled', !s.enabled)} disabled={running}>
                  {s.enabled ? <ToggleRight className="h-4 w-4 text-green-600" /> : <ToggleLeft className="h-4 w-4 text-muted-foreground" />}
                  <span className="text-xs">{s.enabled ? t('import.enabled') : t('import.sourceAction.disable')}</span>
                </Button>
                <Button size="sm" variant="outline" onClick={() => toggleSource(s.id, 'autoPublish', !s.autoPublish)} disabled={running}>
                  {s.autoPublish ? '✅' : '⬜'}
                  <span className="text-xs">{s.autoPublish ? t('import.sourceAction.autoPublishOn') : t('import.sourceAction.autoPublishOff')}</span>
                </Button>
                <Button size="sm" onClick={() => runImport(s.id)} disabled={running}>
                  <Play className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
          {stats.sources.length === 0 && <p className="text-center text-muted-foreground py-8">{t('import.noSources')}</p>}
        </div>
      )}

      {/* Logs Tab */}
      {activeTab === 'logs' && (
        <div className="space-y-2">
          {runs.map((r) => (
            <div key={r.id} className="rounded-lg border">
              <button className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-muted/30" onClick={() => setExpandedRun(expandedRun === r.id ? null : r.id)}>
                <StatusBadge status={r.status} t={t} />
                <span className="flex-1 truncate text-sm font-medium">{r.source?.name || r.sourceId}</span>
                <span className="text-xs text-muted-foreground">{formatDate(r.startedAt)}</span>
                <Eye className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
              {expandedRun === r.id && (
                <div className="border-t px-3 py-2 bg-muted/20 text-sm space-y-2">
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 text-center">
                    <div><div className="text-xs text-muted-foreground">{t('import.logFound')}</div><div className="font-semibold">{r.found}</div></div>
                    <div><div className="text-xs text-muted-foreground">{t('import.logImported')}</div><div className="font-semibold text-green-600">{r.imported}</div></div>
                    <div><div className="text-xs text-muted-foreground">{t('import.logUpdated')}</div><div className="font-semibold text-blue-600">{r.updated}</div></div>
                    <div><div className="text-xs text-muted-foreground">{t('import.logSkipped')}</div><div className="font-semibold">{r.skipped}</div></div>
                    <div><div className="text-xs text-muted-foreground">{t('import.logDuplicates')}</div><div className="font-semibold">{r.duplicates}</div></div>
                    <div><div className="text-xs text-muted-foreground">{t('import.logFailed')}</div><div className="font-semibold text-destructive">{r.failed}</div></div>
                  </div>
                  <div className="text-xs text-muted-foreground">{t('import.logDuration')}: {formatMs(r.processingMs)} · {t('import.logTriggeredBy')}: {r.triggeredBy || '—'}</div>
                  {r.errors && (
                    <details className="mt-1">
                      <summary className="cursor-pointer text-xs text-destructive">{t('import.logErrors')}</summary>
                      <pre className="mt-1 max-h-40 overflow-auto rounded bg-background p-2 text-xs">{r.errors}</pre>
                    </details>
                  )}
                </div>
              )}
            </div>
          ))}
          {runs.length === 0 && <p className="text-center text-muted-foreground py-8">{t('import.noLogs')}</p>}
        </div>
      )}
    </div>
  );
}

/* ─── Status Badge ──────────────────────────────────────────────────────── */

function StatusBadge({ status, t }: { status: string; t: (k: string) => string }) {
  const colors: Record<string, string> = {
    ok: 'bg-green-100 text-green-800',
    error: 'bg-red-100 text-red-800',
    partial: 'bg-yellow-100 text-yellow-800',
    running: 'bg-blue-100 text-blue-800',
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${colors[status] || 'bg-muted text-muted-foreground'}`}>
      {status === 'running' ? <Loader2 className="h-3 w-3 animate-spin" /> : status === 'ok' ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
      {t(`import.status.${status}`) || status}
    </span>
  );
}
