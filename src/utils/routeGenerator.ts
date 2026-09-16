import { GeneratedBusRoute, RouteWaypoint, BusFleet, DetailedLocation } from '../types';

export interface ParsedGoogleMapsLocation {
  lat: number;
  lng: number;
  isValid: boolean;
  name: string;
  formattedCoordinates: string;
  sourceType: 'URL_QUERY' | 'URL_COORDINATE_PATH' | 'COORDINATE_TEXT' | 'LANDMARK_MATCH' | 'CITY_MATCH' | 'MAP_CLICK' | 'REVERSE_GEOCODED' | 'GEOCODE_API' | 'LANDMARK_PRESET' | 'FALLBACK';
  googleMapsUrl: string;
  city?: string;
  district?: string;
  state?: string;
  country?: string;
  address?: string;
  formattedAddress?: string;
}

export interface PresetGMapLandmark {
  id: string;
  name: string;
  category: string;
  lat: number;
  lng: number;
  address: string;
  corridor: string;
  city: string;
  state: string;
}

// Key transit hubs and urban landmarks across Gujarat transit corridors
export const PRESET_GMAP_LANDMARKS: PresetGMapLandmark[] = [
  // Vadodara
  {
    id: 'vadodara-station',
    name: 'Vadodara Central Railway Station & Sayajigunj',
    category: 'Transit Hub',
    lat: 22.3107,
    lng: 73.1812,
    address: 'Station Road, Sayajigunj, Vadodara, Gujarat 390005',
    corridor: 'Vadodara Central Commuter Corridor',
    city: 'Vadodara',
    state: 'Gujarat',
  },
  {
    id: 'vadodara-alkapuri',
    name: 'Alkapuri RC Dutt Road Commercial Hub, Vadodara',
    category: 'Commercial Center',
    lat: 22.3128,
    lng: 73.1702,
    address: 'RC Dutt Road, Alkapuri, Vadodara, Gujarat 390007',
    corridor: 'Alkapuri Express Arterial',
    city: 'Vadodara',
    state: 'Gujarat',
  },
  {
    id: 'vadodara-makarpura',
    name: 'Makarpura GIDC Industrial Corridor, Vadodara',
    category: 'Industrial',
    lat: 22.2548,
    lng: 73.1956,
    address: 'Makarpura Main Road, GIDC, Vadodara 390010',
    corridor: 'Makarpura Industrial Freight Transit',
    city: 'Vadodara',
    state: 'Gujarat',
  },
  {
    id: 'vadodara-akota',
    name: 'Akota - Dandia Bazar Bridge Road, Vadodara',
    category: 'Arterial Link',
    lat: 22.2982,
    lng: 73.1755,
    address: 'Akota Stadium Road, Vadodara, Gujarat 390020',
    corridor: 'Akota Riverfront Link',
    city: 'Vadodara',
    state: 'Gujarat',
  },

  // Bharuch
  {
    id: 'station-hub',
    name: 'Bharuch Central ST Bus Stand & Station Road',
    category: 'Transit Hub',
    lat: 21.7085,
    lng: 72.9860,
    address: 'Station Road, Old Bharuch City, Gujarat 392001',
    corridor: 'Central Transit Corridor',
    city: 'Bharuch',
    state: 'Gujarat',
  },
  {
    id: 'kasak-circle',
    name: 'Kasak Circle & Civil Hospital Cross',
    category: 'Commercial Junction',
    lat: 21.7015,
    lng: 72.9925,
    address: 'Kasak Main Road, Near Civil Hospital, Bharuch',
    corridor: 'South-Central Arterial',
    city: 'Bharuch',
    state: 'Gujarat',
  },
  {
    id: 'zadeshwar-chowkdi',
    name: 'Zadeshwar Chowkdi NH-48 Interchange',
    category: 'Highway Link',
    lat: 21.6980,
    lng: 73.0120,
    address: 'NH-48 Golden Quadrilateral Intersection, Zadeshwar',
    corridor: 'Highway Express Corridor',
    city: 'Bharuch',
    state: 'Gujarat',
  },
  {
    id: 'gnfc-complex',
    name: 'GNFC Township & Industrial North Gate',
    category: 'Industrial',
    lat: 21.7340,
    lng: 73.0080,
    address: 'GNFC Industrial Area, Narmadanagar, Bharuch',
    corridor: 'Industrial Heavy Freight Zone',
    city: 'Bharuch',
    state: 'Gujarat',
  },
  {
    id: 'bholav-circle',
    name: 'Bholav Patel Nagar Circle (Sector 2)',
    category: 'Residential / Arterial',
    lat: 21.7160,
    lng: 72.9920,
    address: 'Bholav Ring Road, Bharuch 392002',
    corridor: 'Bholav Commuter Loop',
    city: 'Bharuch',
    state: 'Gujarat',
  },

  // Ahmedabad
  {
    id: 'ahmedabad-kalupur',
    name: 'Ahmedabad Kalupur Central Station Cross',
    category: 'Transit Hub',
    lat: 23.0225,
    lng: 72.5714,
    address: 'Railway Station Road, Kalupur, Ahmedabad, Gujarat 380002',
    corridor: 'Ahmedabad East-West Metro Arterial',
    city: 'Ahmedabad',
    state: 'Gujarat',
  },
  {
    id: 'ahmedabad-sg-highway',
    name: 'SG Highway & Iscon Crossroad, Ahmedabad',
    category: 'Highway Link',
    lat: 23.0276,
    lng: 72.5065,
    address: 'Sarkhej - Gandhinagar Hwy, Ahmedabad 380054',
    corridor: 'SG Highway Rapid Transit',
    city: 'Ahmedabad',
    state: 'Gujarat',
  },

  // Surat
  {
    id: 'surat-station',
    name: 'Surat Railway Station Ring Road Cross',
    category: 'Transit Hub',
    lat: 21.2048,
    lng: 72.8409,
    address: 'Station Road, Varachha, Surat, Gujarat 395003',
    corridor: 'Surat Diamond Corridor',
    city: 'Surat',
    state: 'Gujarat',
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
 * Helper to determine city & state by coordinate proximity for Indian regions
 */
export function resolveCityFromCoordinates(lat: number, lng: number): { city: string; state: string; name: string } {
  if (lat >= 22.15 && lat <= 22.45 && lng >= 73.05 && lng <= 73.35) {
    return { city: 'Vadodara', state: 'Gujarat', name: 'Vadodara, Gujarat' };
  }
  if (lat >= 21.60 && lat <= 21.80 && lng >= 72.85 && lng <= 73.15) {
    return { city: 'Bharuch', state: 'Gujarat', name: 'Bharuch, Gujarat' };
  }
  if (lat >= 22.90 && lat <= 23.25 && lng >= 72.40 && lng <= 72.80) {
    return { city: 'Ahmedabad', state: 'Gujarat', name: 'Ahmedabad, Gujarat' };
  }
  if (lat >= 21.05 && lat <= 21.30 && lng >= 72.70 && lng <= 73.00) {
    return { city: 'Surat', state: 'Gujarat', name: 'Surat, Gujarat' };
  }
  if (lat >= 21.55 && lat <= 21.68 && lng >= 72.95 && lng <= 73.08) {
    return { city: 'Ankleshwar', state: 'Gujarat', name: 'Ankleshwar, Gujarat' };
  }
  if (lat >= 23.15 && lat <= 23.35 && lng >= 72.55 && lng <= 72.75) {
    return { city: 'Gandhinagar', state: 'Gujarat', name: 'Gandhinagar, Gujarat' };
  }
  if (lat >= 22.15 && lat <= 22.40 && lng >= 70.65 && lng <= 70.95) {
    return { city: 'Rajkot', state: 'Gujarat', name: 'Rajkot, Gujarat' };
  }
  return { city: 'Urban Sector', state: 'Gujarat', name: `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E` };
}

/**
 * Robust Google Maps input parser:
 * Parses:
 * 1. Coordinates: "22.3072, 73.1812" or "22.3072 73.1812"
 * 2. URL with ?q=lat,lng: https://maps.google.com/?q=22.3072,73.1812
 * 3. URL with @lat,lng,zoom: https://www.google.com/maps/@22.3072,73.1812,17z
 * 4. URL with /place/Name/@lat,lng: https://www.google.com/maps/place/Vadodara/@22.3072,73.1812
 * 5. City names: "Vadodara", "Bharuch", "Ahmedabad", etc.
 * 6. Landmark names: "Alkapuri", "Kasak Circle", etc.
 */
export function parseGoogleMapsInput(input: string): ParsedGoogleMapsLocation {
  const trimmed = input.trim();

  if (!trimmed) {
    return {
      lat: 0,
      lng: 0,
      isValid: false,
      name: 'Location not selected',
      formattedCoordinates: 'None',
      sourceType: 'FALLBACK',
      googleMapsUrl: '',
      city: '',
      state: '',
      country: '',
      address: '',
      formattedAddress: '',
    };
  }

  // 1. Check for city keywords first if direct text input
  const lower = trimmed.toLowerCase();
  const citiesMap: Record<string, { lat: number; lng: number; city: string; state: string; name: string }> = {
    vadodara: { lat: 22.3072, lng: 73.1812, city: 'Vadodara', state: 'Gujarat', name: 'Vadodara, Gujarat' },
    baroda: { lat: 22.3072, lng: 73.1812, city: 'Vadodara', state: 'Gujarat', name: 'Vadodara, Gujarat' },
    bharuch: { lat: 21.7085, lng: 72.9860, city: 'Bharuch', state: 'Gujarat', name: 'Bharuch, Gujarat' },
    ahmedabad: { lat: 23.0225, lng: 72.5714, city: 'Ahmedabad', state: 'Gujarat', name: 'Ahmedabad, Gujarat' },
    surat: { lat: 21.1702, lng: 72.8311, city: 'Surat', state: 'Gujarat', name: 'Surat, Gujarat' },
    ankleshwar: { lat: 21.6264, lng: 73.0034, city: 'Ankleshwar', state: 'Gujarat', name: 'Ankleshwar, Gujarat' },
    gandhinagar: { lat: 23.2156, lng: 72.6369, city: 'Gandhinagar', state: 'Gujarat', name: 'Gandhinagar, Gujarat' },
    rajkot: { lat: 22.3039, lng: 70.8022, city: 'Rajkot', state: 'Gujarat', name: 'Rajkot, Gujarat' },
  };

  for (const [key, info] of Object.entries(citiesMap)) {
    if (lower === key || lower.startsWith(`${key},`) || lower.includes(`${key} city`) || lower.includes(`${key}, gujarat`)) {
      return {
        lat: info.lat,
        lng: info.lng,
        isValid: true,
        name: info.name,
        formattedCoordinates: `${info.lat.toFixed(5)}°N, ${info.lng.toFixed(5)}°E`,
        sourceType: 'CITY_MATCH',
        googleMapsUrl: generateGoogleMapsUrl(info.lat, info.lng),
        city: info.city,
        state: info.state,
        country: 'India',
        address: info.name,
        formattedAddress: `${info.name}, India`,
      };
    }
  }

  // 2. Check for @lat,lng in URL (standard Google Maps web url)
  const atMatch = trimmed.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (atMatch) {
    const lat = parseFloat(atMatch[1]);
    const lng = parseFloat(atMatch[2]);
    let placeName = 'Attached Google Maps Location';
    const placeMatch = trimmed.match(/\/place\/([^/@]+)/);
    if (placeMatch && placeMatch[1]) {
      placeName = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
    }
    const resolved = resolveCityFromCoordinates(lat, lng);

    return {
      lat,
      lng,
      isValid: true,
      name: placeName !== 'Attached Google Maps Location' ? `${placeName}, ${resolved.city}` : resolved.name,
      formattedCoordinates: `${lat.toFixed(5)}°N, ${lng.toFixed(5)}°E`,
      sourceType: 'URL_COORDINATE_PATH',
      googleMapsUrl: generateGoogleMapsUrl(lat, lng),
      city: resolved.city,
      state: resolved.state,
      country: 'India',
      address: placeName,
      formattedAddress: `${placeName}, ${resolved.name}`,
    };
  }

  // 3. Check for ?q=lat,lng or query=lat,lng or ll=lat,lng
  const qMatch = trimmed.match(/[?&](?:q|query|ll)=(-?\d+\.\d+)(?:,|%2C)(-?\d+\.\d+)/i);
  if (qMatch) {
    const lat = parseFloat(qMatch[1]);
    const lng = parseFloat(qMatch[2]);
    const resolved = resolveCityFromCoordinates(lat, lng);
    return {
      lat,
      lng,
      isValid: true,
      name: resolved.name,
      formattedCoordinates: `${lat.toFixed(5)}°N, ${lng.toFixed(5)}°E`,
      sourceType: 'URL_QUERY',
      googleMapsUrl: generateGoogleMapsUrl(lat, lng),
      city: resolved.city,
      state: resolved.state,
      country: 'India',
      address: resolved.name,
      formattedAddress: `${resolved.name}, India`,
    };
  }

  // 4. Check for direct coordinates "lat, lng" or "lat lng"
  const directCoordMatch = trimmed.match(/^(-?\d+\.\d+)[,\s]+(-?\d+\.\d+)$/);
  if (directCoordMatch) {
    const lat = parseFloat(directCoordMatch[1]);
    const lng = parseFloat(directCoordMatch[2]);
    const resolved = resolveCityFromCoordinates(lat, lng);
    return {
      lat,
      lng,
      isValid: true,
      name: resolved.name,
      formattedCoordinates: `${lat.toFixed(5)}°N, ${lng.toFixed(5)}°E`,
      sourceType: 'COORDINATE_TEXT',
      googleMapsUrl: generateGoogleMapsUrl(lat, lng),
      city: resolved.city,
      state: resolved.state,
      country: 'India',
      address: resolved.name,
      formattedAddress: `${resolved.name}, India`,
    };
  }

  // 5. Check for landmark match in presets
  const matchedLandmark = PRESET_GMAP_LANDMARKS.find((lm) =>
    lm.name.toLowerCase().includes(lower) ||
    lm.category.toLowerCase().includes(lower) ||
    lm.corridor.toLowerCase().includes(lower) ||
    lm.address.toLowerCase().includes(lower) ||
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
      city: matchedLandmark.city,
      state: matchedLandmark.state,
      country: 'India',
      address: matchedLandmark.address,
      formattedAddress: matchedLandmark.address,
    };
  }

  // 6. Check for URL with query text (e.g. maps.google.com/?q=Vadodara)
  if (trimmed.includes('q=') || trimmed.includes('/place/')) {
    for (const [key, info] of Object.entries(citiesMap)) {
      if (lower.includes(key)) {
        return {
          lat: info.lat,
          lng: info.lng,
          isValid: true,
          name: info.name,
          formattedCoordinates: `${info.lat.toFixed(5)}°N, ${info.lng.toFixed(5)}°E`,
          sourceType: 'URL_QUERY',
          googleMapsUrl: generateGoogleMapsUrl(info.lat, info.lng),
          city: info.city,
          state: info.state,
          country: 'India',
          address: info.name,
          formattedAddress: `${info.name}, India`,
        };
      }
    }
  }

  // If text doesn't match and coordinates are not found
  return {
    lat: 0,
    lng: 0,
    isValid: false,
    name: 'Location not selected',
    formattedCoordinates: 'None',
    sourceType: 'FALLBACK',
    googleMapsUrl: '',
    city: '',
    state: '',
    country: '',
    address: '',
    formattedAddress: '',
  };
}

/**
 * Route Generator Engine
 * Given a target Google Maps location, generates an optimized bus survey route
 * connecting local municipal depots, navigating through major transit corridors,
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

  // Create local waypoints centered strictly around the target coordinates
  const deltaLat = 0.008;
  const deltaLng = 0.006;

  // Local Depot Start (South-West of target)
  const depotStart = {
    name: `Local Municipal Transit Hub (${locationName.split(',')[0]} Sector)`,
    lat: targetLat - deltaLat,
    lng: targetLng - deltaLng,
    instruction: 'Depart local transit depot; initiate onboard edge AI survey cameras',
  };

  // Approach waypoint
  const approachNode = {
    name: `Transit Corridor Approach (Toward Survey Point)`,
    lat: targetLat - deltaLat * 0.45,
    lng: targetLng - deltaLng * 0.25,
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

  // Exit corridor
  const exitNode = {
    name: `Survey Loop Exit (North-East Arterial)`,
    lat: targetLat + deltaLat * 0.45,
    lng: targetLng + deltaLng * 0.35,
    instruction: 'Turn onto arterial bypass; continue continuous road health monitoring',
  };

  // Return Terminal
  const depotEnd = {
    name: `Municipal Fleet Maintenance Hub (${locationName.split(',')[0]} East)`,
    lat: targetLat + deltaLat * 0.8,
    lng: targetLng - deltaLng * 0.5,
    instruction: 'Complete inspection loop; upload final edge telemetry packet',
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
      const curveOffset = Math.sin(t * Math.PI) * 0.0008 * (i % 2 === 0 ? 1 : -1);
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
  const dwellMinutes = (60 + 180 + 120) / 60;
  const estimatedDurationMin = Math.round(driveMinutes + dwellMinutes);

  const cleanLocationShortName = locationName.length > 32 ? locationName.slice(0, 32) + '...' : locationName;
  const routeName = options?.routeName || `Route INSP (${cleanLocationShortName})`;

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
    lat: targetLat,
    lng: targetLng,
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
