export default function StatCard({ icon: Icon, label, value, hint, tone = 'sky' }) {
  const tones = {
    sky: 'from-sky-500/20 to-cyan-500/5 border-sky-400/20 text-sky-200',
    emerald: 'from-emerald-500/20 to-teal-500/5 border-emerald-400/20 text-emerald-200',
    amber: 'from-amber-500/20 to-orange-500/5 border-amber-400/20 text-amber-200',
    violet: 'from-violet-500/20 to-fuchsia-500/5 border-violet-400/20 text-violet-200',
    rose: 'from-rose-500/20 to-red-500/5 border-rose-400/20 text-rose-200'
  };

  return (
    <div className={`glass-panel rounded-[24px] border bg-gradient-to-br p-5 ${tones[tone]}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{label}</p>
          <div className="mt-3 text-3xl font-bold text-white">{value}</div>
          {hint ? <p className="mt-2 text-sm text-slate-300">{hint}</p> : null}
        </div>
        {Icon ? (
          <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
            <Icon className="h-5 w-5 text-white" />
          </div>
        ) : null}
      </div>
    </div>
  );
}
