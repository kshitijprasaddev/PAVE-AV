import { NextResponse } from "next/server";

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

const DEFAULT_STATS_URL =
  "https://fargoprod.blob.core.windows.net/fargo-prod/jobs%2F7990075%2Fresults%2FIngolstadt_New.json?sv=2025-01-05&se=2027-10-25T18%3A16%3A53Z&sr=b&sp=r&sig=MLpj%2FRb2%2FpHjmx2DOBep2h0fhvyzv63iyRMrxEky%2Fe0%3D";

export async function GET() {
  const url = process.env.TOMTOM_TRAFFIC_STATS_JSON_URL ?? DEFAULT_STATS_URL;
  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch traffic stats" }, { status: 502 });
    }
    const raw = (await response.json()) as TomTomPayload;
    const segments: TomTomSegment[] = Array.isArray(raw.segments)
      ? raw.segments
      : Array.isArray(raw.result?.segments)
      ? (raw.result?.segments as TomTomSegment[])
      : [];

    const mapped = segments.map((segment) => {
      const stat = Array.isArray(segment.segmentTimeResults) ? segment.segmentTimeResults[0] : undefined;
      const harmonicSpeed = stat?.harmonicAverageSpeed ?? null;
      const averageSpeed = stat?.averageSpeed ?? null;
      const speedLimit = segment.speedLimit ?? null;
      const delayIndex = speedLimit !== null && harmonicSpeed !== null ? Math.max(0, speedLimit - harmonicSpeed) : null;
      return {
        id: segment.newSegmentId ?? String(segment.segmentId ?? "unknown"),
        streetName: segment.streetName ?? "Unknown",
        distance: segment.distance ?? null,
        speedLimit,
        harmonicAverageSpeed: harmonicSpeed,
        averageSpeed,
        travelTimeSeconds: stat?.averageTravelTime ?? null,
        sampleSize: stat?.sampleSize ?? null,
        delayIndex,
        percentiles: stat?.speedPercentiles ?? [],
      };
    });

    const topByDelay = mapped
      .filter((item) => typeof item.delayIndex === "number")
      .sort((a, b) => (b.delayIndex ?? 0) - (a.delayIndex ?? 0))
      .slice(0, 10);

    return NextResponse.json({
      fetchedAt: new Date().toISOString(),
      network: raw.network ?? null,
      sampleSize: mapped.length,
      topSegments: topByDelay,
    });
  } catch (error) {
    console.error("traffic stats error", error);
    return NextResponse.json({ error: "Unexpected traffic stats error" }, { status: 500 });
  }
}
