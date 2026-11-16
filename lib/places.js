"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.distanceKm = distanceKm;
exports.discover = discover;
const selectors = { Food: ['amenity~"^(restaurant|cafe|fast_food|ice_cream)$"'], Stays: ['tourism~"^(hotel|hostel|guest_house)$"'], Beaches: ['natural="beach"'], Parks: ['leisure~"^(park|garden|nature_reserve)$"'], Attractions: ['tourism~"^(attraction|museum|viewpoint)$"'], Shopping: ['shop~"^(mall|department_store|books)$"'], Fun: ['leisure~"^(playground|water_park|sports_centre)$"'] };
function distanceKm(a, b, c, d) { const rad = Math.PI / 180; const x0 = Math.sin((c - a) * rad / 2) ** 2 + Math.cos(a * rad) * Math.cos(c * rad) * Math.sin((d - b) * rad / 2) ** 2; const x = Math.min(1, Math.max(0, x0)); return 6371 * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x)); }
const cache = new Map();
async function discover(lat, lon, radius, category, signal) {
    if (!Number.isFinite(lat) || Math.abs(lat) > 90 || !Number.isFinite(lon) || Math.abs(lon) > 180 || ![1, 3, 5, 10].includes(radius) || !(category === 'Everything' || category in selectors))
        throw Error('Invalid discovery filters');
    if (signal.aborted)
        throw new DOMException('Aborted', 'AbortError');
    const key = [lat.toFixed(4), lon.toFixed(4), radius, category].join(':');
    const old = cache.get(key);
    if (old && Date.now() - old.at < 600000)
        return old.places;
    const entries = category === 'Everything' ? Object.entries(selectors) : [[category, selectors[category] || []]];
    const query = `[out:json][timeout:20];(${entries.flatMap(([, filters]) => filters.map(f => `nwr(around:${radius * 1000},${lat},${lon})[${f}][name];`)).join('')});out center tags 180;`;
    const response = await fetch(process.env.NEXT_PUBLIC_OVERPASS_URL || 'https://overpass-api.de/api/interpreter', { method: 'POST', body: new URLSearchParams({ data: query }), signal });
    if (!response.ok)
        throw Error('Discovery is busy. Please try again in a moment.');
    const data = await response.json();
    if (data.remark || !Array.isArray(data.elements))
        throw Error('Discovery returned incomplete data');
    const places = data.elements.flatMap((e) => { const lat2 = e.lat ?? e.center?.lat, lon2 = e.lon ?? e.center?.lon, t = e.tags || {}; if (lat2 === undefined || lon2 === undefined || !Number.isFinite(lat2) || !Number.isFinite(lon2) || Math.abs(lat2) > 90 || Math.abs(lon2) > 180 || typeof t.name !== 'string')
        return []; const kind = t.amenity || t.tourism || t.leisure || t.natural || t.shop || 'place'; let cat = 'Attractions'; if (t.shop)
        cat = 'Shopping';
    else if (t.natural === 'beach')
        cat = 'Beaches';
    else if (['hotel', 'hostel', 'guest_house'].includes(kind))
        cat = 'Stays';
    else if (t.amenity)
        cat = 'Food';
    else if (['park', 'garden', 'nature_reserve'].includes(kind))
        cat = 'Parks';
    else if (t.leisure)
        cat = 'Fun'; const distance = distanceKm(lat, lon, lat2, lon2); return distance <= radius ? [{ id: `${e.type}/${e.id}`, name: t.name, lat: lat2, lon: lon2, category: cat, kind: kind.replaceAll('_', ' '), distance }] : []; });
    places.sort((a, b) => a.distance - b.distance);
    cache.set(key, { at: Date.now(), places });
    if (cache.size > 30)
        cache.delete(cache.keys().next().value);
    return places;
}
