import { useState } from 'react';
import { checkGuestForm } from '../services/admin.service.js';

/**
 * The add/edit guest form.
 * @param {{ name: string, pax: number, phone: string }|null} initial  null for a new guest
 * @param {(guest: import('../api/adminApi.js').GuestInput) => Promise<string>} onSave  resolves to an error message or ""
 */
export function useGuestForm(initial, onSave) {
  const [values, setValues] = useState(() => ({
    name: initial ? initial.name : '',
    pax: initial ? String(initial.pax) : '1',
    phone: initial ? initial.phone : '',
  }));
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  function setField(field, value) {
    setValues((v) => ({ ...v, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  }

  /** @returns {Promise<boolean>} true when saved */
  async function submit() {
    if (saving) return false;
    const { errors: found, guest } = checkGuestForm(values);
    setErrors(found);
    setFormError('');
    if (!guest) return false;
    setSaving(true);
    const message = await onSave(guest);
    setSaving(false);
    setFormError(message);
    return !message;
  }

  return { values, errors, formError, saving, setField, submit };
}
