import { LogOut, ShieldCheck } from 'lucide-react';
import { getRoleLabel } from '../../utils/roleUtils';

export default function DashboardShell({
  user,
  title,
  subtitle,
  accent = 'sky',
  actions,
  children,
  logout
}) {
  const accentClasses = {
    sky: 'from-sky-500/25 via-cyan-500/10 to-transparent border-sky-400/30 text-sky-100',
    emerald: 'from-emerald-500/25 via-teal-500/10 to-transparent border-emerald-400/30 text-emerald-100',
    amber: 'from-amber-500/25 via-orange-500/10 to-transparent border-amber-400/30 text-amber-100',
    violet: 'from-violet-500/25 via-fuchsia-500/10 to-transparent border-violet-400/30 text-violet-100'
  };

  return (
    <div className="app-shell min-h-screen text-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="glass-panel sticky top-4 z-20 mb-6 flex flex-col gap-4 rounded-[28px] px-5 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className={`hidden h-12 w-12 rounded-2xl border bg-gradient-to-br ${accentClasses[accent]} sm:flex sm:items-center sm:justify-center`}>
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
                Smart Queue & Token Management System
              </p>
              <h1 className="mt-1 font-heading text-3xl text-white sm:text-4xl">{title}</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-300 sm:text-base">{subtitle}</p>
            </div>
          </div>

          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
              <div className="font-semibold text-white">{user?.name}</div>
              <div className="text-slate-400">{getRoleLabel(user?.role)}</div>
            </div>
            <div className="flex gap-2">
              {actions}
              <button
                onClick={logout}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-white/20 hover:bg-white/10"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
