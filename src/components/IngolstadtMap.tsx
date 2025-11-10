"use client";

import { useCallback, useMemo, useState } from "react";
import DeckGL, { type DeckGLProps } from "@deck.gl/react";
import { GeoJsonLayer, ScatterplotLayer, TextLayer } from "@deck.gl/layers";
import { HeatmapLayer } from "@deck.gl/aggregation-layers";
import {
  AmbientLight,
  DirectionalLight,
  LightingEffect,
  type PickingInfo,
} from "@deck.gl/core";
import Map, { NavigationControl, ScaleControl } from "react-map-gl/mapbox";
import type { RouteDetails } from "@/types/routes";
import mapboxgl from "mapbox-gl";
import type { Feature, FeatureCollection, LineString } from "geojson";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

if (typeof window !== "undefined" && mapboxgl) {
  mapboxgl.accessToken = MAPBOX_TOKEN;
}

const initialViewState = {
  longitude: 11.4183,
  latitude: 48.7589,
  zoom: 12.5,
  pitch: 50,
  bearing: 20,
};

const ambientLight = new AmbientLight({ color: [255, 255, 255], intensity: 1.0 });
const directionalLight = new DirectionalLight({
  color: [255, 255, 255],
  intensity: 1.3,
  direction: [-3, -9, -1],
});

const lightingEffect = new LightingEffect({ ambientLight, directionalLight });

type DemandPoint = {
  longitude: number;
  latitude: number;
  weight: number;
  corridor: string;
};

type DepotSite = {
  name: string;
  longitude: number;
  latitude: number;
  capacityKw: number;
};

const DEPOT_SITES: DepotSite[] = [
  { name: "Audi Forum Hub", longitude: 11.4142, latitude: 48.7829, capacityKw: 1800 },
  { name: "Nordbahnhof Depot", longitude: 11.4261, latitude: 48.764, capacityKw: 2200 },
  { name: "GVZ Logistics Hub", longitude: 11.4635, latitude: 48.7738, capacityKw: 1500 },
];

function severityColor(value: number) {
  const clamped = Math.max(0, Math.min(1, value));
  const r = 200 + clamped * 55;
  const g = 100 - clamped * 70;
  const b = 80 - clamped * 40;
  return [r, Math.max(0, g), Math.max(0, b)];
}

type MapViewState = typeof initialViewState;

type IngolstadtMapProps = {
  routes: RouteDetails[];
  loading?: boolean;
  showLegend?: boolean;
  trafficWeights?: Record<string, number>;
  trafficSegments?: {
    id: string;
    coordinates: [number, number][];
    delayIndex: number | null;
    streetName: string;
  }[];
  selectedRouteId?: string | null;
  onRouteSelect?: (route: RouteDetails | null) => void;
};

