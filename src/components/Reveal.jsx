import { useEffect, useRef, useState } from 'react';

const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** A section that rises gently into view the first time it is scrolled to. */
export default function Reveal({ className = '', children, ...rest }) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(calm);

  useEffect(() => {
    if (seen) return undefined;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setSeen(true);
    }, { rootMargin: '0px 0px -6% 0px' });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [seen]);

  return (
    <section ref={ref} className={`${className} reveal${seen ? ' seen' : ''}`} {...rest}>
      {children}
    </section>
  );
}
