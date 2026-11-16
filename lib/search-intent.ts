import type { Place } from './places';

export type SearchIntent = {
  category: string;
  radius?: number;
  kind?: 'cafe';
  mood?: string;
  notices: string[];
};

/** Small, local rules: no paid API, no claims about unobserved place qualities. */
export function parseSearchIntent(input: string): SearchIntent {
  const text = input.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  if (!text) throw new Error('Tell us what you would like to explore.');
  const result: SearchIntent = { category: 'Everything', notices: [] };
  const radius = text.match(/\b(?:within|radius|under|nearby)\s+(\d+(?:\.\d+)?)\s*(km|kilomet(?:er|re)s?|m|met(?:er|re)s?)\b/);
  if (radius) {
    result.radius = Number(radius[1]) / (/^(m|met)/.test(radius[2]) ? 1000 : 1);
    if (result.radius < 0.1 || result.radius > 10) throw new Error('Choose a distance between 100 metres and 10 km.');
  }
  const categories: Array<[RegExp, string]> = [
    [/\b(cafes?|coffee|tea|restaurants?|food|hungry|lunch|dinner|breakfast)\b/, 'Food'],
    [/\b(beach|beaches|seaside)\b/, 'Beaches'],
    [/\b(parks?|nature|gardens?|forest)\b/, 'Parks'],
    [/\b(hotels?|hostels?|stays?)\b/, 'Stays'],
    [/\b(shopping|shops?|malls?)\b/, 'Shopping'],
    [/\b(museums?|attractions?|viewpoints?)\b/, 'Attractions'],
    [/\b(fun|kids|children|playgrounds?|sports?)\b/, 'Fun'],
  ];
  const match = categories.find(([pattern]) => pattern.test(text));
  if (match) result.category = match[1];
  if (/\b(cafes?|coffee|tea)\b/.test(text)) result.kind = 'cafe';
  const mood = text.match(/\b(quiet|peaceful|relax|relaxing|romantic|date|family|adventurous|energetic|bored)\b/);
  if (mood) {
    result.mood = mood[1];
    if (!match) result.category = /quiet|peaceful|relax/.test(result.mood) ? 'Parks' : /romantic|date/.test(result.mood) ? 'Food' : 'Fun';
    result.notices.push('Mood is a category suggestion. Quietness, romance and family suitability are not verified.');
  }
  const withoutRadius = radius ? text.replace(radius[0], '') : text;
  if (/₹|\brs\.?\s*\d|\binr\b|\bbudget\b|\bfree\b|\bunder\s+\d/.test(withoutRadius)) {
    result.notices.push('Budget was not applied: reliable price information is unavailable.');
  }
  if (/\b(open|today|tonight|weekend|evening)\b/.test(text)) result.notices.push('Opening times and event availability are not verified.');
  if (/\b(hidden|gems?|lesser.known)\b/.test(text)) result.notices.push('Popularity is unknown; these are ordinary mapped discoveries, not verified hidden gems.');
  if (!match && !mood && !radius) result.notices.push('No category recognized; showing all categories. Use city search to change location.');
  return result;
}

export function matchesIntent(place: Place, intent: SearchIntent | null) {
  if (!intent?.kind) return true;
  return /\b(cafe|coffee|tea)\b/i.test(place.kind);
}

export function safeWebsite(value?: string): string | undefined {
  if (!value) return;
  try { const url = new URL(value); if (['https:', 'http:'].includes(url.protocol) && !url.username && !url.password) return url.href; } catch {}
}
