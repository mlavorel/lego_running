export type RoutePoint = {
  lat: number;
  lon: number;
  ele?: number;
};

export type RouteSource = {
  id?: number;
  name: string;
  points: RoutePoint[];
  distance: number;
  createdAt: string;
};

export type Segment = {
  id?: number;
  name: string;
  routeSourceId: number;
  startIdx: number;
  endIdx: number;
  reversed: boolean;
  points: RoutePoint[];
  distance: number;
  createdAt: string;
};

export type BuilderItem = {
  id: string;
  segmentId: number;
  reversed: boolean;
};

export type ComposedRoute = {
  points: RoutePoint[];
  distanceTotal: number;
  distanceTeleport: number;
};
