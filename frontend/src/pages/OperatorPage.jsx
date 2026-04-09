import { useEffect, useState } from 'react';
import {
  BellRing,
  CheckCircle2,
  RefreshCw,
  SkipForward,
  UsersRound,
  Waves
} from 'lucide-react';
import DashboardShell from '../components/shared/DashboardShell';
import StatCard from '../components/shared/StatCard';
import { useAuth } from '../context/useAuth';
import { reportService } from '../services/reportService';
import { tokenService } from '../services/tokenService';

export default function OperatorPage() {
  const { user, logout } = useAuth();
  const [queue, setQueue] = useState([]);
  const [counters, setCounters] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedCounter, setSelectedCounter] = useState(1);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const loadDashboard = async () => {
    try {
      const [queueResponse, countersResponse, statsResponse] = await Promise.all([
        tokenService.getQueue(),
        reportService.getCounters(),
        reportService.getQueueStats()
      ]);

      const queueData = Array.isArray(queueResponse.data) ? queueResponse.data : [];
      const counterData = Array.isArray(countersResponse.data) ? countersResponse.data : [];

      setQueue(queueData);
      setCounters(counterData);
      setStats(statsResponse.data || null);

      if (counterData.length > 0) {
        setSelectedCounter((currentCounter) => currentCounter || counterData[0].id);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadDashboard();
    const intervalId = window.setInterval(() => {
      loadDashboard();
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, []);

  const handleCallNext = async () => {
    setLoading(true);

    try {
      const response = await tokenService.callNext(selectedCounter);
      setMessage(`Next customer called: ${response.data.tokenNumber}`);
      await loadDashboard();
    } catch {
      setMessage('No waiting token is available for this counter right now.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (tokenId, status) => {
    try {
      await tokenService.updateStatus(tokenId, status);
      setMessage(`Token moved to ${status.replace('_', ' ')}.`);
      await loadDashboard();
    } catch {
      setMessage('This token cannot move to the selected status.');
    }
  };

  const handleSkip = async (tokenId) => {
    try {
      await tokenService.skipToken(tokenId);
      setMessage('Token skipped successfully.');
      await loadDashboard();
    } catch {
      setMessage('Unable to skip this token right now.');
    }
  };

  const selectedCounterInfo = counters.find((counter) => counter.id === selectedCounter);
  const activeCounterToken = selectedCounterInfo?.currentToken;
  const isPositiveMessage = message.includes('called') || message.includes('successfully') || message.includes('moved');

  return (
    <DashboardShell
      user={user}
      logout={logout}
      title="Operator Service Desk"
      subtitle="Call the next waiting customer, update token status, and keep the selected counter moving smoothly."
      accent="emerald"
      actions={(
        <button
          onClick={loadDashboard}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-110"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      )}
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={UsersRound}
          label="Waiting queue"
          value={stats?.waitingTokens ?? queue.length}
          hint="Customers ready to be called"
          tone="sky"
        />
        <StatCard
          icon={BellRing}
          label="Called"
          value={stats?.calledTokens ?? 0}
          hint="Already announced customers"
          tone="amber"
        />
        <StatCard
          icon={Waves}
          label="In service"
          value={stats?.inServiceTokens ?? 0}
          hint="Customers currently at desks"
          tone="violet"
        />
        <StatCard
          icon={CheckCircle2}
          label="Completed"
          value={stats?.completedTokens ?? 0}
          hint="Finished service sessions"
          tone="emerald"
        />
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-6">
          <div className="glass-panel rounded-[28px] border border-white/10 p-6">
            <h2 className="font-heading text-2xl text-white">Counter control</h2>
            <p className="mt-1 text-sm text-slate-400">
              Select your working desk and trigger the next queue action.
            </p>

            <div className="mt-5">
              <label className="mb-2 block text-sm font-medium text-slate-300">Assigned counter</label>
              <select
                value={selectedCounter}
                onChange={(e) => setSelectedCounter(Number(e.target.value))}
                className="themed-select w-full rounded-2xl border border-white/10 px-4 py-3 text-white outline-none focus:border-emerald-400/50"
              >
                {counters.map((counter) => (
                  <option key={counter.id} value={counter.id}>
                    {counter.counterName} - {counter.status}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-4 rounded-[22px] border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
              Current token at this desk: {activeCounterToken?.tokenNumber || 'No token in service'}
            </div>

            <button
              onClick={handleCallNext}
              disabled={loading}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 px-4 py-3 font-semibold text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <BellRing className="h-4 w-4" />
              {loading ? 'Calling next token...' : 'Call next token'}
            </button>

            {message ? (
              <div className={`mt-4 rounded-[22px] border px-4 py-3 text-sm ${
                isPositiveMessage
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100'
                  : 'border-rose-500/30 bg-rose-500/10 text-rose-100'
              }`}>
                {message}
              </div>
            ) : null}
          </div>

          <div className="glass-panel rounded-[28px] border border-white/10 p-6">
            <h2 className="font-heading text-2xl text-white">Current token actions</h2>
            <p className="mt-1 text-sm text-slate-400">
              Advance only the token assigned to the selected counter.
            </p>

            <div className="mt-5">
              {!activeCounterToken ? (
                <div className="rounded-[22px] border border-dashed border-white/10 bg-white/5 px-5 py-8 text-center text-slate-400">
                  Call the next token to begin service at this desk.
                </div>
              ) : (
                <div className="rounded-[22px] border border-white/10 bg-white/5 p-4">
                  <div className="font-mono text-lg font-bold text-white">{activeCounterToken.tokenNumber}</div>
                  <div className="mt-1 text-sm text-slate-400">
                    {activeCounterToken.serviceType} | {activeCounterToken.priorityLevel.replaceAll('_', ' ')}
                  </div>
                  <div className="mt-3 text-sm text-slate-300">
                    Current status: <strong className="text-white">{activeCounterToken.status}</strong>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {activeCounterToken.status === 'CALLED' ? (
                      <button
                        onClick={() => handleUpdateStatus(activeCounterToken.id, 'IN_SERVICE')}
                        className="rounded-xl bg-violet-500/20 px-3 py-2 text-xs font-semibold text-violet-100 transition hover:bg-violet-500/30"
                      >
                        Start service
                      </button>
                    ) : null}
                    {activeCounterToken.status === 'IN_SERVICE' ? (
                      <button
                        onClick={() => handleUpdateStatus(activeCounterToken.id, 'COMPLETED')}
                        className="rounded-xl bg-emerald-500/20 px-3 py-2 text-xs font-semibold text-emerald-100 transition hover:bg-emerald-500/30"
                      >
                        Mark complete
                      </button>
                    ) : null}
                    {(activeCounterToken.status === 'CALLED' || activeCounterToken.status === 'WAITING') ? (
                      <button
                        onClick={() => handleSkip(activeCounterToken.id)}
                        className="inline-flex items-center gap-2 rounded-xl bg-rose-500/20 px-3 py-2 text-xs font-semibold text-rose-100 transition hover:bg-rose-500/30"
                      >
                        <SkipForward className="h-3.5 w-3.5" />
                        Skip
                      </button>
                    ) : null}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="glass-panel rounded-[28px] border border-white/10 p-6">
            <h2 className="font-heading text-2xl text-white">Desk overview</h2>
            <div className="mt-5 space-y-3">
              {counters.map((counter) => (
                <div key={counter.id} className="rounded-[22px] border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between">
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
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-[28px] border border-white/10 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading text-2xl text-white">Waiting queue</h2>
              <p className="mt-1 text-sm text-slate-400">
                Review queue order and priority before calling the next customer.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
              {queue.length} waiting items
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {queue.length === 0 ? (
              <div className="rounded-[22px] border border-dashed border-white/10 bg-white/5 px-5 py-10 text-center text-slate-400">
                Queue is empty right now.
              </div>
            ) : (
              queue.map((token, index) => (
                <div
                  key={token.id}
                  className="rounded-[22px] border border-white/10 bg-slate-950/45 p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/15 font-semibold text-emerald-100">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-mono text-lg font-bold text-white">{token.tokenNumber}</div>
                      <div className="text-sm text-slate-400">
                        {token.serviceType} | {token.priorityLevel.replaceAll('_', ' ')} | Position #{token.waitingPosition}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </DashboardShell>
  );
}
