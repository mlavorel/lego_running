import Dexie, { type Table } from 'dexie';
import type { RouteSource, Segment } from '../models/types';

class RunningDb extends Dexie {
  routeSources!: Table<RouteSource, number>;
  segments!: Table<Segment, number>;

  constructor() {
    super('legoRunningDb');
    this.version(1).stores({
      routeSources: '++id, name, createdAt',
      segments: '++id, name, routeSourceId, createdAt'
    });
  }
}

export const db = new RunningDb();

export const routeSourcesRepo = {
  list: () => db.routeSources.reverse().toArray(),
  add: (source: RouteSource) => db.routeSources.add(source),
  clear: () => db.routeSources.clear(),
};

export const segmentsRepo = {
  list: () => db.segments.reverse().toArray(),
  add: (segment: Segment) => db.segments.add(segment),
  clear: () => db.segments.clear(),
};
