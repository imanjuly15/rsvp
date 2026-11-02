import { ADMIN_STRINGS as S } from '../strings/admin.strings.js';

/** A labelled input with optional hint and error. The label is always visible. */
export default function Field({ id, label, optional, hint, error, value, onChange, type = 'text', ...inputProps }) {
  const describedBy = [hint && `hint-${id}`, error && `err-${id}`].filter(Boolean).join(' ') || undefined;
  return (
    <div className="field">
      <label htmlFor={id}>
        {label}
        {optional && <> <span className="opt">{S.optional}</span></>}
      </label>
      <input
        id={id}
        className="input"
        type={type}
        value={value}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy}
        onChange={(e) => onChange(e.target.value)}
        {...inputProps}
      />
      {hint && <p className="hint" id={`hint-${id}`}>{hint}</p>}
      {error && <p className="err" id={`err-${id}`} role="alert">{error}</p>}
    </div>
  );
}
