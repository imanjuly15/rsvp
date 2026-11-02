/* Everything the family may need to change lives here. Edit, then run "npm run build" and upload dist again. */
export const EVENT = {
  ceremony_name: 'Memorial Luncheon',

  // Malaysia time. Use '2026-11-07' while the time is unconfirmed, or '2026-11-07T10:30' once it is known.
  ceremony_datetime: '2026-11-07',

  venue_name: 'India Gate Signature Restaurant',
  venue_address: 'Tropicana Golf & Country Resort, Tropicana, 47410 Petaling Jaya, Selangor',
  map_url: '', // Optional Google Maps link. Without one, directions are built from the venue name and address.
  dress_code: '',
  rsvp_deadline: '', // For example '2026-11-06'.
  note: '',

  // Where RSVP answers are sent, as a JSON POST. WHILE THIS IS EMPTY, ANSWERS ARE NOT SAVED ANYWHERE.
  rsvp_endpoint: '',
};
