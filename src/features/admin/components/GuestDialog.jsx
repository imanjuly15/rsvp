import { useEffect, useRef } from 'react';
import GuestForm from './GuestForm.jsx';

/**
 * The add / edit guest form as a pop-up, using the browser's own modal <dialog>: focus moves into the form,
 * the page behind cannot be reached, Esc closes it, and focus returns to the button that opened it.
 * Clicking the dimmed background does not close it, so a stray tap never throws away what was typed.
 */
export default function GuestDialog({ initial, onSave, onDone }) {
  const ref = useRef(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog.open) dialog.showModal();
    return () => { if (dialog.open) dialog.close(); };
  }, []);

  return (
    <dialog ref={ref} className="dialog" aria-labelledby={`form-title-${initial ? initial.id : 'new'}`} onCancel={(e) => { e.preventDefault(); onDone(); }}>
      <GuestForm initial={initial} onSave={onSave} onDone={onDone} />
    </dialog>
  );
}
