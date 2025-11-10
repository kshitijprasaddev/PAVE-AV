import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";

type SegmentStat = {
  harmonicAverageSpeed?: number;
  averageSpeed?: number;
  averageTravelTime?: number;
  sampleSize?: number;
  speedPercentiles?: number[];
};

type TomTomSegment = {
  segmentId?: number;
  newSegmentId?: string;
  speedLimit?: number;
  streetName?: string;
  distance?: number;
  segmentTimeResults?: SegmentStat[];
};

type TomTomPayload = {
  network?: unknown;
  segments?: TomTomSegment[];
  result?: {
    segments?: TomTomSegment[];
  };
};

type TomTomGeoJson = {
  type?: string;
  features?: Array<{
    geometry?: unknown;
    properties?: TomTomSegment & Record<string, unknown>;
  }>;
};

const DEFAULT_STATS_URL =
  "https://fargoprod.blob.core.windows.net/fargo-prod/jobs%2F7990075%2Fresults%2FIngolstadt_New.json?sv=2025-01-05&se=2027-10-25T18%3A16%3A53Z&sr=b&sp=r&sig=MLpj%2FRb2%2FpHjmx2DOBep2h0fhvyzv63iyRMrxEky%2Fe0%3D";
const DEFAULT_GEOJSON_PATH = path.join("public", "data", "traffic", "jobs_7990075_results_Ingolstadt_New.geojson");

async function fileExists(filePath: string) {
  try {
    await fs.access(filePath);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException)?.code === "ENOENT") return false;
    throw error;
  }
}

function extractSegmentsFromPayload(
  payload: TomTomPayload | TomTomGeoJson
): { segments: TomTomSegment[]; geometryMap: Map<string, unknown> } {
  const geometryMap = new Map<string, unknown>();

  if (Array.isArray((payload as TomTomPayload)?.segments)) {
    return { segments: (payload as TomTomPayload).segments ?? [], geometryMap };
  }

  if (Array.isArray((payload as TomTomPayload)?.result?.segments)) {
    return { segments: (payload as TomTomPayload).result?.segments ?? [], geometryMap };
  }

  if (Array.isArray((payload as TomTomGeoJson)?.features)) {
    const segments: TomTomSegment[] = [];
    for (const feature of (payload as TomTomGeoJson).features ?? []) {
      const props = feature?.properties;
      if (!props || !Array.isArray(props.segmentTimeResults)) continue;
      const segment = {
        segmentId: props.segmentId,
        newSegmentId: props.newSegmentId,
        speedLimit: props.speedLimit,
        streetName: props.streetName,
        distance: props.distance,
        segmentTimeResults: props.segmentTimeResults,
      } as TomTomSegment;
      segments.push(segment);
      const id = segment.newSegmentId ?? String(segment.segmentId ?? "unknown");
      geometryMap.set(id, feature?.geometry ?? null);
    }
    return { segments, geometryMap };
  }

  return { segments: [], geometryMap };
}

export async function GET() {
  const url = process.env.TOMTOM_TRAFFIC_STATS_JSON_URL ?? DEFAULT_STATS_URL;
  const geoJsonPath = process.env.TOMTOM_TRAFFIC_GEOJSON_PATH ?? path.join(process.cwd(), DEFAULT_GEOJSON_PATH);
  try {
    let payload: TomTomPayload | TomTomGeoJson | null = null;
    let geometryMap = new Map<string, unknown>();

    const localFileAvailable = await fileExists(geoJsonPath);

    if (localFileAvailable) {
      const fileContents = await fs.readFile(geoJsonPath, "utf8");
      payload = JSON.parse(fileContents) as TomTomGeoJson;
    }

    if (!payload) {
      try {
        if (url.startsWith("file://")) {
          const filePath = url.replace("file://", "");
          const contents = await fs.readFile(filePath, "utf8");
          payload = JSON.parse(contents) as TomTomGeoJson;
        } else if (url !== "local") {
          const response = await fetch(url, { cache: "no-store" });
          if (!response.ok) {
            throw new Error(`Traffic stats fetch failed with status ${response.status}`);
          }
          payload = (await response.json()) as TomTomPayload | TomTomGeoJson;
        }
      } catch (remoteError) {
        if (!localFileAvailable) {
          throw remoteError;
        }
      }
    }

    if (!payload && localFileAvailable) {
      const fallbackContents = await fs.readFile(geoJsonPath, "utf8");
      payload = JSON.parse(fallbackContents) as TomTomGeoJson;
    }

    const extracted = extractSegmentsFromPayload(payload ?? {});
    const segments = extracted.segments;
    geometryMap = extracted.geometryMap;

    const mapped = segments.map((segment, index) => {
      const stat = Array.isArray(segment.segmentTimeResults) ? segment.segmentTimeResults[0] : undefined;
      const harmonicSpeed = stat?.harmonicAverageSpeed ?? null;
      const averageSpeed = stat?.averageSpeed ?? null;
      const speedLimit = segment.speedLimit ?? null;
      const delayIndex = speedLimit !== null && harmonicSpeed !== null ? Math.max(0, speedLimit - harmonicSpeed) : null;
      const id = segment.newSegmentId ?? String(segment.segmentId ?? "unknown");
      
      // Generate descriptive name if streetName is missing
      let displayName = segment.streetName;
      if (!displayName || displayName.trim() === "") {
        const segmentNumber = String(segment.segmentId ?? index).slice(-4);
        const speedCategory = speedLimit && speedLimit >= 50 ? "Arterial" : speedLimit && speedLimit >= 30 ? "Collector" : "Local";
        displayName = `${speedCategory} Segment ${segmentNumber}`;
      }
      
      return {
        id,
        streetName: displayName,
        distance: segment.distance ?? null,
        speedLimit,
        harmonicAverageSpeed: harmonicSpeed,
        averageSpeed,
        travelTimeSeconds: stat?.averageTravelTime ?? null,
        sampleSize: stat?.sampleSize ?? null,
        delayIndex,
        percentiles: stat?.speedPercentiles ?? [],
        geometry: geometryMap.get(id) ?? null,
      };
    });

    const topByDelay = mapped
      .filter((item) => {
        // Only include city segments (speed limit ≤ 70 km/h to exclude highways)
        if (!item.speedLimit || item.speedLimit > 70) return false;
        if (typeof item.delayIndex !== "number") return false;
        // Must have reasonable sample size
        if (!item.sampleSize || item.sampleSize < 100) return false;
        return true;
      })
      .sort((a, b) => (b.delayIndex ?? 0) - (a.delayIndex ?? 0))
      .slice(0, 10);

    return NextResponse.json({
      fetchedAt: new Date().toISOString(),
      network: (payload as TomTomPayload)?.network ?? null,
      sampleSize: mapped.length,
      topSegments: topByDelay,
    });
  } catch (error) {
    console.error("traffic stats error", error);
    return NextResponse.json({ error: "Unexpected traffic stats error" }, { status: 500 });
  }
}
