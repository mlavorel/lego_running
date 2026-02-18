import type { BuilderItem, ComposedRoute, Segment } from '../models/types';
import { EmptyState } from './EmptyState';

type Props = {
  items: BuilderItem[];
  segmentsById: Map<number, Segment>;
  composedRoute: ComposedRoute | null;
  onReorder: (from: number, to: number) => void;
  onReverse: (id: string) => void;
  onRemove: (id: string) => void;
  onCompose: () => void;
  onExportGpx: () => void;
};

export function BuilderTab({
  items,
  segmentsById,
  composedRoute,
  onReorder,
  onReverse,
  onRemove,
  onCompose,
  onExportGpx,
}: Props) {
  return (
    <div className="tab-content">
      <h3>Route Builder</h3>
      {items.length === 0 ? (
        <EmptyState title="Builder is empty" description="Add segments from the segments list." />
      ) : (
        <ul className="list">
          {items.map((item, idx) => {
            const seg = segmentsById.get(item.segmentId);
            if (!seg) return null;
            return (
              <li
                key={item.id}
                draggable
                onDragStart={(e) => e.dataTransfer.setData('text/plain', String(idx))}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  const from = Number(e.dataTransfer.getData('text/plain'));
                  onReorder(from, idx);
                }}
              >
                <span>
                  {seg.name}
                  <small>{item.reversed ? 'Reversed' : 'Normal'}</small>
                </span>
                <div className="row-buttons">
                  <button onClick={() => onReverse(item.id)}>Reverse</button>
                  <button className="secondary" onClick={() => onRemove(item.id)}>
                    Remove
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <button onClick={onCompose} disabled={items.length === 0}>
        Compose route
      </button>
      <button onClick={onExportGpx} disabled={!composedRoute || composedRoute.points.length < 2}>
        Export GPX
      </button>

      {composedRoute && (
        <div className="stats">
          <p>Total: {(composedRoute.distanceTotal / 1000).toFixed(2)} km</p>
          <p>Teleport: {(composedRoute.distanceTeleport / 1000).toFixed(2)} km</p>
        </div>
      )}
    </div>
  );
}
