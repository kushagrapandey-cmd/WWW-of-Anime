export default function ProgressBar({ value = 0, max = 100, label = 'Progress', color = '#c2ff43' }) {
  const limit = Number.isFinite(max) && max > 0 ? max : 100;
  const current = Math.min(limit, Math.max(0, Number.isFinite(value) ? value : 0));
  return <div className="progress" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={limit} aria-valuenow={current}><div style={{ width: `${current / limit * 100}%`, background: color }} /></div>;
}
