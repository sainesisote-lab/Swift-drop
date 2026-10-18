export interface GeoPoint {
  name: string;
  lat: number;
  lng: number;
  description: string;
}

export const DAR_ES_SALAAM_HUBS: GeoPoint[] = [
  { name: 'Kariakoo Commercial Hub', lat: -6.8202, lng: 39.2783, description: 'Central Retail & Cargo Market' },
  { name: 'Posta / CBD Ferry Terminal', lat: -6.8162, lng: 39.2934, description: 'Financial District & Zanzibar Ferry' },
  { name: 'Ubungo Bus Interchange', lat: -6.7865, lng: 39.2144, description: 'Intercity Bus Terminal & Inland Depot' },
  { name: 'Mwenge IT & Craft Market', lat: -6.7712, lng: 39.2312, description: 'Northern Corridor Dispatch Hub' },
  { name: 'Mikocheni Industrial Area', lat: -6.7584, lng: 39.2520, description: 'Warehousing & Light Manufacturing' },
  { name: 'Mbagala Southern Terminal', lat: -6.8992, lng: 39.2715, description: 'Southern Coastal Cargo Gateway' },
  { name: 'JNIA Airport Cargo Terminal', lat: -6.8778, lng: 39.2026, description: 'Air Freight Clearing Center' },
  { name: 'Arusha Central Bus Terminal', lat: -3.3731, lng: 36.6944, description: 'Northern Circuit Logistics Hub' },
  { name: 'Dodoma Capital Depot', lat: -6.1630, lng: 35.7516, description: 'Central Government & Transshipment Depot' },
  { name: 'Mwanza Lake Port Terminal', lat: -2.5164, lng: 32.9175, description: 'Lake Victoria Regional Hub' },
];

/**
 * Calculates geographic distance in KM using the Haversine formula.
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Interpolates points along a path to simulate smooth vehicle movement.
 */
export function interpolateWaypoint(
  p1: { lat: number; lng: number },
  p2: { lat: number; lng: number },
  fraction: number
): { lat: number; lng: number; heading: number } {
  const lat = p1.lat + (p2.lat - p1.lat) * fraction;
  const lng = p1.lng + (p2.lng - p1.lng) * fraction;

  // Calculate compass heading
  const y = Math.sin(toRad(p2.lng - p1.lng)) * Math.cos(toRad(p2.lat));
  const x =
    Math.cos(toRad(p1.lat)) * Math.sin(toRad(p2.lat)) -
    Math.sin(toRad(p1.lat)) * Math.cos(toRad(p2.lat)) * Math.cos(toRad(p2.lng - p1.lng));
  const bearingRad = Math.atan2(y, x);
  const heading = Math.round(((bearingRad * 180) / Math.PI + 360) % 360);

  return { lat, lng, heading };
}
