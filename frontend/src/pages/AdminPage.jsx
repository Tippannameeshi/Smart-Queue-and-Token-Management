import { useEffect, useState } from 'react';
import {
  Activity,
  CircleUserRound,
  RefreshCw,
  Shield,
  SquareTerminal,
  Trash2,
  UserPlus,
  Users
} from 'lucide-react';
import DashboardShell from '../components/shared/DashboardShell';
import StatCard from '../components/shared/StatCard';
import { useAuth } from '../context/useAuth';
import { counterService } from '../services/counterService';
import { reportService } from '../services/reportService';
import { userService } from '../services/userService';
import { COUNTER_STATUS_OPTIONS } from '../utils/counterUtils';
import { getRoleLabel, ROLE_OPTIONS } from '../utils/roleUtils';

const initialForm = {
  name: '',
  email: '',
  password: '',
  role: 'CUSTOMER'
};

const initialCounterForm = {
  counterName: '',
  counterNumber: '',
  status: 'OPEN',
  active: true
};

export default function AdminPage() {
  const { user, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [counters, setCounters] = useState([]);
  const [stats, setStats] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [counterForm, setCounterForm] = useState(initialCounterForm);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [busyUserId, setBusyUserId] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadDashboard = async () => {
    setLoading(true);
    setError('');

    try {
      const [usersResponse, countersResponse, statsResponse] = await Promise.all([
        userService.getAllUsers(),
        reportService.getCounters(),
        reportService.getQueueStats()
      ]);

      setUsers(Array.isArray(usersResponse.data) ? usersResponse.data : []);
      setCounters(Array.isArray(countersResponse.data) ? countersResponse.data : []);
      setStats(statsResponse.data || null);
    } catch (requestError) {
      console.error(requestError);
      setError(requestError.response?.data?.message || requestError.response?.data?.error || 'Unable to load admin dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const roleSummary = users.reduce((summary, account) => {
    const role = getRoleLabel(account.role);
    summary[role] = (summary[role] || 0) + 1;
    return summary;
  }, {});

  const handleCreateUser = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage('');
    setError('');

    try {
      const response = await userService.createUser(form);
      setUsers((current) => [...current, response.data]);
      setForm(initialForm);
      setMessage(`${response.data.name} was created successfully.`);
      await loadDashboard();
    } catch (requestError) {
      console.error(requestError);
      setError(requestError.response?.data?.message || requestError.response?.data?.error || 'Unable to create user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRoleChange = async (userId, nextRole) => {
    if (userId === user?.id) {
      setError('Your own admin role cannot be changed from this dashboard.');
      return;
    }

    setBusyUserId(userId);
    setMessage('');
    setError('');

    try {
      const response = await userService.updateUserRole(userId, nextRole);
      setUsers((current) => current.map((account) => (
        account.id === userId ? response.data : account
      )));
      setMessage(`Role updated to ${getRoleLabel(nextRole)}.`);
      await loadDashboard();
    } catch (requestError) {
      console.error(requestError);
      setError(requestError.response?.data?.message || requestError.response?.data?.error || 'Unable to update role');
    } finally {
      setBusyUserId(null);
    }
  };

  const handleDeleteUser = async (account) => {
    if (account.id === user?.id) {
      setError('Your own admin account cannot be deleted from this dashboard.');
      return;
    }

    if (!window.confirm(`Delete ${account.name}? This action cannot be undone.`)) {
      return;
    }

    setBusyUserId(account.id);
    setMessage('');
    setError('');

    try {
      await userService.deleteUser(account.id);
      setUsers((current) => current.filter((currentUser) => currentUser.id !== account.id));
      setMessage(`${account.name} was deleted successfully.`);
      await loadDashboard();
    } catch (requestError) {
      console.error(requestError);
      setError(requestError.response?.data?.message || requestError.response?.data?.error || 'Unable to delete user');
    } finally {
      setBusyUserId(null);
    }
  };

  const handleCreateCounter = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');

    try {
      await counterService.createCounter({
        ...counterForm,
        counterNumber: Number(counterForm.counterNumber)
      });
      setCounterForm(initialCounterForm);
      setMessage('Counter created successfully.');
      await loadDashboard();
    } catch (requestError) {
      console.error(requestError);
      setError(requestError.response?.data?.message || requestError.response?.data?.error || 'Unable to create counter');
    }
  };

  const handleCounterChange = async (counterId, nextValues) => {
    setMessage('');
    setError('');

    try {
      await counterService.updateCounter(counterId, {
        ...nextValues,
        counterNumber: Number(nextValues.counterNumber)
      });
      setMessage('Counter updated successfully.');
      await loadDashboard();
    } catch (requestError) {
      console.error(requestError);
      setError(requestError.response?.data?.message || requestError.response?.data?.error || 'Unable to update counter');
    }
  };

  const handleDeleteCounter = async (counter) => {
    if (!window.confirm(`Delete ${counter.counterName}?`)) {
      return;
    }

    setMessage('');
    setError('');

    try {
      await counterService.deleteCounter(counter.id);
      setMessage('Counter deleted successfully.');
      await loadDashboard();
    } catch (requestError) {
      console.error(requestError);
      setError(requestError.response?.data?.message || requestError.response?.data?.error || 'Unable to delete counter');
    }
  };

  return (
    <DashboardShell
      user={user}
      logout={logout}
      title="Administration Command Center"
      subtitle="Create accounts, assign operational roles, and keep queue activity under control from one secure workspace."
      accent="amber"
      actions={(
        <button
          onClick={loadDashboard}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-110"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      )}
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Users}
          label="Registered users"
          value={stats?.totalUsers ?? users.length}
          hint="All accounts across roles"
          tone="amber"
        />
        <StatCard
          icon={SquareTerminal}
          label="Service counters"
          value={stats?.totalCounters ?? counters.length}
          hint={`${stats?.activeCounters ?? counters.filter((counter) => counter.status === 'OPEN').length} currently open`}
          tone="emerald"
        />
        <StatCard
          icon={Activity}
          label="Completed tokens"
          value={stats?.completedTokens ?? 0}
          hint="Services fully processed"
          tone="sky"
        />
        <StatCard
          icon={Shield}
          label="Priority volume"
          value={stats?.priorityTokens ?? 0}
          hint="Priority requests issued"
          tone="violet"
        />
      </section>

      {(message || error) ? (
        <section className="mt-6 grid gap-3">
          {message ? (
            <div className="rounded-[22px] border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
              {message}
            </div>
          ) : null}
          {error ? (
            <div className="rounded-[22px] border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
              {error}
            </div>
          ) : null}
        </section>
      ) : null}

      <section className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-6">
          <div className="glass-panel rounded-[28px] border border-white/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-heading text-2xl text-white">Create user</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Add a new account and assign the correct role from day one.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <UserPlus className="h-5 w-5 text-amber-200" />
              </div>
            </div>

            <form onSubmit={handleCreateUser} className="mt-5 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition focus:border-amber-400/50"
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition focus:border-amber-400/50"
                  placeholder="Enter email address"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Password</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition focus:border-amber-400/50"
                  placeholder="Minimum 6 characters"
                  minLength={6}
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Role</label>
                <select
                  value={form.role}
                  onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))}
                  className="themed-select w-full rounded-2xl border border-white/10 px-4 py-3 text-white outline-none focus:border-amber-400/50"
                >
                  {ROLE_OPTIONS.map((role) => (
                    <option key={role} value={role}>
                      {getRoleLabel(role)}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-300 px-4 py-3 font-semibold text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <UserPlus className="h-4 w-4" />
                {submitting ? 'Creating user...' : 'Create user'}
              </button>
            </form>
          </div>

          <div className="glass-panel rounded-[28px] border border-white/10 p-6">
            <h2 className="font-heading text-2xl text-white">Role distribution</h2>
            <p className="mt-1 text-sm text-slate-400">
              Snapshot of account ownership across the platform.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {Object.entries(roleSummary).map(([role, count]) => (
                <div key={role} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-500">{role}</div>
                  <div className="mt-2 text-2xl font-bold text-white">{count}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-panel rounded-[28px] border border-white/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-heading text-2xl text-white">User management</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Review every account, update roles in place, and remove old access safely.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
                {users.length} total records
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {users.map((account) => (
                <div
                  key={account.id}
                  className="rounded-[22px] border border-white/10 bg-slate-950/45 px-4 py-4"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
                        <CircleUserRound className="h-5 w-5 text-amber-200" />
                      </div>
                      <div>
                        <div className="font-semibold text-white">{account.name}</div>
                        <div className="text-sm text-slate-400">{account.email}</div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <select
                        value={account.role}
                        onChange={(event) => handleRoleChange(account.id, event.target.value)}
                        disabled={busyUserId === account.id || account.id === user?.id}
                        className="themed-select rounded-2xl border border-white/10 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-400/50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {ROLE_OPTIONS.map((role) => (
                          <option key={role} value={role}>
                            {getRoleLabel(role)}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={() => handleDeleteUser(account)}
                        disabled={busyUserId === account.id || account.id === user?.id}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-100 transition hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-400">
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-200">
                      {getRoleLabel(account.role)}
                    </span>
                    {account.id === user?.id ? (
                      <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-amber-100">
                        Current session
                      </span>
                    ) : null}
                    {account.id === user?.id ? (
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-200">
                        Role locked
                      </span>
                    ) : null}
                  </div>
                </div>
              ))}

              {users.length === 0 ? (
                <div className="rounded-[22px] border border-dashed border-white/10 bg-white/5 px-5 py-10 text-center text-slate-400">
                  No users available yet.
                </div>
              ) : null}
            </div>
          </div>

          <div className="glass-panel rounded-[28px] border border-white/10 p-6">
            <h2 className="font-heading text-2xl text-white">Counter management</h2>
            <p className="mt-1 text-sm text-slate-400">
              Create counters, adjust their status, and remove unused desks.
            </p>

            <form onSubmit={handleCreateCounter} className="mt-5 grid gap-3 rounded-[22px] border border-white/10 bg-white/5 p-4">
              <input
                type="text"
                value={counterForm.counterName}
                onChange={(event) => setCounterForm((current) => ({ ...current, counterName: event.target.value }))}
                className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition focus:border-amber-400/50"
                placeholder="Counter name"
                required
              />
              <input
                type="number"
                min="1"
                value={counterForm.counterNumber}
                onChange={(event) => setCounterForm((current) => ({ ...current, counterNumber: event.target.value }))}
                className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition focus:border-amber-400/50"
                placeholder="Counter number"
                required
              />
              <select
                value={counterForm.status}
                onChange={(event) => setCounterForm((current) => ({ ...current, status: event.target.value }))}
                className="themed-select rounded-2xl border border-white/10 px-4 py-3 text-white outline-none transition focus:border-amber-400/50"
              >
                {COUNTER_STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-slate-200">
                <input
                  type="checkbox"
                  checked={counterForm.active}
                  onChange={(event) => setCounterForm((current) => ({ ...current, active: event.target.checked }))}
                  className="h-4 w-4 accent-amber-400"
                />
                Counter is active
              </label>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-110"
              >
                Create counter
              </button>
            </form>

            <div className="mt-5 space-y-3">
              {counters.map((counter) => (
                <div key={counter.id} className="rounded-[22px] border border-white/10 bg-white/5 p-4">
                  <div className="flex items-start justify-between gap-3">
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
                    Current token: {counter.currentToken?.tokenNumber || 'No active assignment'}
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-4">
                    <input
                      type="text"
                      defaultValue={counter.counterName}
                      onBlur={(event) => {
                        const nextName = event.target.value.trim();
                        if (nextName && nextName !== counter.counterName) {
                          handleCounterChange(counter.id, {
                            counterName: nextName,
                            counterNumber: counter.counterNumber,
                            status: counter.status,
                            active: counter.active
                          });
                        }
                      }}
                      className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-400/50"
                    />
                    <input
                      type="number"
                      min="1"
                      defaultValue={counter.counterNumber}
                      onBlur={(event) => {
                        const nextNumber = Number(event.target.value);
                        if (nextNumber && nextNumber !== counter.counterNumber) {
                          handleCounterChange(counter.id, {
                            counterName: counter.counterName,
                            counterNumber: nextNumber,
                            status: counter.status,
                            active: counter.active
                          });
                        }
                      }}
                      className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-400/50"
                    />
                    <select
                      value={counter.status}
                      onChange={(event) => handleCounterChange(counter.id, {
                        counterName: counter.counterName,
                        counterNumber: counter.counterNumber,
                        status: event.target.value,
                        active: counter.active
                      })}
                      className="themed-select rounded-2xl border border-white/10 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-400/50"
                    >
                      {COUNTER_STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => handleDeleteCounter(counter)}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-100 transition hover:bg-rose-500/20"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </DashboardShell>
  );
}
