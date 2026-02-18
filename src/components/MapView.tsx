import { MapContainer, Polyline, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import type { RoutePoint, RouteSource, Segment, ComposedRoute } from '../models/types';
import { bbox, nearestPointIndex } from '../lib/geo';
import type { LatLngTuple } from 'leaflet';

function FitBounds({ points }: { points: RoutePoint[] | null }) {
  const map = useMap();
  if (!points?.length) return null;
  const bounds = bbox(points);
  if (!bounds) return null;
  map.fitBounds(bounds);
  return null;
}

function ClickPicker({
  enabled,
  source,
  onPick,
}: {
  enabled: boolean;
  source?: RouteSource;
  onPick: (idx: number) => void;
}) {
  useMapEvents({
    click: (event) => {
      if (!enabled || !source) return;
      const idx = nearestPointIndex(source.points, { lat: event.latlng.lat, lon: event.latlng.lng });
      if (idx >= 0) onPick(idx);
    },
  });

  return null;
}

const toLatLng = (pts: RoutePoint[]): LatLngTuple[] => pts.map((p) => [p.lat, p.lon]);

export function MapView({
  activeSource,
  segments,
  composedRoute,
  onMapPick,
  createMode,
  zoomPoints,
  onSegmentClick,
}: {
  activeSource?: RouteSource;
  segments: Segment[];
  composedRoute: ComposedRoute | null;
  onMapPick: (idx: number) => void;
  createMode: boolean;
  zoomPoints: RoutePoint[] | null;
  onSegmentClick: (segmentId: number) => void;
}) {
  return (
    <MapContainer center={[-23.56, -46.63]} zoom={12} className="map">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickPicker enabled={createMode} source={activeSource} onPick={onMapPick} />
      {zoomPoints && <FitBounds points={zoomPoints} />}

      {activeSource && <Polyline positions={toLatLng(activeSource.points)} pathOptions={{ color: '#1d4ed8' }} />}

      {segments.map((segment) => (
        <Polyline
          key={segment.id}
          positions={toLatLng(segment.points)}
          pathOptions={{ color: '#16a34a', weight: 4 }}
          eventHandlers={{ click: () => segment.id && onSegmentClick(segment.id) }}
        />
      ))}

      {composedRoute && (
        <Polyline positions={toLatLng(composedRoute.points)} pathOptions={{ color: '#f97316', weight: 5 }} />
      )}
    </MapContainer>
  );
}
