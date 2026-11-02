import { useEffect, useState } from 'react';

/** A floating shortcut to the RSVP section, shown while the guest is reading the invitation. */
export default function ConfirmButton() {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const io = new IntersectionObserver(([entry]) => setShown(entry.isIntersecting), { rootMargin: '0px 0px -12% 0px' });
    io.observe(document.querySelector('.tribute'));
    return () => io.disconnect();
  }, []);

  return (
    <a className={`confirm-float${shown ? ' shown' : ''}`} href="#rsvp" tabIndex={shown ? undefined : -1} aria-hidden={!shown}>
      Confirm Your Attendance
    </a>
  );
}
