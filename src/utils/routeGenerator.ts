import { GeneratedBusRoute, RouteWaypoint, BusFleet } from '../types';

export interface ParsedGoogleMapsLocation {
  lat: number;
  lng: number;
  isValid: boolean;
  name: string;
  formattedCoordinates: string;
  sourceType: 'URL_QUERY' | 'URL_COORDINATE_PATH' | 'COORDINATE_TEXT' | 'LANDMARK_MATCH' | 'FALLBACK';
  googleMapsUrl: string;
}

export interface PresetGMapLandmark {
  id: string;
  name: string;
  category: string;
  lat: number;
  lng: number;
  address: string;
  corridor: string;
}

// Key landmarks across Bharuch Urban & Industrial transit network
export const PRESET_GMAP_LANDMARKS: PresetGMapLandmark[] = [
  {
    id: 'station-hub',
    name: 'Bharuch Central ST Bus Stand & Station Road',
    category: 'Transit Hub',
    lat: 21.7085,
    lng: 72.9860,
    address: 'Station Road, Old Bharuch City, Gujarat 392001',
    corridor: 'Central Transit Corridor',
  },
  {
    id: 'kasak-circle',
    name: 'Kasak Circle & Civil Hospital Cross',
    category: 'Commercial Junction',
    lat: 21.7015,
    lng: 72.9925,
    address: 'Kasak Main Road, Near Civil Hospital, Bharuch',
    corridor: 'South-Central Arterial',
  },
  {
    id: 'zadeshwar-chowkdi',
    name: 'Zadeshwar Chowkdi NH-48 Interchange',
    category: 'Highway Link',
    lat: 21.6980,
    lng: 73.0120,
    address: 'NH-48 Golden Quadrilateral Intersection, Zadeshwar',
    corridor: 'Highway Express Corridor',
  },
  {
    id: 'gnfc-complex',
    name: 'GNFC Township & Industrial North Gate',
    category: 'Industrial',
    lat: 21.7340,
    lng: 73.0080,
    address: 'GNFC Industrial Area, Narmadanagar, Bharuch',
    corridor: 'Industrial Heavy Freight Zone',
  },
  {
    id: 'bholav-circle',
    name: 'Bholav Patel Nagar Circle (Sector 2)',
    category: 'Residential / Arterial',
    lat: 21.7160,
    lng: 72.9920,
    address: 'Bholav Ring Road, Bharuch 392002',
    corridor: 'Bholav Commuter Loop',
  },
  {
    id: 'dahej-bypass',
    name: 'Dahej Bypass Heavy Vehicle Overbridge',
    category: 'Freight Corridor',
    lat: 21.6850,
    lng: 72.9650,
    address: 'Dahej State Highway 6, Western Bypass',
    corridor: 'Port & Industrial Transit Link',
  },
  {
    id: 'golden-bridge',
    name: 'Historic Golden Bridge Narmada Overpass',
    category: 'Bridge / Riverway',
    lat: 21.6880,
    lng: 72.9820,
    address: 'Narmada Riverfront Old Crossing, Bharuch',
    corridor: 'River Cross Connection',
  },
  {
    id: 'shaktinath-circle',
    name: 'Shaktinath Circle / Education Campus',
    category: 'Civic Center',
    lat: 21.7115,
    lng: 72.9980,
    address: 'Shaktinath Main Avenue, Bharuch',
    corridor: 'Civic Core Arterial',
  },
  {
    id: 'gidc-phase-2',
    name: 'GIDC Industrial Estate Phase 2 Chemical Zone',
    category: 'Industrial',
    lat: 21.7280,
    lng: 73.0060,
    address: 'GIDC Road No. 4, Ankleshwar-Bharuch Belt',
    corridor: 'Manufacturing Corridor',
  },
];

