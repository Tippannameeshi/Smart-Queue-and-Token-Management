import { useEffect, useMemo, useState } from 'react';
import {
  BadgeHelp,
  BellRing,
  Clock3,
  MessageSquareQuote,
  RefreshCw,
  ShieldAlert,
  Ticket,
  TimerReset,
  Trash2
} from 'lucide-react';
import DashboardShell from '../components/shared/DashboardShell';
import StatCard from '../components/shared/StatCard';
import { useAuth } from '../context/useAuth';
import { reportService } from '../services/reportService';
import { tokenService } from '../services/tokenService';

function formatTokenTime(value) {
  if (!value) {
    return '--';
  }

  return new Date(value).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });
}

export default function CustomerPage() {
  const { user, logout } = useAuth();
  const [tokens, setTokens] = useState([]);
  const [stats, setStats] = useState(null);
  const [serviceType, setServiceType] = useState('GENERAL');
  const [isPriority, setIsPriority] = useState(false);
  const [priorityLevel, setPriorityLevel] = useState('SENIOR_CITIZEN');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [feedbackDrafts, setFeedbackDrafts] = useState({});
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const loadDashboard = async (customerId = user?.id) => {
    if (!customerId) {
      setTokens([]);
      return;
    }

    try {
      const [tokenResponse, statsResponse] = await Promise.all([
        tokenService.getMyTokens(),
        reportService.getQueueStats()
      ]);

      setTokens(Array.isArray(tokenResponse.data) ? tokenResponse.data : []);
      setStats(statsResponse.data || null);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (!user?.id) {
      setTokens([]);
      return undefined;
    }

    loadDashboard();
    const intervalId = window.setInterval(() => {
      loadDashboard();
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [user?.id]);

  const activeTokens = useMemo(
    () => tokens.filter((token) => !['COMPLETED', 'SKIPPED'].includes(token.status)),
    [tokens]
  );

  const latestToken = tokens[0];
  const calledToken = activeTokens.find((token) => token.status === 'CALLED');
  const feedbackEligibleTokens = tokens.filter((token) => token.canSubmitFeedback);

  const handleGenerate = async () => {
    setLoading(true);
    setMessage('');

    try {
      await tokenService.generateToken({
        serviceType,
        tokenType: isPriority ? 'PRIORITY' : 'REGULAR',
        priorityLevel: isPriority ? priorityLevel : 'REGULAR'
      });
      setMessage('Your token has been generated successfully.');
      await loadDashboard();
    } catch {
      setMessage('Token generation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateFeedbackDraft = (tokenId, field, value) => {
    setFeedbackDrafts((current) => ({
      ...current,
      [tokenId]: {
        rating: current[tokenId]?.rating ?? 5,
        comment: current[tokenId]?.comment ?? '',
        ...current[tokenId],
        [field]: value
      }
    }));
  };

  const handleFeedbackSubmit = async (tokenId) => {
    const draft = feedbackDrafts[tokenId] || { rating: 5, comment: '' };
    setFeedbackMessage('');

    try {
      await tokenService.submitFeedback({
        tokenId,
        rating: Number(draft.rating || 5),
        comment: draft.comment?.trim() || 'Service completed successfully.'
      });
      setFeedbackMessage('Thanks for sharing your feedback.');
      await loadDashboard();
    } catch {
      setFeedbackMessage('Unable to submit feedback right now.');
    }
  };

  const handleDeleteToken = async (token) => {
    if (!window.confirm(`Delete token ${token.tokenNumber}?`)) {
      return;
    }

    setMessage('');

    try {
      await tokenService.deleteToken(token.id);
      setMessage('Your token was deleted successfully.');
      await loadDashboard();
    } catch (error) {
      setMessage(error.response?.data?.error || 'Unable to delete this token right now.');
    }
  };

  const isSuccessMessage = message.includes('successfully');

  return (
    <DashboardShell
      user={user}
      logout={logout}
      title="Customer Service Portal"
      subtitle="Generate a new token, follow your queue position, and stay informed about service progress."
      accent="sky"
      actions={(
        <button
          onClick={() => loadDashboard()}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-110"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      )}
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Ticket}
          label="Active tokens"
          value={activeTokens.length}
          hint="Tokens still moving through the queue"
          tone="sky"
        />
        <StatCard
          icon={Clock3}
          label="People waiting now"
          value={stats?.waitingTokens ?? 0}
          hint="Current queue pressure"
          tone="amber"
        />
        <StatCard
          icon={TimerReset}
          label="Called for service"
          value={stats?.calledTokens ?? 0}
          hint="Customers recently invited to counters"
          tone="violet"
        />
        <StatCard
          icon={ShieldAlert}
          label="Priority tokens"
          value={stats?.priorityTokens ?? 0}
          hint="Priority-issued requests"
          tone="emerald"
        />
      </section>

      {calledToken ? (
        <section className="mt-6 rounded-[28px] border border-emerald-400/25 bg-emerald-400/10 p-5 text-emerald-50">
          <div className="flex items-start gap-3">
            <BellRing className="mt-0.5 h-5 w-5" />
            <div>
              <div className="font-semibold">Your token has been called</div>
              <div className="mt-1 text-sm text-emerald-100/90">
                {calledToken.notificationMessage || `${calledToken.tokenNumber} is ready at ${calledToken.currentCounterName || 'the service counter'}.`}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section className="mt-6 grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <div className="space-y-6">
          <div className="glass-panel rounded-[28px] border border-white/10 p-6">
            <h2 className="font-heading text-2xl text-white">Request a service token</h2>
            <p className="mt-1 text-sm text-slate-400">
              Choose your service category and enable priority only when it applies.
            </p>

            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Service type</label>
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="themed-select w-full rounded-2xl border border-white/10 px-4 py-3 text-white outline-none focus:border-sky-400/50"
                >
                  <option value="GENERAL">General enquiry</option>
                  <option value="ACCOUNT">Account services</option>
                  <option value="LOAN">Loan services</option>
                </select>
              </div>

              <label className="flex items-center gap-3 rounded-[20px] border border-white/10 bg-white/5 px-4 py-3">
                <input
                  type="checkbox"
                  checked={isPriority}
                  onChange={(e) => setIsPriority(e.target.checked)}
                  className="h-4 w-4 accent-sky-400"
                />
                <span className="text-sm text-slate-200">This request needs priority handling</span>
              </label>

              {isPriority ? (
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">Priority reason</label>
                  <select
                    value={priorityLevel}
                    onChange={(e) => setPriorityLevel(e.target.value)}
                    className="themed-select w-full rounded-2xl border border-white/10 px-4 py-3 text-white outline-none focus:border-sky-400/50"
                  >
                    <option value="SENIOR_CITIZEN">Senior citizen</option>
                    <option value="EMERGENCY">Emergency</option>
                    <option value="DIFFERENTLY_ABLED">Differently abled</option>
                  </select>
                </div>
              ) : null}

              <button
                onClick={handleGenerate}
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Ticket className="h-4 w-4" />
                {loading ? 'Generating token...' : 'Generate token'}
              </button>
            </div>

            {message ? (
              <div className={`mt-4 rounded-[22px] border px-4 py-3 text-sm ${
                isSuccessMessage
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100'
                  : 'border-rose-500/30 bg-rose-500/10 text-rose-100'
              }`}>
                {message}
              </div>
            ) : null}
          </div>

          <div className="glass-panel rounded-[28px] border border-white/10 p-6">
            <h2 className="font-heading text-2xl text-white">Queue guidance</h2>
            <div className="mt-5 space-y-4 text-sm text-slate-300">
              <div className="rounded-[22px] border border-white/10 bg-white/5 p-4">
                Current waiting load: <strong className="text-white">{stats?.waitingTokens ?? 0}</strong>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-white/5 p-4">
                Latest token: <strong className="text-white">{latestToken?.tokenNumber || 'None yet'}</strong>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-white/5 p-4">
                Tokens completed so far: <strong className="text-white">{stats?.completedTokens ?? 0}</strong>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-white/5 p-4">
                Your next position: <strong className="text-white">{activeTokens[0]?.waitingPosition || 'Not waiting'}</strong>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-[28px] border border-white/10 p-6">
            <h2 className="font-heading text-2xl text-white">Service feedback</h2>
            <p className="mt-1 text-sm text-slate-400">
              Completed tokens can receive one feedback response from their owner.
            </p>

            {feedbackMessage ? (
              <div className="mt-4 rounded-[22px] border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                {feedbackMessage}
              </div>
            ) : null}

            <div className="mt-5 space-y-4">
              {feedbackEligibleTokens.length === 0 ? (
                <div className="rounded-[22px] border border-dashed border-white/10 bg-white/5 p-4 text-sm text-slate-400">
                  Feedback becomes available after one of your tokens is completed.
                </div>
              ) : (
                feedbackEligibleTokens.map((token) => {
                  const draft = feedbackDrafts[token.id] || { rating: 5, comment: '' };
                  return (
                    <div key={token.id} className="rounded-[22px] border border-white/10 bg-white/5 p-4">
                      <div className="font-semibold text-white">{token.tokenNumber}</div>
                      <div className="mt-1 text-sm text-slate-400">
                        {token.serviceType} service completed at counter {token.currentCounterNumber || '-'}
                      </div>
                      <div className="mt-4 grid gap-3">
                        <select
                          value={draft.rating}
                          onChange={(event) => updateFeedbackDraft(token.id, 'rating', event.target.value)}
                          className="themed-select rounded-2xl border border-white/10 px-4 py-3 text-white outline-none focus:border-sky-400/50"
                        >
                          {[5, 4, 3, 2, 1].map((rating) => (
                            <option key={rating} value={rating}>
                              {rating} star{rating > 1 ? 's' : ''}
                            </option>
                          ))}
                        </select>
                        <textarea
                          value={draft.comment}
                          onChange={(event) => updateFeedbackDraft(token.id, 'comment', event.target.value)}
                          rows={3}
                          className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-sky-400/50"
                          placeholder="Share your experience"
                        />
                        <button
                          onClick={() => handleFeedbackSubmit(token.id)}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-110"
                        >
                          <MessageSquareQuote className="h-4 w-4" />
                          Submit feedback
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-[28px] border border-white/10 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading text-2xl text-white">My token history</h2>
              <p className="mt-1 text-sm text-slate-400">
                Follow current and previous token movements through the lifecycle.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
              {tokens.length} total records
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {tokens.length === 0 ? (
              <div className="rounded-[22px] border border-dashed border-white/10 bg-white/5 px-5 py-10 text-center text-slate-400">
                No tokens generated yet.
              </div>
            ) : (
              tokens.map((token) => (
                <div key={token.id} className="rounded-[22px] border border-white/10 bg-slate-950/45 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="font-mono text-xl font-bold text-white">{token.tokenNumber}</div>
                      <div className="mt-1 text-sm text-slate-400">
                        {token.serviceType} | {token.tokenType === 'PRIORITY' ? token.priorityLevel.replaceAll('_', ' ') : 'Regular'} | Issued at {formatTokenTime(token.generatedAt)}
                      </div>
                      <div className="mt-1 text-sm text-slate-500">
                        Queue position #{token.waitingPosition || '-'} {token.currentCounterName ? `| ${token.currentCounterName}` : ''}
                      </div>
                      {token.notificationMessage ? (
                        <div className="mt-3 rounded-2xl border border-sky-400/15 bg-sky-400/10 px-3 py-2 text-sm text-sky-100">
                          {token.notificationMessage}
                        </div>
                      ) : null}
                    </div>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-200">
                      {token.status}
                    </span>
                  </div>
                  {token.status === 'WAITING' || token.status === 'SKIPPED' ? (
                    <div className="mt-4">
                      <button
                        onClick={() => handleDeleteToken(token)}
                        className="inline-flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-100 transition hover:bg-rose-500/20"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete token
                      </button>
                    </div>
                  ) : null}
                </div>
              ))
            )}
          </div>

          <div className="mt-6 rounded-[24px] border border-sky-400/20 bg-sky-400/10 p-4 text-sm text-sky-100">
            <div className="flex items-center gap-2 font-semibold">
              <BadgeHelp className="h-4 w-4" />
              Token lifecycle
            </div>
            <p className="mt-2">Generated {'->'} Waiting {'->'} Called {'->'} In Service {'->'} Completed, with Skipped as the alternate service path.</p>
          </div>
        </div>
      </section>
    </DashboardShell>
  );
}
