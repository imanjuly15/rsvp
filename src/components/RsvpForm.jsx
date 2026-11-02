import { useEffect, useRef, useState } from 'react';
import { EVENT } from '../event.js';
import Art from '../lib/art.js';
import { parseWhen, shortDate } from '../lib/dates.js';
import LotusRule from './LotusRule.jsx';
import Reveal from './Reveal.jsx';

const MAX_PAX = 10;
const RELATIONSHIPS = ['Family', 'Friend', 'Colleague', 'Neighbour', 'Other'];
const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const doveArt = { __html: Art.doveMarkup() };

function validate(values) {
  const errors = {};
  if (values.attending === null) errors.attending = 'Please let us know if you are able to attend.';
  if (values.name.trim().length < 2) errors.name = 'Please enter your name.';
  const digits = values.phone.replace(/\D/g, '');
  if (digits.length < 8 || digits.length > 15) errors.phone = 'Please enter a valid phone number, for example 012 345 6789.';
  return errors;
}

function leadText() {
  const hasDetails = EVENT.ceremony_datetime || EVENT.venue_name || EVENT.venue_address;
  const by = parseWhen(EVENT.rsvp_deadline);
  const lead = hasDetails
    ? 'Please let us know if you are able to join us, so the family can prepare.'
    : 'Please let us know if you hope to join us, so the family can prepare and keep you informed once arrangements are confirmed.';
  return by ? `${lead} Kindly respond by ${shortDate(by)}.` : lead;
}

