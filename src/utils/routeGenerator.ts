import { GeneratedBusRoute, RouteWaypoint, BusFleet, DetailedLocation } from '../types';

export interface ParsedGoogleMapsLocation {
  lat: number;
  lng: number;
  isValid: boolean;
  name: string;
  formattedCoordinates: string;
  sourceType: 'URL_QUERY' | 'URL_COORDINATE_PATH' | 'COORDINATE_TEXT' | 'LANDMARK_MATCH' | 'CITY_MATCH' | 'MAP_CLICK' | 'REVERSE_GEOCODED' | 'GEOCODE_API' | 'LANDMARK_PRESET' | 'PLAIN_ADDRESS' | 'FALLBACK';
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
  if (lat === 0 && lng === 0) return '';
  return `https://www.google.com/maps?q=${lat.toFixed(6)},${lng.toFixed(6)}&z=16`;
}

/**
 * Helper to determine city & state by coordinate proximity for Indian regions
 * NEVER forces 'Gujarat' or fake cities onto unknown coordinates.
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
  if (lat >= 18.85 && lat <= 19.30 && lng >= 72.75 && lng <= 73.10) {
    return { city: 'Mumbai', state: 'Maharashtra', name: 'Mumbai, Maharashtra' };
  }
  if (lat >= 28.40 && lat <= 28.90 && lng >= 76.85 && lng <= 77.40) {
    return { city: 'New Delhi', state: 'Delhi', name: 'New Delhi, Delhi' };
  }

  // Exact coordinates without forcing artificial defaults
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  return { 
    city: '', 
    state: '', 
    name: `${Math.abs(lat).toFixed(6)}° ${latDir}, ${Math.abs(lng).toFixed(6)}° ${lngDir}` 
  };
}

/**
 * Robust Google Maps input parser:
 * Parses:
 * 1. Coordinates: "21.7160, 72.9920", "21.7160 72.9920", "21.7160° N, 72.9920° E"
 * 2. URL with ?q=lat,lng: https://maps.google.com/?q=21.7160,72.9920
 * 3. URL with @lat,lng,zoom: https://www.google.com/maps/@21.7085,72.9860,17z
 * 4. URL with /place/Name/@lat,lng or /place/lat,lng
 * 5. City names: "Vadodara", "Bharuch", "Ahmedabad", etc.
 * 6. Landmark names: "Alkapuri", "Kasak Circle", etc.
 * CRITICAL: (0, 0) is NEVER valid.
 */
