import type { RoutePoint } from '../../models/types';

const EARTH_RADIUS_METERS = 6371000;

export function haversineDistance(a: RoutePoint, b: RoutePoint): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(h));
}

export function computeTrackDistance(points: RoutePoint[]): number {
  let total = 0;
  for (let i = 1; i < points.length; i += 1) {
    total += haversineDistance(points[i - 1], points[i]);
  }
  return total;
}

export function bbox(points: RoutePoint[]): [[number, number], [number, number]] | null {
  if (points.length === 0) return null;

  let minLat = points[0].lat;
  let maxLat = points[0].lat;
  let minLon = points[0].lon;
  let maxLon = points[0].lon;

  for (const p of points) {
    minLat = Math.min(minLat, p.lat);
    maxLat = Math.max(maxLat, p.lat);
    minLon = Math.min(minLon, p.lon);
    maxLon = Math.max(maxLon, p.lon);
  }

  return [[minLat, minLon], [maxLat, maxLon]];
}

export function nearestPointIndex(points: RoutePoint[], target: RoutePoint): number {
  if (points.length === 0) return -1;

  let nearestIdx = 0;
  let minDist = Number.POSITIVE_INFINITY;

  for (let i = 0; i < points.length; i += 1) {
    const d = haversineDistance(points[i], target);
    if (d < minDist) {
      minDist = d;
      nearestIdx = i;
    }
  }

  return nearestIdx;
}