// Helper to compute haversine distance in km
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Generate Google Maps URL
export function generateGoogleMapsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps?q=${lat.toFixed(6)},${lng.toFixed(6)}&z=16`;
}

/**
 * Robust Google Maps input parser:
 * Parses:
 * 1. Coordinates: "21.7085, 72.9860" or "21.7085 72.9860"
 * 2. URL with ?q=lat,lng: https://maps.google.com/?q=21.7085,72.9860
 * 3. URL with @lat,lng,zoom: https://www.google.com/maps/@21.7085,72.9860,17z
 * 4. URL with /place/Name/@lat,lng: https://www.google.com/maps/place/Bharuch/@21.7085,72.9860
 * 5. Landmark names: "Kasak Circle", "GNFC", etc.
 */
export function parseGoogleMapsInput(input: string): ParsedGoogleMapsLocation {
  const trimmed = input.trim();

  if (!trimmed) {
    const fallback = PRESET_GMAP_LANDMARKS[0];
    return {
      lat: fallback.lat,
      lng: fallback.lng,
      isValid: false,
      name: fallback.name,
      formattedCoordinates: `${fallback.lat.toFixed(4)}°N, ${fallback.lng.toFixed(4)}°E`,
      sourceType: 'FALLBACK',
      googleMapsUrl: generateGoogleMapsUrl(fallback.lat, fallback.lng),
    };
  }

  // 1. Check for @lat,lng in URL (standard Google Maps web url)
  const atMatch = trimmed.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (atMatch) {
    const lat = parseFloat(atMatch[1]);
    const lng = parseFloat(atMatch[2]);
    // Extract place name if present in URL path
    let placeName = 'Attached Google Maps Location';
    const placeMatch = trimmed.match(/\/place\/([^/@]+)/);
    if (placeMatch && placeMatch[1]) {
      placeName = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
    }

    return {
      lat,
      lng,
      isValid: true,
      name: placeName,
      formattedCoordinates: `${lat.toFixed(5)}°N, ${lng.toFixed(5)}°E`,
      sourceType: 'URL_COORDINATE_PATH',
      googleMapsUrl: generateGoogleMapsUrl(lat, lng),
    };
  }

  // 2. Check for ?q=lat,lng or query=lat,lng
  const qMatch = trimmed.match(/[?&](?:q|query)=(-?\d+\.\d+)(?:,|%2C)(-?\d+\.\d+)/i);
  if (qMatch) {
    const lat = parseFloat(qMatch[1]);
    const lng = parseFloat(qMatch[2]);
    return {
      lat,
      lng,
      isValid: true,
      name: 'Google Maps Pinned Coordinate',
      formattedCoordinates: `${lat.toFixed(5)}°N, ${lng.toFixed(5)}°E`,
      sourceType: 'URL_QUERY',
      googleMapsUrl: generateGoogleMapsUrl(lat, lng),
    };
  }

  // 3. Check for direct coordinates "lat, lng" or "lat lng"
  const directCoordMatch = trimmed.match(/^(-?\d+\.\d+)[,\s]+(-?\d+\.\d+)$/);
  if (directCoordMatch) {
    const lat = parseFloat(directCoordMatch[1]);
    const lng = parseFloat(directCoordMatch[2]);
    return {
      lat,
      lng,
      isValid: true,
      name: `GPS Point (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
      formattedCoordinates: `${lat.toFixed(5)}°N, ${lng.toFixed(5)}°E`,
      sourceType: 'COORDINATE_TEXT',
      googleMapsUrl: generateGoogleMapsUrl(lat, lng),
    };
  }

  // 4. Check for landmark fuzzy match in Bharuch presets
  const lower = trimmed.toLowerCase();
  const matchedLandmark = PRESET_GMAP_LANDMARKS.find((lm) =>
    lm.name.toLowerCase().includes(lower) ||
    lm.category.toLowerCase().includes(lower) ||
    lm.corridor.toLowerCase().includes(lower) ||
    lm.id.toLowerCase().includes(lower)
  );

  if (matchedLandmark) {
    return {
      lat: matchedLandmark.lat,
      lng: matchedLandmark.lng,
      isValid: true,
      name: matchedLandmark.name,
      formattedCoordinates: `${matchedLandmark.lat.toFixed(5)}°N, ${matchedLandmark.lng.toFixed(5)}°E`,
      sourceType: 'LANDMARK_MATCH',
      googleMapsUrl: generateGoogleMapsUrl(matchedLandmark.lat, matchedLandmark.lng),
    };
  }

  // 5. If it looks like a URL but coordinates weren't parsed (e.g. goo.gl shortlink)
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    // Provide a smart anchor inside Bharuch central area
    const defaultAnchor = PRESET_GMAP_LANDMARKS[1];
    return {
      lat: defaultAnchor.lat,
      lng: defaultAnchor.lng,
      isValid: true,
      name: 'Google Maps Link Location (Bharuch Sector)',
      formattedCoordinates: `${defaultAnchor.lat.toFixed(5)}°N, ${defaultAnchor.lng.toFixed(5)}°E`,
      sourceType: 'URL_QUERY',
      googleMapsUrl: trimmed,
    };
  }

  // Fallback to Station Hub
  const fallback = PRESET_GMAP_LANDMARKS[0];
  return {
    lat: fallback.lat,
    lng: fallback.lng,
    isValid: false,
    name: trimmed || fallback.name,
    formattedCoordinates: `${fallback.lat.toFixed(5)}°N, ${fallback.lng.toFixed(5)}°E`,
    sourceType: 'FALLBACK',
    googleMapsUrl: generateGoogleMapsUrl(fallback.lat, fallback.lng),
  };
}

