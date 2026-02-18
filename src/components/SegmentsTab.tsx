import type { RouteSource, Segment } from '../models/types';
import { EmptyState } from './EmptyState';

type Props = {
  activeSource: RouteSource | undefined;
  segments: Segment[];
  search: string;
  setSearch: (value: string) => void;
  creatingSegment: boolean;
  pendingStart: number | null;
  onToggleCreateSegment: () => void;
  onSaveSegment: () => void;
  onNameChange: (name: string) => void;
  segmentName: string;
  onAddToBuilder: (segmentId: number) => void;
};

export function SegmentsTab({
  activeSource,
  segments,
  search,
  setSearch,
  creatingSegment,
  pendingStart,
  onToggleCreateSegment,
  onSaveSegment,
  onNameChange,
  segmentName,
  onAddToBuilder,
}: Props) {
  const filtered = segments.filter((s) =>
    `${s.name} ${(s.distance / 1000).toFixed(2)}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="tab-content">
      <h3>Create segment</h3>
      <p className="helper">
        {activeSource
          ? `Active source: ${activeSource.name}`
          : 'Select a source in Sources tab to start.'}
      </p>
      <button onClick={onToggleCreateSegment} disabled={!activeSource}>
        {creatingSegment ? 'Cancel' : 'Start map picking'}
      </button>
      {creatingSegment && (
        <>
          <p className="helper">Click map for start and end. Snap is automatic.</p>
          <p className="helper">Start index: {pendingStart ?? '-'}</p>
          <input
            value={segmentName}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Segment name"
          />
          <button onClick={onSaveSegment} disabled={pendingStart === null}>
            Save segment
          </button>
        </>
      )}

      <hr />
      <h3>Library</h3>
      <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or km" />
      {filtered.length === 0 ? (
        <EmptyState title="No segments" description="Create one from the map and it will appear here." />
      ) : (
        <ul className="list">
          {filtered.map((segment) => (
            <li key={segment.id}>
              <button onClick={() => segment.id && onAddToBuilder(segment.id)}>
                {segment.name}
                <small>{(segment.distance / 1000).toFixed(2)} km</small>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