export function IngolstadtMap(props: IngolstadtMapProps) {
  const { routes, loading, showLegend = true, trafficWeights, trafficSegments, selectedRouteId, onRouteSelect } = props;
  const [viewState, setViewState] = useState(initialViewState);

  const demandPoints: DemandPoint[] = useMemo(() => {
    if (!routes.length) return [];
    return routes.flatMap((route) => {
      const delayRatio = route.typicalTravelTime > 0 ? route.delayTime / route.typicalTravelTime : 0;
      const routeTrafficBoost = route.segments.reduce((max, segment) => {
        const key = segment.newSegmentId ?? (segment.segmentId != null ? String(segment.segmentId) : null);
        if (key && trafficWeights && trafficWeights[key] != null) {
          return Math.max(max, trafficWeights[key]);
        }
        return max;
      }, 0);
      const severity = Math.min(1, Math.max(0.05, delayRatio + routeTrafficBoost / 40));
      const segmentPoints = route.segments.flatMap((segment) => {
        const shape = segment.shape?.length ? segment.shape : [];
        const segKey = segment.newSegmentId ?? (segment.segmentId != null ? String(segment.segmentId) : null);
        const segmentWeight = segKey && trafficWeights ? trafficWeights[segKey] ?? 0 : 0;
        return shape.map((p) => ({
          longitude: p.longitude,
          latitude: p.latitude,
          weight: severity * (segment.delaySeconds + 30 + segmentWeight * 50) / 30,
          corridor: route.routeName,
        }));
      });
      if (segmentPoints.length) return segmentPoints;
      return route.path.map((p) => ({
        longitude: p.longitude,
        latitude: p.latitude,
        weight: severity * 1.5,
        corridor: route.routeName,
      }));
    });
  }, [routes, trafficWeights]);

  type TrafficFeatureProps = { id: string; delayIndex: number | null; streetName: string };
  type TrafficFeature = Feature<LineString, TrafficFeatureProps>;
  type TrafficFeatureCollection = FeatureCollection<LineString, TrafficFeatureProps>;

  const trafficFeatures = useMemo<TrafficFeatureCollection | null>(() => {
    if (!trafficSegments?.length) return null;
    const features: TrafficFeature[] = trafficSegments.map((segment) => ({
      type: "Feature",
      geometry: { type: "LineString", coordinates: segment.coordinates },
      properties: {
        id: segment.id,
        delayIndex: segment.delayIndex,
        streetName: segment.streetName,
      },
    }));
    return {
      type: "FeatureCollection",
      features,
    };
  }, [trafficSegments]);

  const layers = useMemo(() => {
    const baseColorRange: [number, number, number, number][] = [
      [236, 249, 255, 140],
      [190, 221, 255, 170],
      [123, 175, 255, 190],
      [72, 138, 255, 210],
      [35, 99, 241, 230],
      [16, 68, 201, 250],
    ];

    const heatmapLayer = new HeatmapLayer<DemandPoint>({
      id: "ingolstadt-demand-heat",
      data: demandPoints,
      getPosition: (d) => [d.longitude, d.latitude],
      getWeight: (d) => d.weight,
      radiusPixels: 40,
      intensity: 1.2,
      threshold: 0.03,
      colorRange: baseColorRange,
    });

    const trafficLayer = new GeoJsonLayer({
      id: "ingolstadt-traffic",
      data: trafficFeatures ?? undefined,
      visible: Boolean(trafficSegments?.length),
      pickable: true,
      stroked: true,
      filled: false,
      getLineColor: (feature: { properties?: { delayIndex?: number | null } }) => {
        const delayIndex = feature.properties?.delayIndex ?? 0;
        // Show all segments, not just high delays
        if (delayIndex < 10) return [100, 200, 255, 180]; // Light blue for low delay
        if (delayIndex < 30) return [255, 200, 100, 220]; // Yellow for moderate
        const severity = Math.min(1, delayIndex / 60);
        const base = severityColor(severity);
        return [base[0], Math.max(0, base[1]), Math.max(0, base[2]), 240];
      },
      getLineWidth: (feature: { properties?: { delayIndex?: number | null } }) => {
        const delayIndex = feature.properties?.delayIndex ?? 0;
        // Make all segments visible, scale width by severity
        return Math.max(2, 2.5 + Math.min(10, delayIndex * 0.5));
      },
      lineWidthUnits: "pixels",
      parameters: {
        depthTest: false,
      },
      updateTriggers: {
        getLineColor: trafficSegments,
        getLineWidth: trafficSegments,
      },
    });

    const selectedRoute = selectedRouteId ? routes.find((route) => route.routeId === selectedRouteId) : null;

    const selectedRouteLayer = selectedRoute
      ? new GeoJsonLayer({
          id: "ingolstadt-selected-route",
          data: {
            type: "FeatureCollection",
            features: [
              {
                type: "Feature" as const,
                geometry: {
                  type: "LineString" as const,
                  coordinates: selectedRoute.path.map((p) => [p.longitude, p.latitude] as [number, number]),
                },
                properties: {
                  id: selectedRoute.routeId,
                },
              },
            ],
          },
          stroked: true,
          filled: false,
          pickable: false,
          getLineColor: [255, 255, 255, 255],
          getLineWidth: 6,
          lineWidthUnits: "pixels",
          parameters: { depthTest: false },
        })
      : null;

    const depotLayer = new ScatterplotLayer<DepotSite>({
      id: "ingolstadt-depots",
      data: DEPOT_SITES,
      pickable: true,
      radiusMinPixels: 8,
      radiusMaxPixels: 40,
      getPosition: (d) => [d.longitude, d.latitude],
      getRadius: () => 120,
      getFillColor: () => [12, 178, 116, 230],
      getLineColor: () => [0, 92, 63, 255],
      lineWidthMinPixels: 1.5,
    });

    const depotLabels = new TextLayer<DepotSite>({
      id: "ingolstadt-depot-labels",
      data: DEPOT_SITES,
      pickable: false,
      getPosition: (d) => [d.longitude, d.latitude],
      getText: (d) => d.name,
      getSize: 14,
      getColor: () => [20, 66, 46, 230],
      getTextAnchor: () => "start",
      getAlignmentBaseline: () => "bottom",
      background: true,
      getBackgroundColor: () => [255, 255, 255, 200],
      backgroundPadding: [6, 3],
    });

    return [heatmapLayer, trafficLayer, ...(selectedRouteLayer ? [selectedRouteLayer] : []), depotLayer, depotLabels];
  }, [routes, demandPoints, trafficFeatures, selectedRouteId, trafficSegments]);

  const tooltip = (info: PickingInfo<RouteDetails | DemandPoint | DepotSite | TrafficFeature>) => {
    const object = info.object;
    if (!object) return null;
    if ("corridor" in object) {
      return `${object.corridor}\nRelative demand weight: ${object.weight.toFixed(2)}`;
    }
    if ("properties" in object && object.properties && typeof object.properties === "object" && "streetName" in object.properties) {
      const props = object.properties as TrafficFeatureProps;
      const delayIndex = props.delayIndex ?? 0;
      return `${props.streetName}\nDelay index: ${delayIndex.toFixed(1)} km/h`;
    }
    if ("name" in object && "capacityKw" in object) {
      return `${object.name}\nAvailable charging: ${(object.capacityKw / 1000).toFixed(2)} MW`;
    }
    return null;
  };

  const handleViewStateChange: DeckGLProps["onViewStateChange"] = (event) => {
    setViewState(event.viewState as MapViewState);
  };

  const handleDeckClick: DeckGLProps["onClick"] = useCallback(
    (info: PickingInfo<RouteDetails>) => {
      if (!onRouteSelect) return;
      const obj = info.object as RouteDetails | null;
      onRouteSelect(obj ?? null);
    },
    [onRouteSelect]
  );

  const getCursor: DeckGLProps["getCursor"] = useCallback(({ isDragging, isHovering }: { isDragging: boolean; isHovering: boolean }) => {
    if (isDragging) return "grabbing";
    return isHovering ? "pointer" : "grab";
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl border border-white/15 bg-neutral-950 shadow-2xl">
      <DeckGL
        layers={layers}
        effects={[lightingEffect]}
        getTooltip={tooltip}
        controller
        viewState={viewState}
        onViewStateChange={handleViewStateChange}
        onClick={handleDeckClick}
        getCursor={getCursor}
      >
        <Map
          reuseMaps
          mapLib={mapboxgl as typeof mapboxgl}
          mapboxAccessToken={MAPBOX_TOKEN}
          mapStyle="mapbox://styles/mapbox/streets-v12"
          style={{ width: "100%", height: "100%" }}
          longitude={viewState.longitude}
          latitude={viewState.latitude}
          zoom={viewState.zoom}
          pitch={viewState.pitch}
          bearing={viewState.bearing}
        >
          <NavigationControl visualizePitch position="top-right" showCompass showZoom />
          <ScaleControl maxWidth={120} unit="metric" position="bottom-right" />
        </Map>
      </DeckGL>
      {showLegend && (
        <div className="pointer-events-none absolute bottom-3 left-3 rounded-xl border border-white/15 bg-black/80 px-4 py-3 text-[11px] shadow-2xl backdrop-blur">
          <div className="font-semibold uppercase tracking-widest text-neutral-400">Legend</div>
          <div className="mt-2 flex items-center gap-2">
            <span className="h-2 w-4 rounded-full bg-gradient-to-r from-blue-100 via-blue-400 to-blue-700" />
            <span className="text-neutral-300">Demand density</span>
          </div>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="h-1.5 w-5 rounded-full bg-gradient-to-r from-blue-300 to-yellow-400" />
            <span className="text-neutral-300">Low-moderate delay</span>
          </div>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="h-2 w-5 rounded-full bg-gradient-to-r from-yellow-400 to-red-600" />
            <span className="text-neutral-300">High congestion</span>
          </div>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded bg-emerald-500"></span>
            <span className="text-neutral-300">Charging depots</span>
          </div>
        </div>
      )}
      <div className="pointer-events-none absolute left-3 top-3 rounded-md bg-white/85 px-3 py-2 text-xs font-medium uppercase tracking-widest text-neutral-700 shadow-md dark:bg-neutral-950/75 dark:text-neutral-200">
        Ingolstadt Autonomous Mobility Twin {loading ? "· updating…" : ""}
      </div>
      {!MAPBOX_TOKEN && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white text-center p-4">
          Mapbox token not set in .env.local - add NEXT_PUBLIC_MAPBOX_TOKEN=your_token and restart the server
        </div>
      )}
    </div>
  );
}


