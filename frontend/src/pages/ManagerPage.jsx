import { useEffect, useState } from 'react';
import {
  CheckCircle2,
  ClipboardList,
  RefreshCw,
  TimerReset,
  Waves
} from 'lucide-react';
import DashboardShell from '../components/shared/DashboardShell';
import StatCard from '../components/shared/StatCard';
import { useAuth } from '../context/useAuth';
import { reportService } from '../services/reportService';
import { tokenService } from '../services/tokenService';

export default function ManagerPage() {
  const { user, logout } = useAuth();
  const [queue, setQueue] = useState([]);
  const [counters, setCounters] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadDashboard = async () => {
    setLoading(true);

    try {
      const [queueResponse, countersResponse, statsResponse] = await Promise.all([
        tokenService.getQueue(),
        reportService.getCounters(),
        reportService.getQueueStats()
      ]);

      setQueue(Array.isArray(queueResponse.data) ? queueResponse.data : []);
      setCounters(Array.isArray(countersResponse.data) ? countersResponse.data : []);
      setStats(statsResponse.data || null);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
    const intervalId = window.setInterval(() => {
      loadDashboard();
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, []);

  const bottleneckCounter = counters.find((counter) => counter.currentToken?.status === 'IN_SERVICE');

  return (
    <DashboardShell
      user={user}
      logout={logout}
      title="Queue Monitoring Dashboard"
      subtitle="Track live workload, counter availability, and queue flow to keep the service floor balanced."
      accent="violet"
      actions={(
        <button
          onClick={loadDashboard}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-violet-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-110"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      )}
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={ClipboardList}
          label="Waiting"
          value={stats?.waitingTokens ?? 0}
          hint="Customers ready to be called"
          tone="sky"
        />
        <StatCard
          icon={TimerReset}
          label="Called"
          value={stats?.calledTokens ?? 0}
          hint="Customers already announced"
          tone="amber"
        />
        <StatCard
          icon={Waves}
          label="In service"
          value={stats?.inServiceTokens ?? 0}
          hint="Currently being served"
          tone="violet"
        />
        <StatCard
          icon={CheckCircle2}
          label="Completed"
          value={stats?.completedTokens ?? 0}
          hint="Finished transactions"
          tone="emerald"
        />
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="glass-panel rounded-[28px] border border-white/10 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading text-2xl text-white">Live queue board</h2>
              <p className="mt-1 text-sm text-slate-400">
                Ordered list of active waiting tokens based on the current queue strategy.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
              {queue.length} active queue items
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {queue.length === 0 ? (
              <div className="rounded-[22px] border border-dashed border-white/10 bg-white/5 px-5 py-10 text-center text-slate-400">
                No tokens are waiting in the live queue.
              </div>
            ) : (
              queue.map((token, index) => (
                <div
                  key={token.id}
                  className="rounded-[22px] border border-white/10 bg-slate-950/45 px-4 py-4 sm:flex sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/15 font-semibold text-violet-100">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-mono text-lg font-bold text-white">{token.tokenNumber}</div>
                      <div className="text-sm text-slate-400">Status: {token.status}</div>
                    </div>
                  </div>
                  <div className="mt-3 text-sm text-slate-300 sm:mt-0">
                    Waiting position #{token.waitingPosition}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-panel rounded-[28px] border border-white/10 p-6">
            <h2 className="font-heading text-2xl text-white">Counter readiness</h2>
            <p className="mt-1 text-sm text-slate-400">
              View which desks are open and what they are currently serving.
            </p>

            <div className="mt-5 grid gap-3">
              {counters.map((counter) => (
                <div key={counter.id} className="rounded-[22px] border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold text-white">{counter.counterName}</div>
                      <div className="text-sm text-slate-400">Desk #{counter.counterNumber}</div>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
                      counter.status === 'OPEN'
                        ? 'bg-emerald-500/15 text-emerald-200'
                        : 'bg-rose-500/15 text-rose-200'
                    }`}>
                      {counter.status}
                    </span>
                  </div>
                  <div className="mt-3 text-sm text-slate-300">
                    Current token: {counter.currentToken?.tokenNumber || 'Not serving right now'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-[28px] border border-white/10 p-6">
            <h2 className="font-heading text-2xl text-white">Service health snapshot</h2>
            <div className="mt-5 space-y-4 text-sm text-slate-300">
              <div className="flex items-center justify-between">
                <span>Open counters</span>
                <strong className="text-white">{stats?.activeCounters ?? 0}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>Priority tokens issued</span>
                <strong className="text-white">{stats?.priorityTokens ?? 0}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>Skipped tokens</span>
                <strong className="text-white">{stats?.skippedTokens ?? 0}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>Total tokens processed</span>
                <strong className="text-white">{stats?.totalTokens ?? 0}</strong>
              </div>
            </div>
            <div className="mt-5 rounded-[22px] border border-white/10 bg-violet-500/10 p-4 text-sm text-violet-100">
              Priority ordering is active in the backend. Manager-side rule editing is still a future enhancement.
            </div>
            <div className="mt-4 rounded-[22px] border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
              Potential bottleneck: <strong className="text-white">{bottleneckCounter?.counterName || 'No current delay signal'}</strong>
            </div>
          </div>
        </div>
      </section>
    </DashboardShell>
  );
}
