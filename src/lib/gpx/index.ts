import type { ComposedRoute, RoutePoint } from '../../models/types';
import { computeTrackDistance } from '../geo';

function extractTrackPoints(trackEl: Element): RoutePoint[] {
  const segments = Array.from(trackEl.getElementsByTagName('trkseg'));
  const points: RoutePoint[] = [];

  for (const seg of segments) {
    const trkpts = Array.from(seg.getElementsByTagName('trkpt'));
    for (const trkpt of trkpts) {
      const lat = Number(trkpt.getAttribute('lat'));
      const lon = Number(trkpt.getAttribute('lon'));
      if (Number.isNaN(lat) || Number.isNaN(lon)) continue;

      const eleNode = trkpt.getElementsByTagName('ele')[0];
      const ele = eleNode ? Number(eleNode.textContent ?? '') : undefined;
      points.push({ lat, lon, ele: Number.isNaN(ele) ? undefined : ele });
    }
  }

  return points;
}

export function parseGpxTrack(gpxText: string): { name: string; points: RoutePoint[]; distance: number } {
  const parser = new DOMParser();
  const xml = parser.parseFromString(gpxText, 'application/xml');

  const parserError = xml.getElementsByTagName('parsererror')[0];
  if (parserError) {
    throw new Error('Invalid GPX file.');
  }

  const tracks = Array.from(xml.getElementsByTagName('trk'));
  if (tracks.length === 0) {
    throw new Error('No track found in GPX.');
  }

  const mainTrack = tracks[0];
  const points = extractTrackPoints(mainTrack);
  if (points.length < 2) {
    throw new Error('Track has insufficient points.');
  }

  const name = mainTrack.getElementsByTagName('name')[0]?.textContent?.trim() || 'Untitled route';
  const distance = computeTrackDistance(points);

  return { name, points, distance };
}

function pointToGpx(pt: RoutePoint): string {
  const ele = typeof pt.ele === 'number' ? `<ele>${pt.ele.toFixed(2)}</ele>` : '';
  return `<trkpt lat="${pt.lat}" lon="${pt.lon}">${ele}</trkpt>`;
}

export function composeRouteFromSegments(parts: RoutePoint[][]): ComposedRoute {
  const composed: RoutePoint[] = [];
  let distanceTeleport = 0;

  for (let i = 0; i < parts.length; i += 1) {
    const part = parts[i];
    if (!part.length) continue;

    if (composed.length > 0) {
      const prev = composed[composed.length - 1];
      const next = part[0];
      composed.push(next);
      distanceTeleport += computeTrackDistance([prev, next]);
      composed.push(...part.slice(1));
    } else {
      composed.push(...part);
    }
  }

  return {
    points: composed,
    distanceTotal: computeTrackDistance(composed),
    distanceTeleport,
  };
}

export function exportRouteToGpx(name: string, route: ComposedRoute): string {
  const pointsXml = route.points.map(pointToGpx).join('');
  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="lego-running" xmlns="http://www.topografix.com/GPX/1/1">
  <trk>
    <name>${name}</name>
    <trkseg>${pointsXml}</trkseg>
  </trk>
</gpx>`;
}