export default function RsvpForm() {
  const [attending, setAttending] = useState(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [pax, setPax] = useState(1);
  const [relationship, setRelationship] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [sending, setSending] = useState(false);
  const [view, setView] = useState('form');

  const formRef = useRef(null);
  const thanksRef = useRef(null);
  const nameRef = useRef(null);
  const phoneRef = useRef(null);
  const firstRadioRef = useRef(null);
  const shownView = useRef(view);

  // Fade the old view out, swap, and the effect below brings the new one in.
  async function changeView(next) {
    const leaving = view === 'form' ? formRef.current : thanksRef.current;
    if (!calm) {
      const out = leaving.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, easing: 'ease-in', fill: 'forwards' });
      await out.finished;
      out.cancel();
    }
    setView(next);
  }

  useEffect(() => {
    // Only a real change of view may move the page, never the first mount.
    if (shownView.current === view) return;
    shownView.current = view;
    const showing = view === 'form' ? formRef.current : thanksRef.current;
    if (!calm) {
      showing.animate(
        [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }],
        { duration: 380, easing: 'ease-out' },
      );
    }
    if (view === 'thanks') showing.focus({ preventScroll: true });
    document.getElementById('rsvp').scrollIntoView({ block: view === 'thanks' ? 'center' : 'start' });
  }, [view]);

  const clearError = (field) => setErrors((prev) => ({ ...prev, [field]: undefined }));

  async function submit(e) {
    e.preventDefault();
    const values = { attending, name, phone, pax: attending ? pax : 0, relationship, message };
    const found = validate(values);
    setErrors(found);
    setFormError('');
    if (found.attending) firstRadioRef.current.focus();
    else if (found.name) nameRef.current.focus();
    else if (found.phone) phoneRef.current.focus();
    if (Object.keys(found).length) return;

    // No address set means nowhere to send answers: the guest sees the thank-you, but nothing is kept.
    if (!EVENT.rsvp_endpoint) {
      console.warn('EVENT.rsvp_endpoint is empty in src/event.js, so this RSVP was not saved anywhere.');
      changeView('thanks');
      return;
    }

    setSending(true);
    try {
      const res = await fetch(EVENT.rsvp_endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (res.ok) changeView('thanks');
      else setFormError('We could not send your response. Please try again.');
    } catch {
      setFormError('We could not send your response. Please check your connection and try again.');
    } finally {
      setSending(false);
    }
  }

  let submitLabel = 'Send my response';
  if (attending === true) submitLabel = 'Confirm my attendance';
  if (attending === false) submitLabel = 'Send my regards';
  const peopleText = `${pax} ${pax === 1 ? 'person' : 'people'}`;

  return (
    <Reveal className="rsvp" id="rsvp" aria-labelledby="rsvp-title">
      <LotusRule className="rsvp-crown" />
      <h2 id="rsvp-title">Confirmation of Attendance</h2>
      <p className="rsvp-lead">{leadText()}</p>

      <form ref={formRef} onSubmit={submit} noValidate hidden={view !== 'form'}>
        <fieldset className="choice">
          <legend>Will you be able to attend?</legend>
          {[[true, 'Yes, I will attend'], [false, 'Unable to attend']].map(([value, label], i) => (
            <label className="choice-opt" key={label}>
              <input
                ref={i === 0 ? firstRadioRef : null}
                type="radio"
                name="attending"
                checked={attending === value}
                onChange={() => {
                  setAttending(value);
                  clearError('attending');
                }}
              />
              <span>{label}</span>
            </label>
          ))}
          {errors.attending && <p className="err" role="alert">{errors.attending}</p>}
        </fieldset>

        <div className="field">
          <label htmlFor="name">Your full name</label>
          <input
            ref={nameRef}
            id="name"
            type="text"
            autoComplete="name"
            maxLength={120}
            required
            value={name}
            aria-invalid={errors.name ? 'true' : undefined}
            aria-describedby={errors.name ? 'err-name' : undefined}
            onChange={(e) => {
              setName(e.target.value);
              clearError('name');
            }}
          />
          {errors.name && <p className="err" id="err-name" role="alert">{errors.name}</p>}
        </div>

        <div className="field">
          <label htmlFor="phone">Phone number</label>
          <input
            ref={phoneRef}
            id="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            maxLength={30}
            required
            value={phone}
            aria-invalid={errors.phone ? 'true' : undefined}
            aria-describedby={errors.phone ? 'hint-phone err-phone' : 'hint-phone'}
            onChange={(e) => {
              setPhone(e.target.value);
              clearError('phone');
            }}
          />
          <p className="hint" id="hint-phone">So the family can reach you with ceremony updates.</p>
          {errors.phone && <p className="err" id="err-phone" role="alert">{errors.phone}</p>}
        </div>

        <div className={`collapse${attending === true ? ' open' : ''}`}>
          <div className="collapse-inner">
            <div className="field">
              <span className="label" id="pax-label">Number of people attending</span>
              <div className="stepper" role="group" aria-labelledby="pax-label">
                <button type="button" aria-label="One person fewer" disabled={pax <= 1} onClick={() => setPax(pax - 1)}>&minus;</button>
                <output aria-live="polite">{pax}</output>
                <button type="button" aria-label="One person more" disabled={pax >= MAX_PAX} onClick={() => setPax(pax + 1)}>+</button>
              </div>
              <p className="hint">Including yourself. Up to {MAX_PAX}.</p>
            </div>
          </div>
        </div>

        <div className="field">
          <label htmlFor="relationship">Your relationship to the family <span className="opt">(optional)</span></label>
          <select id="relationship" value={relationship} onChange={(e) => setRelationship(e.target.value)}>
            <option value="">Please choose</option>
            {RELATIONSHIPS.map((r) => <option key={r}>{r}</option>)}
          </select>
        </div>

        <div className="field">
          <label htmlFor="message">A message for the family <span className="opt">(optional)</span></label>
          <textarea id="message" rows={4} maxLength={1000} value={message} onChange={(e) => setMessage(e.target.value)} />
          <p className="hint">Your prayers, thoughts or a memory. Seen only by the family.</p>
        </div>

        <button className="submit" type="submit" disabled={sending}>{sending ? 'Sending…' : submitLabel}</button>
        {formError && <p className="err form-err" role="alert">{formError}</p>}
      </form>

      <div ref={thanksRef} className="thanks" tabIndex={-1} hidden={view !== 'thanks'}>
        <div className="thanks-dove" aria-hidden="true">
          <div className="dove" dangerouslySetInnerHTML={doveArt} />
        </div>
        <p className="script">Thank you</p>
        <p>
          {attending
            ? `${name.trim()}, we have noted ${peopleText} attending. Your presence means a great deal to the family. Om Shanti.`
            : `${name.trim()}, thank you for letting us know. Your prayers and kind thoughts are deeply appreciated. Om Shanti.`}
        </p>
        <button type="button" className="link-btn" onClick={() => changeView('form')}>Change my response</button>
      </div>
    </Reveal>
  );
}