/**
 * Route Generator Engine
 * Given a target Google Maps location, generates an optimized bus survey route
 * connecting municipal depots, navigating through major transit corridors,
 * and performing a dedicated inspection stop at the target coordinates.
 */
export function generateBusRouteForLocation(
  targetLat: number,
  targetLng: number,
  locationName: string,
  options?: {
    busId?: string;
    busNumber?: string;
    routeName?: string;
  }
): {
  route: GeneratedBusRoute;
  bus: BusFleet;
} {
  const busId = options?.busId || 'BUS-05';
  const busNumber = options?.busNumber || 'GJ-16-Z-9905';
  const routeId = `RT-INSP-${Math.floor(100 + Math.random() * 900)}`;

  // Hub 1: Bharuch Central Bus Stand / Railway Station
  const depotStart = {
    name: 'Bharuch Central Transit Terminal (Depot Alpha)',
    lat: 21.7085,
    lng: 72.9860,
    instruction: 'Depart Central Depot; initiate onboard edge AI survey cameras',
  };

  // Intermediate node 1: Interpolated toward target
  const midLat1 = depotStart.lat + (targetLat - depotStart.lat) * 0.45;
  const midLng1 = depotStart.lng + (targetLng - depotStart.lng) * 0.52;
  const approachNode = {
    name: `Arterial Corridor Approach via ${getCorridorNameForCoords(midLat1, midLng1)}`,
    lat: midLat1,
    lng: midLng1,
    instruction: 'Transit corridor waypoint; adjust camera exposure to ambient light',
  };

  // Target Inspection Node (Exact location provided by Google Maps)
  const targetNode: RouteWaypoint = {
    name: `🎯 HAZARD INSPECTION ZONE: ${locationName}`,
    lat: targetLat,
    lng: targetLng,
    isTargetLocation: true,
    instruction: 'CRITICAL SURVEY POINT: Reduce speed to 20 km/h; trigger multi-frame defect capture & IMU vibration logging',
    dwellTimeSec: 180,
  };

  // Intermediate node 2: Loop / Exit toward return terminal
  const depotEnd = {
    name: 'Municipal Fleet Maintenance Terminal (East Yard)',
    lat: 21.7190,
    lng: 72.9880,
    instruction: 'Complete inspection loop; upload final edge telemetry packet',
  };

  const midLat2 = targetLat + (depotEnd.lat - targetLat) * 0.55;
  const midLng2 = targetLng + (depotEnd.lng - targetLng) * 0.48;
  const exitNode = {
    name: `Return Link via ${getCorridorNameForCoords(midLat2, midLng2)}`,
    lat: midLat2,
    lng: midLng2,
    instruction: 'Turn onto arterial bypass; continue continuous road health monitoring',
  };

  // Assemble waypoints
  const waypoints: RouteWaypoint[] = [
    { ...depotStart, isTargetLocation: false, dwellTimeSec: 60 },
    { ...approachNode, isTargetLocation: false },
    targetNode,
    { ...exitNode, isTargetLocation: false },
    { ...depotEnd, isTargetLocation: false, dwellTimeSec: 120 },
  ];

  // Build dense polyline coordinates for smooth map navigation
  const routeCoordinates: [number, number][] = [];
  for (let i = 0; i < waypoints.length - 1; i++) {
    const p1 = waypoints[i];
    const p2 = waypoints[i + 1];
    
    // Add sub-steps between major waypoints for realistic road geometry curve
    const steps = 6;
    for (let s = 0; s < steps; s++) {
      const t = s / steps;
      // Add slight road curvature offset
      const curveOffset = Math.sin(t * Math.PI) * 0.0012 * (i % 2 === 0 ? 1 : -1);
      const lat = p1.lat + (p2.lat - p1.lat) * t + curveOffset;
      const lng = p1.lng + (p2.lng - p1.lng) * t + curveOffset * 0.7;
      routeCoordinates.push([lat, lng]);
    }
  }
  // Add final waypoint
  routeCoordinates.push([depotEnd.lat, depotEnd.lng]);
  // Close the loop to start point for continuous bus patrol
  routeCoordinates.push([depotStart.lat, depotStart.lng]);

  // Calculate total distance
  let totalKm = 0;
  for (let i = 0; i < routeCoordinates.length - 1; i++) {
    totalKm += calculateHaversineDistanceKm(
      routeCoordinates[i][0],
      routeCoordinates[i][1],
      routeCoordinates[i + 1][0],
      routeCoordinates[i + 1][1]
    );
  }

  // Urban bus speed average 26 km/h + dwell times
  const driveMinutes = (totalKm / 26) * 60;
  const dwellMinutes = (60 + 180 + 120) / 60; // 6 mins total dwell
  const estimatedDurationMin = Math.round(driveMinutes + dwellMinutes);

  const cleanLocationShortName = locationName.length > 32 ? locationName.slice(0, 32) + '...' : locationName;
  const routeName = options?.routeName || `Route INSP-05 (Depot ➔ ${cleanLocationShortName})`;

  const generatedRoute: GeneratedBusRoute = {
    routeId,
    routeName,
    busId,
    busNumber,
    totalDistanceKm: parseFloat(totalKm.toFixed(1)),
    estimatedDurationMin,
    targetLocationName: locationName,
    targetLat,
    targetLng,
    waypoints,
    routeCoordinates,
    generatedAt: new Date().toLocaleTimeString('en-IN') + ' IST',
    description: `Dynamic municipal survey route generated to inspect road defects at ${locationName} using onboard transit fleet cameras.`,
  };

  const busFleetItem: BusFleet = {
    id: busId,
    busNumber,
    routeId,
    routeName,
    driverName: 'Devendra Gohil (Fleet Inspection Pilot)',
    speedKmh: 32,
    lat: routeCoordinates[0][0],
    lng: routeCoordinates[0][1],
    headingDeg: 65,
    routeCoordinates,
    currentWaypointIndex: 0,
    direction: 1,
    cameraStatus: 'ACTIVE',
    aiInferenceFps: 30.0,
    edgeHardware: 'NVIDIA Jetson AGX Orin + Dual IMX390 4K HDR',
    detectionsCount: 1,
    lastDetectionTime: 'Route Generated (Live Survey Ready)',
    isGeneratedRoute: true,
    targetHazardId: undefined,
    targetLocationName: locationName,
  };

  return {
    route: generatedRoute,
    bus: busFleetItem,
  };
}

function getCorridorNameForCoords(lat: number, lng: number): string {
  if (lat > 21.72) return 'GIDC Industrial Avenue';
  if (lat < 21.69) return 'Narmada Riverfront Bypass';
  if (lng > 73.00) return 'Zadeshwar Highway Link';
  return 'City Center Arterial';
}
