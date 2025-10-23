import { NextResponse } from "next/server";
import type { LatLng, RouteDetails, RouteSegment } from "@/types/routes";

const ROUTES = [
  { id: "82724", name: "Audi Forum → Hauptbahnhof" },
  { id: "82725", name: "Klinikum → Nordbahnhof" },
];

const ROUTE_META: Record<string, { name: string; area: string }> = {
  "82724": { name: "Audi Forum → Hauptbahnhof", area: "Innerstadt spine & rail hub" },
  "82725": { name: "Klinikum → Nordbahnhof", area: "Medical district ↔ northern districts" },
};

type TomTomSegment = {
  segmentId: string;
  segmentIdStr?: string;
  averageSpeed?: number;
  typicalSpeed?: number;
  segmentLength?: number;
  confidence?: number;
  shape?: LatLng[];
};

type TomTomRoute = {
  routeId?: number | string;
  routeName?: string;
  routeStatus?: string;
  routeLength?: number;
  travelTime?: number;
  typicalTravelTime?: number;
  delayTime?: number;
  passable?: boolean;
  completeness?: number;
  routeConfidence?: number;
  routePathPoints?: LatLng[];
  detailedSegments?: TomTomSegment[];
};

const FALLBACK_ROUTES: Record<string, TomTomRoute> = {
  "82724": {
    routeId: 82724,
    routeName: "Audi Forum → Hauptbahnhof",
    routeStatus: "ACTIVE",
    routeLength: 5763,
    travelTime: 965,
    typicalTravelTime: 841,
    delayTime: 365,
    passable: true,
    completeness: 98,
    routeConfidence: 100,
    routePathPoints: [
      { latitude: 48.782794, longitude: 11.414092 },
      { latitude: 48.7705, longitude: 11.4252 },
      { latitude: 48.744435, longitude: 11.436957 },
    ],
    detailedSegments: [
      {
        segmentId: "1172384166320373761",
        averageSpeed: 10,
        typicalSpeed: 12,
        segmentLength: 120,
        confidence: 100,
        shape: [
          { latitude: 48.78313, longitude: 11.41387 },
          { latitude: 48.78299, longitude: 11.4131 },
        ],
      },
      {
        segmentId: "1172384166321520640",
        averageSpeed: 42,
        typicalSpeed: 52,
        segmentLength: 260,
        confidence: 100,
        shape: [
          { latitude: 48.78239, longitude: 11.41357 },
          { latitude: 48.78136, longitude: 11.41434 },
        ],
      },
      {
        segmentId: "1172384166321586176",
        averageSpeed: 38,
        typicalSpeed: 48,
        segmentLength: 410,
        confidence: 100,
        shape: [
          { latitude: 48.78089, longitude: 11.41467 },
          { latitude: 48.77989, longitude: 11.41541 },
        ],
      },
      {
        segmentId: "1172384166688129024",
        averageSpeed: 22,
        typicalSpeed: 34,
        segmentLength: 530,
        confidence: 100,
        shape: [
          { latitude: 48.77892, longitude: 11.41618 },
          { latitude: 48.77512, longitude: 11.41876 },
        ],
      },
      {
        segmentId: "1172384166285115392",
        averageSpeed: 18,
        typicalSpeed: 28,
        segmentLength: 620,
        confidence: 95,
        shape: [
          { latitude: 48.75492, longitude: 11.43382 },
          { latitude: 48.74443, longitude: 11.43387 },
        ],
      },
    ],
  },
  "82725": {
    routeId: 82725,
    routeName: "Klinikum → Nordbahnhof",
    routeStatus: "ACTIVE",
    routeLength: 4310,
    travelTime: 712,
    typicalTravelTime: 598,
    delayTime: 244,
    passable: true,
    completeness: 97,
    routeConfidence: 100,
    routePathPoints: [
      { latitude: 48.7704, longitude: 11.4556 },
      { latitude: 48.7648, longitude: 11.4479 },
      { latitude: 48.7571, longitude: 11.4384 },
      { latitude: 48.7538, longitude: 11.4312 },
    ],
    detailedSegments: [
      {
        segmentId: "2172384166320373761",
        averageSpeed: 20,
        typicalSpeed: 28,
        segmentLength: 220,
        confidence: 100,
        shape: [
          { latitude: 48.77012, longitude: 11.45542 },
          { latitude: 48.76889, longitude: 11.45392 },
        ],
      },
      {
        segmentId: "2172384166321520640",
        averageSpeed: 34,
        typicalSpeed: 44,
        segmentLength: 340,
        confidence: 99,
        shape: [
          { latitude: 48.76889, longitude: 11.45392 },
          { latitude: 48.76632, longitude: 11.45082 },
        ],
      },
      {
        segmentId: "2172384166321586176",
        averageSpeed: 26,
        typicalSpeed: 38,
        segmentLength: 480,
        confidence: 95,
        shape: [
          { latitude: 48.76632, longitude: 11.45082 },
          { latitude: 48.76278, longitude: 11.44612 },
        ],
      },
      {
        segmentId: "2172384166688129024",
        averageSpeed: 18,
        typicalSpeed: 32,
        segmentLength: 620,
        confidence: 92,
        shape: [
          { latitude: 48.76278, longitude: 11.44612 },
          { latitude: 48.75802, longitude: 11.44012 },
        ],
      },
      {
        segmentId: "2172384166285115392",
        averageSpeed: 24,
        typicalSpeed: 36,
        segmentLength: 520,
        confidence: 90,
        shape: [
          { latitude: 48.75802, longitude: 11.44012 },
          { latitude: 48.75381, longitude: 11.43121 },
        ],
      },
    ],
  },
};

