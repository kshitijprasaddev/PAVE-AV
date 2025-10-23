export type LatLng = {
  latitude: number;
  longitude: number;
};

export type RouteSegment = {
  segmentId: string;
  newSegmentId?: string;
  averageSpeed: number;
  typicalSpeed: number;
  delaySeconds: number;
  segmentLength: number;
  confidence: number;
  shape: LatLng[];
};

export type RouteDetails = {
  routeId: string;
  routeName: string;
  routeLength: number;
  travelTime: number;
  typicalTravelTime: number;
  delayTime: number;
  passable: boolean;
  completeness: number;
  routeConfidence: number;
  path: LatLng[];
  segments: RouteSegment[];
  area?: string;
};

export type RouteResponse = {
  fetchedAt: string;
  routes: RouteDetails[];
};


