import { useEffect, useMemo, useState } from 'react';
import { BuilderTab } from '../components/BuilderTab';
import { MapView } from '../components/MapView';
import { SegmentsTab } from '../components/SegmentsTab';
import { Sidebar, type TabKey } from '../components/Sidebar';
import { SourcesTab } from '../components/SourcesTab';
import { routeSourcesRepo, segmentsRepo, db } from '../db';
import { exportRouteToGpx, parseGpxTrack, composeRouteFromSegments } from '../lib/gpx';
import { computeTrackDistance } from '../lib/geo';
import type { BuilderItem, ComposedRoute, RoutePoint, RouteSource, Segment } from '../models/types';

export function MainPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('sources');
  const [sources, setSources] = useState<RouteSource[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [activeSourceId, setActiveSourceId] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [createMode, setCreateMode] = useState(false);
  const [pendingStart, setPendingStart] = useState<number | null>(null);
  const [pendingEnd, setPendingEnd] = useState<number | null>(null);
  const [segmentName, setSegmentName] = useState('');
  const [search, setSearch] = useState('');

  const [builder, setBuilder] = useState<BuilderItem[]>([]);
  const [composedRoute, setComposedRoute] = useState<ComposedRoute | null>(null);
  const [zoomPoints, setZoomPoints] = useState<RoutePoint[] | null>(null);

  const activeSource = sources.find((s) => s.id === activeSourceId);
  const segmentsById = useMemo(() => new Map(segments.map((s) => [s.id!, s])), [segments]);

  async function refreshDb() {
    const [loadedSources, loadedSegments] = await Promise.all([routeSourcesRepo.list(), segmentsRepo.list()]);
    setSources(loadedSources);
    setSegments(loadedSegments);
    if (loadedSources.length > 0 && activeSourceId == null) {
      setActiveSourceId(loadedSources[0].id ?? null);
    }
  }

  useEffect(() => {
    refreshDb();
  }, []);

  const addMessage = (text: string) => {
    setMessage(text);
    setTimeout(() => setMessage(null), 3500);
  };

  const onUploadGpx = async (file: File) => {
    try {
      const text = await file.text();
      const parsed = parseGpxTrack(text);
      const id = await routeSourcesRepo.add({
        name: parsed.name || file.name.replace(/\.gpx$/i, ''),
        points: parsed.points,
        distance: parsed.distance,
        createdAt: new Date().toISOString(),
      });
      await refreshDb();
      setActiveSourceId(id);
      addMessage(`Imported ${file.name}`);
    } catch (err) {
      addMessage(err instanceof Error ? err.message : 'Failed to parse GPX.');
    }
  };

  const onMapPick = (idx: number) => {
    if (pendingStart === null) {
      setPendingStart(idx);
      return;
    }
    setPendingEnd(idx);
  };

  const onSaveSegment = async () => {
    if (!activeSource || pendingStart === null || pendingEnd === null) {
      addMessage('Pick start and end points first.');
      return;
    }

    const start = Math.min(pendingStart, pendingEnd);
    const end = Math.max(pendingStart, pendingEnd);
    const forward = activeSource.points.slice(start, end + 1);
    const shouldReverse = pendingStart > pendingEnd;
    const points = shouldReverse ? [...forward].reverse() : forward;

    if (points.length < 2) {
      addMessage('Segment needs at least two points.');
      return;
    }

    await segmentsRepo.add({
      name: segmentName.trim() || `Segment ${new Date().toLocaleTimeString()}`,
      routeSourceId: activeSource.id!,
      startIdx: pendingStart,
      endIdx: pendingEnd,
      reversed: shouldReverse,
      points,
      distance: computeTrackDistance(points),
      createdAt: new Date().toISOString(),
    });

    setPendingStart(null);
    setPendingEnd(null);
    setSegmentName('');
    setCreateMode(false);
    await refreshDb();
    addMessage('Segment saved.');
  };

  const onCompose = () => {
    const parts = builder
      .map((item) => {
        const seg = segmentsById.get(item.segmentId);
        if (!seg) return null;
        return item.reversed ? [...seg.points].reverse() : seg.points;
      })
      .filter(Boolean) as RoutePoint[][];

    setComposedRoute(composeRouteFromSegments(parts));
    addMessage('Route composed.');
  };

  const onExportGpx = () => {
    if (!composedRoute) return;
    const gpx = exportRouteToGpx('Composed Route', composedRoute);
    const blob = new Blob([gpx], { type: 'application/gpx+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'composed-route.gpx';
    a.click();
    URL.revokeObjectURL(url);
  };

  const onExportLibrary = async () => {
    const payload = { sources: await routeSourcesRepo.list(), segments: await segmentsRepo.list() };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lego-running-library.json';
    a.click();
    URL.revokeObjectURL(url);
    addMessage('Library exported.');
  };

  const onImportLibrary = async (file: File) => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as { sources?: RouteSource[]; segments?: Segment[] };
      await db.transaction('rw', db.routeSources, db.segments, async () => {
        await db.routeSources.clear();
        await db.segments.clear();
        if (parsed.sources?.length) await db.routeSources.bulkAdd(parsed.sources);
        if (parsed.segments?.length) await db.segments.bulkAdd(parsed.segments);
      });
      await refreshDb();
      addMessage('Library imported with replacement strategy.');
    } catch {
      addMessage('Invalid JSON library file.');
    }
  };

  return (
    <div className="layout">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab}>
        {activeTab === 'sources' && (
          <SourcesTab
            sources={sources}
            activeSourceId={activeSourceId}
            message={message}
            onUpload={onUploadGpx}
            onActivateSource={setActiveSourceId}
            onZoomSource={(source) => setZoomPoints(source.points)}
            onExportLibrary={onExportLibrary}
            onImportLibrary={onImportLibrary}
          />
        )}
        {activeTab === 'segments' && (
          <SegmentsTab
            activeSource={activeSource}
            segments={segments}
            search={search}
            setSearch={setSearch}
            creatingSegment={createMode}
            pendingStart={pendingStart}
            onToggleCreateSegment={() => {
              setCreateMode((prev) => !prev);
              setPendingStart(null);
              setPendingEnd(null);
            }}
            onSaveSegment={onSaveSegment}
            onNameChange={setSegmentName}
            segmentName={segmentName}
            onAddToBuilder={(segmentId) =>
              setBuilder((prev) => [...prev, { id: crypto.randomUUID(), segmentId, reversed: false }])
            }
          />
        )}
        {activeTab === 'builder' && (
          <BuilderTab
            items={builder}
            segmentsById={segmentsById}
            composedRoute={composedRoute}
            onReorder={(from, to) =>
              setBuilder((prev) => {
                const copy = [...prev];
                const [item] = copy.splice(from, 1);
                copy.splice(to, 0, item);
                return copy;
              })
            }
            onReverse={(id) =>
              setBuilder((prev) => prev.map((item) => (item.id === id ? { ...item, reversed: !item.reversed } : item)))
            }
            onRemove={(id) => setBuilder((prev) => prev.filter((item) => item.id !== id))}
            onCompose={onCompose}
            onExportGpx={onExportGpx}
          />
        )}
      </Sidebar>

      <main>
        <MapView
          activeSource={activeSource}
          segments={segments}
          composedRoute={composedRoute}
          onMapPick={onMapPick}
          createMode={createMode}
          zoomPoints={zoomPoints}
          onSegmentClick={(segmentId) =>
            setBuilder((prev) => [...prev, { id: crypto.randomUUID(), segmentId, reversed: false }])
          }
        />
      </main>
    </div>
  );
}
