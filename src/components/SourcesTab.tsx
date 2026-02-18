import type { RouteSource } from '../models/types';
import { EmptyState } from './EmptyState';

type Props = {
  sources: RouteSource[];
  activeSourceId: number | null;
  message: string | null;
  onUpload: (file: File) => void;
  onActivateSource: (sourceId: number) => void;
  onZoomSource: (source: RouteSource) => void;
  onExportLibrary: () => void;
  onImportLibrary: (file: File) => void;
};

export function SourcesTab({
  sources,
  activeSourceId,
  message,
  onUpload,
  onActivateSource,
  onZoomSource,
  onExportLibrary,
  onImportLibrary,
}: Props) {
  return (
    <div className="tab-content">
      <label className="file-input">
        Upload GPX
        <input
          type="file"
          accept=".gpx"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onUpload(file);
            e.currentTarget.value = '';
          }}
        />
      </label>

      <div className="row-buttons">
        <button onClick={onExportLibrary}>Export JSON</button>
        <label className="file-input inline">
          Import JSON
          <input
            type="file"
            accept="application/json"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onImportLibrary(file);
              e.currentTarget.value = '';
            }}
          />
        </label>
      </div>

      {message && <p className="message">{message}</p>}

      {sources.length === 0 ? (
        <EmptyState title="No routes yet" description="Upload a GPX file to start building segments." />
      ) : (
        <ul className="list">
          {sources.map((source) => (
            <li key={source.id} className={source.id === activeSourceId ? 'selected' : ''}>
              <button onClick={() => source.id && onActivateSource(source.id)}>
                {source.name}
                <small>{(source.distance / 1000).toFixed(2)} km</small>
              </button>
              <button className="secondary" onClick={() => onZoomSource(source)}>
                Zoom to route
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
