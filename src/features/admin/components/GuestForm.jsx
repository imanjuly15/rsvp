import { LIMITS } from '../constants/admin.constants.js';
import { useGuestForm } from '../hooks/useGuestForm.js';
import { ADMIN_STRINGS as S } from '../strings/admin.strings.js';
import { fillTemplate } from '../utils/admin.utils.js';
import Field from './Field.jsx';

/**
 * Add a guest (initial = null) or edit one. The ID is never shown or typed: the script makes it.
 * @param {{ initial: import('../api/adminApi.js').AdminGuest|null, onSave: Function, onDone: () => void }} props
 */
export default function GuestForm({ initial, onSave, onDone }) {
  const form = useGuestForm(initial, onSave);
  const { values, errors, setField } = form;
  const key = initial ? initial.id : 'new';

  async function onSubmit(e) {
    e.preventDefault();
    if (await form.submit()) onDone();
  }

  return (
    <form className="form-body" onSubmit={onSubmit} noValidate aria-labelledby={`form-title-${key}`}>
      <h2 id={`form-title-${key}`}>{initial ? fillTemplate(S.formEditTitle, { name: initial.name }) : S.formAddTitle}</h2>
      <div className="form-grid">
        <Field id={`name-${key}`} label={S.nameLabel} maxLength={LIMITS.NAME_MAX} value={values.name} onChange={(v) => setField('name', v)} error={errors.name} />
        <Field id={`pax-${key}`} label={S.paxLabel} inputMode="numeric" maxLength={2} value={values.pax} onChange={(v) => setField('pax', v)} error={errors.pax} />
        <Field id={`phone-${key}`} type="tel" inputMode="tel" label={S.phoneLabel} optional hint={S.phoneHint} maxLength={20} value={values.phone} onChange={(v) => setField('phone', v)} error={errors.phone} />
      </div>
      {form.formError && <p className="err" role="alert">{form.formError}</p>}
      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={form.saving}>{form.saving ? S.saving : S.save}</button>
        <button type="button" className="btn btn-ghost" onClick={onDone}>{S.cancel}</button>
      </div>
    </form>
  );
}