function mapSegment(raw: TomTomSegment): RouteSegment {
  const average = raw.averageSpeed ?? raw.typicalSpeed ?? 0;
  const typical = raw.typicalSpeed ?? average;
  const segmentLength = raw.segmentLength ?? 0;
  const avgTimeSeconds = average > 0 ? segmentLength / (average / 3.6) : 0;
  const typicalTimeSeconds = typical > 0 ? segmentLength / (typical / 3.6) : avgTimeSeconds;
  const delaySeconds = Math.max(0, avgTimeSeconds - typicalTimeSeconds);
  return {
    segmentId: raw.segmentId ?? raw.segmentIdStr ?? Math.random().toString(36).slice(2),
    averageSpeed: average,
    typicalSpeed: typical,
    segmentLength,
    confidence: raw.confidence ?? 0,
    delaySeconds,
    shape: raw.shape ?? [],
  };
}

function mapRoute(raw: TomTomRoute, fallbackName: string): RouteDetails {
  const segments = (raw.detailedSegments ?? []).map(mapSegment);
  const path = (raw.routePathPoints ?? segments.flatMap((s) => s.shape.slice(0, 1))).map((p) => ({
    latitude: p.latitude,
    longitude: p.longitude,
  }));
  const meta = ROUTE_META[String(raw.routeId ?? "")];
  return {
    routeId: String(raw.routeId ?? fallbackName),
    routeName: meta?.name ?? raw.routeName ?? fallbackName,
    routeLength: raw.routeLength ?? segments.reduce((acc, s) => acc + s.segmentLength, 0),
    travelTime: raw.travelTime ?? 0,
    typicalTravelTime: raw.typicalTravelTime ?? 0,
    delayTime: raw.delayTime ?? 0,
    passable: raw.passable ?? true,
    completeness: raw.completeness ?? 100,
    routeConfidence: raw.routeConfidence ?? 0,
    path,
    segments,
    area: meta?.area,
  };
}

async function fetchRoute(routeId: string): Promise<TomTomRoute | null> {
  const apiKey = process.env.TOMTOM_ROUTE_MONITOR_KEY;
  if (!apiKey) {
    return FALLBACK_ROUTES[routeId] ?? null;
  }
  try {
    const response = await fetch(
      `https://api.tomtom.com/routemonitoring/3/routes/${routeId}/details?key=${apiKey}`,
      {
        // Cache for one minute so client-side is fast while staying fresh
        next: { revalidate: 60 },
      }
    );
    if (!response.ok) {
      return FALLBACK_ROUTES[routeId] ?? null;
    }
    const data = (await response.json()) as TomTomRoute;
    return data;
  } catch (error) {
    console.error("Failed to fetch TomTom route", routeId, error);
    return FALLBACK_ROUTES[routeId] ?? null;
  }
}

export async function GET() {
  const promises = ROUTES.map(async (route) => {
    const raw = await fetchRoute(route.id);
    if (!raw) return null;
    return mapRoute(raw, route.name);
  });

  const routes = (await Promise.all(promises)).filter(Boolean) as RouteDetails[];

  return NextResponse.json({
    fetchedAt: new Date().toISOString(),
    routes,
  });
}