export function parseGoogleMapsInput(input: string): ParsedGoogleMapsLocation {
  const trimmed = input.trim();

  const fallback: ParsedGoogleMapsLocation = {
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

  if (!trimmed) {
    return fallback;
  }

  const formatResult = (
    lat: number,
    lng: number,
    name: string,
    sourceType: ParsedGoogleMapsLocation['sourceType'],
    city = '',
    state = '',
    country = 'India',
    address = ''
  ): ParsedGoogleMapsLocation => {
    // 0,0 must NEVER be treated as a valid location!
    if ((lat === 0 && lng === 0) || isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return fallback;
    }
    const latDir = lat >= 0 ? 'N' : 'S';
    const lngDir = lng >= 0 ? 'E' : 'W';
    const formattedCoordinates = `${Math.abs(lat).toFixed(6)}° ${latDir}, ${Math.abs(lng).toFixed(6)}° ${lngDir}`;
    const cleanName = name || formattedCoordinates;

    const res: ParsedGoogleMapsLocation = {
      lat,
      lng,
      isValid: true,
      name: cleanName,
      formattedCoordinates,
      sourceType,
      googleMapsUrl: generateGoogleMapsUrl(lat, lng),
      city,
      state,
      country,
      address: address || cleanName,
      formattedAddress: address ? `${address}, ${cleanName}` : cleanName,
    };

    console.log(`[STAGE 1 - LOCATION PARSED] Lat: ${lat}, Lng: ${lng}, Name: "${res.name}", Source: ${sourceType}`);
    return res;
  };

  // 1. Check for coordinates with optional degree notation and directional indicators:
  // e.g. "21.7160° N, 72.9920° E", "21.7160N, 72.9920E", "21.7160, 72.9920", "-33.8688, 151.2093"
  const degreeCoordMatch = trimmed.match(
    /^([+-]?\d+(?:\.\d+)?)\s*°?\s*([NSns])?[,\s]+([+-]?\d+(?:\.\d+)?)\s*°?\s*([EWew])?$/
  );
  if (degreeCoordMatch) {
    let lat = parseFloat(degreeCoordMatch[1]);
    const latDir = (degreeCoordMatch[2] || '').toUpperCase();
    let lng = parseFloat(degreeCoordMatch[3]);
    const lngDir = (degreeCoordMatch[4] || '').toUpperCase();

    if (latDir === 'S') lat = -Math.abs(lat);
    if (latDir === 'N') lat = Math.abs(lat);
    if (lngDir === 'W') lng = -Math.abs(lng);
    if (lngDir === 'E') lng = Math.abs(lng);

    const resolved = resolveCityFromCoordinates(lat, lng);
    return formatResult(
      lat,
      lng,
      resolved.name,
      'COORDINATE_TEXT',
      resolved.city,
      resolved.state,
      resolved.state ? 'India' : ''
    );
  }

  // 2. Check for @lat,lng in URL (standard Google Maps web url e.g. /@21.7085,72.9860,17z)
  const atMatch = trimmed.match(/@([+-]?\d+\.\d+),([+-]?\d+\.\d+)/);
  if (atMatch) {
    const lat = parseFloat(atMatch[1]);
    const lng = parseFloat(atMatch[2]);
    let placeName = '';
    const placeMatch = trimmed.match(/\/place\/([^/@]+)/);
    if (placeMatch && placeMatch[1]) {
      placeName = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
    }
    const resolved = resolveCityFromCoordinates(lat, lng);
    const displayName = placeName ? `${placeName}${resolved.city ? `, ${resolved.city}` : ''}` : resolved.name;

    return formatResult(
      lat,
      lng,
      displayName,
      'URL_COORDINATE_PATH',
      resolved.city,
      resolved.state,
      resolved.state ? 'India' : '',
      placeName
    );
  }

  // 3. Check for query parameter coordinates: ?q=lat,lng or query=lat,lng or ll=lat,lng or center=lat,lng
  const qMatch = trimmed.match(/[?&](?:q|query|ll|center|destination|origin)=([+-]?\d+\.\d+)(?:,|%2C)([+-]?\d+\.\d+)/i);
  if (qMatch) {
    const lat = parseFloat(qMatch[1]);
    const lng = parseFloat(qMatch[2]);
    const resolved = resolveCityFromCoordinates(lat, lng);
    return formatResult(
      lat,
      lng,
      resolved.name,
      'URL_QUERY',
      resolved.city,
      resolved.state,
      resolved.state ? 'India' : ''
    );
  }

  // 4. Check for /place/lat,lng or /search/lat,lng in URL
  const placeCoordMatch = trimmed.match(/\/(?:place|search)\/([+-]?\d+\.\d+)(?:,|%2C)([+-]?\d+\.\d+)/i);
  if (placeCoordMatch) {
    const lat = parseFloat(placeCoordMatch[1]);
    const lng = parseFloat(placeCoordMatch[2]);
    const resolved = resolveCityFromCoordinates(lat, lng);
    return formatResult(
      lat,
      lng,
      resolved.name,
      'URL_COORDINATE_PATH',
      resolved.city,
      resolved.state,
      resolved.state ? 'India' : ''
    );
  }

  // 5. Check for coordinates anywhere within arbitrary string
  const anyCoordMatch = trimmed.match(/([+-]?\d{1,2}\.\d{3,8})[,\s]+([+-]?\d{1,3}\.\d{3,8})/);
  if (anyCoordMatch) {
    const lat = parseFloat(anyCoordMatch[1]);
    const lng = parseFloat(anyCoordMatch[2]);
    if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180 && (lat !== 0 || lng !== 0)) {
      const resolved = resolveCityFromCoordinates(lat, lng);
      return formatResult(
        lat,
        lng,
        resolved.name,
        'COORDINATE_TEXT',
        resolved.city,
        resolved.state,
        resolved.state ? 'India' : ''
      );
    }
  }

  // 6. Check for city keywords if direct text input
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
    mumbai: { lat: 19.0760, lng: 72.8777, city: 'Mumbai', state: 'Maharashtra', name: 'Mumbai, Maharashtra' },
    delhi: { lat: 28.6139, lng: 77.2090, city: 'New Delhi', state: 'Delhi', name: 'New Delhi, Delhi' },
  };

  for (const [key, info] of Object.entries(citiesMap)) {
    if (lower === key || lower.startsWith(`${key},`) || lower.includes(`${key} city`) || lower.includes(`${key},`)) {
      return formatResult(
        info.lat,
        info.lng,
        info.name,
        'CITY_MATCH',
        info.city,
        info.state,
        'India'
      );
    }
  }

  // 7. Check for landmark match in presets
  const matchedLandmark = PRESET_GMAP_LANDMARKS.find((lm) =>
    lm.name.toLowerCase().includes(lower) ||
    lm.category.toLowerCase().includes(lower) ||
    lm.corridor.toLowerCase().includes(lower) ||
    lm.address.toLowerCase().includes(lower) ||
    lm.id.toLowerCase().includes(lower)
  );

  if (matchedLandmark) {
    return formatResult(
      matchedLandmark.lat,
      matchedLandmark.lng,
      matchedLandmark.name,
      'LANDMARK_MATCH',
      matchedLandmark.city,
      matchedLandmark.state,
      'India',
      matchedLandmark.address
    );
  }

  // 8. Check for URL with query text (e.g. maps.google.com/?q=Vadodara)
  if (trimmed.includes('q=') || trimmed.includes('/place/')) {
    for (const [key, info] of Object.entries(citiesMap)) {
      if (lower.includes(key)) {
        return formatResult(
          info.lat,
          info.lng,
          info.name,
          'URL_QUERY',
          info.city,
          info.state,
          'India'
        );
      }
    }
  }

  // 9. Plain address / location name: Keep and display that exact user-entered location as source of truth!
  return {
    lat: 0,
    lng: 0,
    isValid: true,
    name: trimmed,
    formattedCoordinates: 'Plain Address (No GPS coordinates in text)',
    sourceType: 'PLAIN_ADDRESS',
    googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trimmed)}`,
    city: '',
    state: '',
    country: '',
    address: trimmed,
    formattedAddress: trimmed,
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
