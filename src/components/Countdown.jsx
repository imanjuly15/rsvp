import { useEffect, useState } from 'react';

const pad = (n) => String(n).padStart(2, '0');
const LABELS = ['Days', 'Hours', 'Minutes', 'Seconds'];

export default function Countdown({ target }) {
  const [now, setNow] = useState(() => Date.now());
  const left = Math.max(0, target - now);

  useEffect(() => {
    if (left === 0) return undefined;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [left === 0]); // eslint-disable-line react-hooks/exhaustive-deps

  if (Number.isNaN(target) || left === 0) return null;

  const secs = Math.floor(left / 1000);
  const values = [Math.floor(secs / 86400), Math.floor(secs / 3600) % 24, Math.floor(secs / 60) % 60, secs % 60];

  return (
    <>
      <p className="count-title">Until we gather in his memory</p>
      <div className="countdown" role="img" aria-label={`${values[0]} days and ${values[1]} hours until the luncheon`}>
        {LABELS.map((label, i) => (
          <div className="count-unit" aria-hidden="true" key={label}>
            <b>{pad(values[i])}</b>
            <span>{label}</span>
          </div>
        ))}
      </div>
    </>
  );
}
