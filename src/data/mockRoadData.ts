import { RoadIssue, BusFleet } from '../types';

// Realistic road evidence image generators (SVG data URLs with realistic road textures, defect visuals, and bus HUD watermarks)
export function generateEvidenceDataUrl(type: string, title: string, busId: string, timestamp: string): string {
  let defectSvgContent = '';

  if (type === 'pothole') {
    defectSvgContent = `
      <!-- Asphalt road surface -->
      <rect width="800" height="500" fill="#20242c" />
      <!-- Road markings -->
      <line x1="400" y1="0" x2="400" y2="500" stroke="#facc15" stroke-width="8" stroke-dasharray="30,25" />
      <line x1="80" y1="0" x2="80" y2="500" stroke="#ffffff" stroke-width="6" opacity="0.6" />
      <line x1="720" y1="0" x2="720" y2="500" stroke="#ffffff" stroke-width="6" opacity="0.6" />
      <!-- Asphalt texture grain -->
      <circle cx="280" cy="180" r="1.5" fill="#475569" /><circle cx="520" cy="340" r="1.5" fill="#475569" />
      <circle cx="340" cy="420" r="2" fill="#334155" /><circle cx="610" cy="120" r="1.8" fill="#334155" />
      <!-- Pothole crater -->
      <ellipse cx="430" cy="270" rx="140" ry="85" fill="#080b11" />
      <ellipse cx="435" cy="272" rx="125" ry="70" fill="#030712" />
      <path d="M305,270 Q320,230 380,210 T490,215 T560,265 T530,335 T410,345 Z" fill="#111827" opacity="0.9" />
      <!-- Cracks around pothole -->
      <path d="M305,260 L240,240 L210,255 M555,270 L630,285 L670,275 M440,345 L460,410 L495,430" stroke="#0f172a" stroke-width="4" stroke-linecap="round" fill="none" />
      <path d="M380,210 L350,150 L330,140" stroke="#0f172a" stroke-width="3" stroke-linecap="round" fill="none" />
      <!-- Water accumulation inside pothole -->
      <ellipse cx="445" cy="285" rx="75" ry="38" fill="#1e293b" opacity="0.75" />
    `;
  } else if (type === 'waterlogging') {
    defectSvgContent = `
      <rect width="800" height="500" fill="#1c2430" />
      <!-- Road dividing line underwater -->
      <line x1="400" y1="0" x2="400" y2="500" stroke="#eab308" stroke-width="7" stroke-dasharray="28,24" opacity="0.4" />
      <!-- Massive water ponding across lanes -->
      <path d="M120,120 Q320,80 520,110 T720,180 T760,420 T380,470 T90,390 Z" fill="#164e63" opacity="0.7" />
      <path d="M160,160 Q340,130 500,150 T680,220 T710,390 T360,430 T140,360 Z" fill="#0e7490" opacity="0.6" />
      <!-- Water ripples -->
      <ellipse cx="410" cy="260" rx="160" ry="45" fill="none" stroke="#67e8f9" stroke-width="1.8" opacity="0.6" />
      <ellipse cx="410" cy="260" rx="210" ry="60" fill="none" stroke="#22d3ee" stroke-width="1.2" opacity="0.4" />
      <ellipse cx="320" cy="340" rx="90" ry="25" fill="none" stroke="#67e8f9" stroke-width="1.5" opacity="0.5" />
      <!-- Submerged curb reflection -->
      <rect x="70" y="0" width="40" height="500" fill="#334155" opacity="0.7" />
    `;
  } else if (type === 'road_damage') {
    defectSvgContent = `
      <rect width="800" height="500" fill="#222630" />
      <line x1="400" y1="0" x2="400" y2="500" stroke="#facc15" stroke-width="8" stroke-dasharray="32,24" />
      <!-- Alligator cracking network -->
      <g stroke="#090d16" stroke-width="4" fill="none" stroke-linejoin="round">
        <path d="M220,140 L280,190 L340,170 L410,220 L370,290 L290,280 L230,220 Z" fill="#171e2c" />
        <path d="M340,170 L420,150 L480,200 L410,220 Z" fill="#151b28" />
        <path d="M280,190 L290,280 L210,320 L160,260 L230,220 Z" fill="#171e2c" />
        <path d="M370,290 L450,280 L480,360 L390,380 Z" fill="#141a27" />
        <path d="M290,280 L370,290 L390,380 L300,410 Z" fill="#19202f" />
        <path d="M480,200 L580,220 L570,300 L450,280 Z" fill="#182030" />
        <!-- Structural fissure line -->
        <path d="M120,90 Q260,180 370,290 T620,380" stroke="#000000" stroke-width="6" />
      </g>
    `;
  } else if (type === 'accident') {
    defectSvgContent = `
      <rect width="800" height="500" fill="#1e232d" />
      <line x1="400" y1="0" x2="400" y2="500" stroke="#facc15" stroke-width="7" stroke-dasharray="30,20" />
      <!-- Skid marks -->
      <path d="M360,480 C365,360 380,290 410,210" stroke="#090d16" stroke-width="14" stroke-linecap="round" fill="none" opacity="0.85" />
      <path d="M390,480 C395,360 410,290 440,210" stroke="#090d16" stroke-width="14" stroke-linecap="round" fill="none" opacity="0.85" />
      <!-- Damaged vehicle silhouette & bumper debris -->
      <rect x="370" y="160" width="160" height="110" rx="16" transform="rotate(-18 450 215)" fill="#dc2626" opacity="0.9" />
      <rect x="390" y="180" width="120" height="70" rx="8" transform="rotate(-18 450 215)" fill="#1f2937" />
      <!-- Broken glass / debris field -->
      <polygon points="320,280 335,270 330,290" fill="#cbd5e1" opacity="0.8" />
      <polygon points="350,260 360,255 355,272" fill="#cbd5e1" opacity="0.7" />
      <polygon points="410,310 430,305 425,325" fill="#ef4444" opacity="0.8" />
      <polygon points="300,320 315,315 310,335" fill="#facc15" opacity="0.7" />
    `;
  } else {
    // Road obstruction / construction
    defectSvgContent = `
      <rect width="800" height="500" fill="#20252e" />
      <line x1="400" y1="0" x2="400" y2="500" stroke="#facc15" stroke-width="8" stroke-dasharray="30,25" />
      <!-- Construction cones and barrier -->
      <g transform="translate(260, 200)">
        <polygon points="40,20 10,130 70,130" fill="#f97316" />
        <rect x="22" y="55" width="36" height="16" fill="#ffffff" />
        <rect x="16" y="90" width="48" height="16" fill="#ffffff" />
        <ellipse cx="40" cy="130" rx="36" ry="12" fill="#ea580c" />
      </g>
      <g transform="translate(420, 190)">
        <polygon points="40,20 10,130 70,130" fill="#f97316" />
        <rect x="22" y="55" width="36" height="16" fill="#ffffff" />
        <rect x="16" y="90" width="48" height="16" fill="#ffffff" />
        <ellipse cx="40" cy="130" rx="36" ry="12" fill="#ea580c" />
      </g>
      <!-- Heavy gravel mound on lane -->
      <ellipse cx="380" cy="330" rx="160" ry="70" fill="#78716c" />
      <ellipse cx="370" cy="325" rx="140" ry="55" fill="#a8a29e" opacity="0.6" />
    `;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
    ${defectSvgContent}
    <!-- Camera HUD Overlay -->
    <rect x="0" y="0" width="800" height="42" fill="rgba(6, 11, 21, 0.85)" />
    <rect x="0" y="465" width="800" height="35" fill="rgba(6, 11, 21, 0.85)" />
    <!-- Top HUD metadata -->
    <text x="24" y="27" fill="#00ff9d" font-family="monospace" font-size="14" font-weight="bold">● CAM_01 [FRONT_DASH] | 1080p@30fps</text>
    <text x="360" y="27" fill="#38bdf8" font-family="monospace" font-size="14">${busId} - AI PIPELINE ACTIVE</text>
    <text x="640" y="27" fill="#94a3b8" font-family="monospace" font-size="13">${timestamp}</text>
    <!-- Bottom HUD metadata -->
    <text x="24" y="488" fill="#e2e8f0" font-family="monospace" font-size="12">YOLOv8-ROADDAMAGE v2.6 | SENSOR_FUSION: IMU-Z ACTIVE</text>
    <text x="630" y="488" fill="#f59e0b" font-family="monospace" font-size="12">BHARUCH SMART FLEET</text>
    <!-- Crosshairs -->
    <line x1="390" y1="250" x2="410" y2="250" stroke="#00e5ff" stroke-width="1.5" opacity="0.6" />
    <line x1="400" y1="240" x2="400" y2="260" stroke="#00e5ff" stroke-width="1.5" opacity="0.6" />
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// Initial pre-seeded road defect issues in Bharuch city transit network
export const initialRoadIssues: RoadIssue[] = [
  {
    id: 'RV-0001',
    type: 'pothole',
    title: 'Severe Deep Pothole Cluster (8cm depth)',
    locationName: 'Station Road, Near Railway Overbridge Cross, Bharuch',
    lat: 21.7085,
    lng: 72.9860,
    severity: 'HIGH',
    priority: 'Critical',
    confidence: 94.6,
    busId: 'BUS-07',
    busRoute: 'Route 4B (Station - GIDC Industrial)',
    timestamp: '2026-09-16 09:42:15 IST',
    status: 'Pending',
    verification: 'Pending Verification',
    source: 'Uploaded Image / Video',
    evidenceImage: generateEvidenceDataUrl('pothole', 'Severe Pothole', 'BUS-07', '09:42:15 IST'),
    boundingBoxes: [
      {
        id: 'box-1',
        label: 'pothole_severe',
        confidence: 94.6,
        x: 38,
        y: 42,
        width: 36,
        height: 32,
        color: '#ef4444',
      }
    ],
    telemetry: {
      speedKmh: 42.4,
      zVibrationG: 2.84, // Heavy bump detected by bus accelerometer
      roadRoughnessIRI: 5.8,
      cameraFov: '120° Wide Angle Front Dashcam',
      weatherCondition: 'Clear / Dry',
    },
    estimatedDimensions: {
      lengthM: 1.2,
      widthM: 0.85,
      depthCm: 8.5,
      potholeVolumeL: 38.2,
      blockedLanes: 1,
    },
    roadCondition: 'Critical',
    priorityScore: 92,
    workflowHistory: [
      {
        stage: 'Detected',
        timestamp: '2026-09-16 09:42:15 IST',
        note: 'AI YOLOv8 model detected deep road cavity.'
      }
    ]
  },
  {
    id: 'RV-0002',
    type: 'waterlogging',
    title: 'Severe Water Ponding Across Dual Lanes',
    locationName: 'Kasak Circle to Civil Hospital Road, Bharuch',
    lat: 21.7010,
    lng: 72.9910,
    severity: 'HIGH',
    priority: 'High',
    confidence: 91.2,
    busId: 'BUS-12',
    busRoute: 'Route 9A (Zadeshwar - Kasak - Bholav)',
    timestamp: '2026-09-16 09:38:40 IST',
    status: 'In Progress',
    verification: 'Verified',
    source: 'Uploaded Image / Video',
    assignedAuthority: 'Municipal Drainage Division',
    assignedDept: 'Drainage & Stormwater Dept',
    assignedPerson: 'Storm Squad #2 (Suction Bowser)',
    assignedCrew: 'Storm Squad #2 (Suction Bowser)',
    workOrderId: 'WO-2026-0814',
    dueDate: '2026-09-17',
    dispatchedAt: '2026-09-16 09:45:00 IST',
    evidenceImage: generateEvidenceDataUrl('waterlogging', 'Severe Waterlogging', 'BUS-12', '09:38:40 IST'),
    boundingBoxes: [
      {
        id: 'box-2',
        label: 'waterlogging_submerged',
        confidence: 91.2,
        x: 18,
        y: 28,
        width: 68,
        height: 52,
        color: '#f59e0b',
      }
    ],
    telemetry: {
      speedKmh: 24.1,
      zVibrationG: 0.62,
      roadRoughnessIRI: 4.2,
      cameraFov: '120° Wide Angle Front Dashcam',
      weatherCondition: 'Monsoon Drizzle / Wet Asphalt',
    },
    estimatedDimensions: {
      lengthM: 28.0,
      widthM: 7.2,
      waterDepthCm: 18.0,
      blockedLanes: 2,
    },
    roadCondition: 'Hazardous',
    priorityScore: 89,
    authorityNotes: 'Verified via CCTV camera #41. Drainage line choked due to pre-monsoon silt accumulation. Diverting low-clearance vehicles.',
    workflowHistory: [
      {
        stage: 'Detected',
        timestamp: '2026-09-16 09:38:40 IST',
        note: 'AI YOLOv8 model detected waterlogging.'
      },
      {
        stage: 'Verified',
        timestamp: '2026-09-16 09:40:00 IST',
        author: 'Municipal Senior Inspector',
        note: 'Verified depth via CCTV.'
      },
      {
        stage: 'Assigned',
        timestamp: '2026-09-16 09:45:00 IST',
        note: 'Assigned to Municipal Drainage Division (Storm Squad #2).'
      },
      {
        stage: 'In Progress',
        timestamp: '2026-09-16 09:48:00 IST',
        note: 'Crew on site with suction bowser.'
      }
    ]
  },
  {
    id: 'RV-0003',
    type: 'road_damage',
    title: 'Extensive Alligator Fatigue Cracking & Asphalt Subsidence',
    locationName: 'GIDC Phase 1 Industrial Bypass, Km 3.8, Bharuch',
    lat: 21.7310,
    lng: 73.0020,
    severity: 'MEDIUM',
    priority: 'Medium',
    confidence: 88.5,
    busId: 'BUS-07',
    busRoute: 'Route 4B (Station - GIDC Industrial)',
    timestamp: '2026-09-16 09:21:04 IST',
    status: 'Pending',
    verification: 'Pending Verification',
    source: 'Uploaded Image / Video',
    evidenceImage: generateEvidenceDataUrl('road_damage', 'Alligator Cracks', 'BUS-07', '09:21:04 IST'),
    boundingBoxes: [
      {
        id: 'box-3',
        label: 'alligator_cracking',
        confidence: 88.5,
        x: 25,
        y: 35,
        width: 48,
        height: 44,
        color: '#f97316',
      }
    ],
    telemetry: {
      speedKmh: 48.0,
      zVibrationG: 1.45,
      roadRoughnessIRI: 4.9,
      cameraFov: '120° Wide Angle Front Dashcam',
      weatherCondition: 'Clear',
    },
    estimatedDimensions: {
      lengthM: 6.5,
      widthM: 3.1,
      depthCm: 3.2,
      blockedLanes: 1,
    },
    roadCondition: 'Poor',
    priorityScore: 68,
    workflowHistory: [
      {
        stage: 'Detected',
        timestamp: '2026-09-16 09:21:04 IST',
        note: 'AI YOLOv8 model detected surface fatigue cracking.'
      }
    ]
  },
  {
    id: 'RV-0004',
    type: 'accident',
    title: 'Vehicle Collision & Road Debris Blocking Left Lane',
    locationName: 'NH-48 Express Highway Junction, Km 182, Bharuch',
    lat: 21.7240,
    lng: 73.0180,
    severity: 'HIGH',
    priority: 'Critical',
    confidence: 96.1,
    busId: 'BUS-03',
    busRoute: 'Route 11 (Dahej Bypass Express Corridor)',
    timestamp: '2026-09-16 09:05:12 IST',
    status: 'In Progress',
    verification: 'Verified',
    source: 'Uploaded Image / Video',
    assignedAuthority: 'Traffic Police & Highway Rescue Squad',
    assignedDept: 'Traffic Police & Highway Rescue Squad',
    assignedPerson: 'Highway Quick Response Van #4 (Inspector Dave)',
    assignedCrew: 'Highway Quick Response Van #4',
    workOrderId: 'WO-2026-0809',
    dueDate: '2026-09-16',
    dispatchedAt: '2026-09-16 09:10:00 IST',
    roadClosureActive: true,
    detourRouteName: 'Service Road 2A Detour',
    evidenceImage: generateEvidenceDataUrl('accident', 'Vehicle Incident', 'BUS-03', '09:05:12 IST'),
    boundingBoxes: [
      {
        id: 'box-4',
        label: 'accident_debris',
        confidence: 96.1,
        x: 35,
        y: 28,
        width: 42,
        height: 48,
        color: '#ef4444',
      }
    ],
    telemetry: {
      speedKmh: 12.0,
      zVibrationG: 0.88,
      roadRoughnessIRI: 6.2,
      cameraFov: '120° Wide Angle Front Dashcam',
      weatherCondition: 'Clear',
    },
    estimatedDimensions: {
      blockedLanes: 2,
    },
    roadCondition: 'Critical',
    priorityScore: 98,
    authorityNotes: 'Tow truck deployed. Highway left lane cordoned off with emergency beacons.',
    workflowHistory: [
      {
        stage: 'Detected',
        timestamp: '2026-09-16 09:05:12 IST',
        note: 'AI YOLOv8 model detected highway obstruction.'
      },
      {
        stage: 'Verified',
        timestamp: '2026-09-16 09:08:00 IST',
        author: 'Highway Patrol Control',
        note: 'Immediate incident confirmed.'
      },
      {
        stage: 'Assigned',
        timestamp: '2026-09-16 09:10:00 IST',
        note: 'Assigned to Traffic Police & Highway Rescue Squad.'
      },
      {
        stage: 'In Progress',
        timestamp: '2026-09-16 09:15:00 IST',
        note: 'Response Van on site securing carriageway.'
      }
    ]
  },
  {
    id: 'RV-0005',
    type: 'pothole',
    title: 'Surface Pothole & Edge Breakaway (Repaired & Solved)',
    locationName: 'Zadeshwar Road, Near Narmada River Bund, Bharuch',
    lat: 21.6880,
    lng: 73.0150,
    severity: 'LOW',
    priority: 'Low',
    confidence: 92.4,
    busId: 'BUS-12',
    busRoute: 'Route 9A (Zadeshwar - Kasak - Bholav)',
    timestamp: '2026-09-16 07:15:30 IST',
    status: 'Solved',
    verification: 'Verified',
    source: 'Uploaded Image / Video',
    assignedAuthority: 'Road Maintenance Team',
    assignedDept: 'PWD Municipal Road Division',
    assignedPerson: 'Road Patch Crew Alpha (Lead S. Rao)',
    assignedCrew: 'Road Patch Crew Alpha',
    workOrderId: 'WO-2026-0792',
    dueDate: '2026-09-16',
    resolvedAt: '2026-09-16 08:45:00 IST',
    repairNotes: 'Pothole excavated to rectangular geometry, bitumen tack coat applied, filled with 45kg cold-mix asphalt, compacted with vibrating roller.',
    repairMaterials: '45kg Cold-Mix Bitumen, RS-1 Emulsion',
    repairCostEstimateInr: 3400,
    evidenceImage: generateEvidenceDataUrl('pothole', 'Resolved Pothole', 'BUS-12', '07:15:30 IST'),
    boundingBoxes: [
      {
        id: 'box-5',
        label: 'pothole_medium',
        confidence: 92.4,
        x: 40,
        y: 45,
        width: 25,
        height: 22,
        color: '#10b981',
      }
    ],
    telemetry: {
      speedKmh: 36.2,
      zVibrationG: 1.12,
      roadRoughnessIRI: 3.1,
      cameraFov: '120° Wide Angle Front Dashcam',
      weatherCondition: 'Clear',
    },
    roadCondition: 'Repaired',
    priorityScore: 40,
    workflowHistory: [
      {
        stage: 'Detected',
        timestamp: '2026-09-16 07:15:30 IST',
        note: 'AI YOLOv8 model detected surface hole.'
      },
      {
        stage: 'Verified',
        timestamp: '2026-09-16 07:30:00 IST',
        note: 'Verified by municipal supervisor.'
      },
      {
        stage: 'Assigned',
        timestamp: '2026-09-16 07:45:00 IST',
        note: 'Assigned to PWD Road Patch Crew Alpha.'
      },
      {
        stage: 'In Progress',
        timestamp: '2026-09-16 08:00:00 IST',
        note: 'Excavation and hot bitumen compaction commenced.'
      },
      {
        stage: 'Solved',
        timestamp: '2026-09-16 08:45:00 IST',
        author: 'PWD Municipal Road Division',
        note: 'Repairs completed and verified.'
      }
    ]
  },
  {
    id: 'RV-0006',
    type: 'construction',
    title: 'Underground Pipeline Trenching & Construction Hazard',
    locationName: 'Bholav Patel Nagar Circle, Sector 2, Bharuch',
    lat: 21.7160,
    lng: 72.9920,
    severity: 'MEDIUM',
    priority: 'Medium',
    confidence: 93.0,
    busId: 'BUS-19',
    busRoute: 'Route 2C (Terminal - Collectorate - Golden Bridge)',
    timestamp: '2026-09-16 08:50:22 IST',
    status: 'Pending',
    verification: 'Verified',
    source: 'Uploaded Image / Video',
    assignedAuthority: 'PWD Municipal Road Division',
    assignedDept: 'PWD Municipal Road Division',
    assignedPerson: 'Civil Works Inspector K. Trivedi',
    speedLimitKmh: 20,
    evidenceImage: generateEvidenceDataUrl('construction', 'Pipeline Trench', 'BUS-19', '08:50:22 IST'),
    boundingBoxes: [
      {
        id: 'box-6',
        label: 'construction_zone',
        confidence: 93.0,
        x: 30,
        y: 35,
        width: 50,
        height: 40,
        color: '#f59e0b',
      }
    ],
    telemetry: {
      speedKmh: 28.5,
      zVibrationG: 1.30,
      roadRoughnessIRI: 4.6,
      cameraFov: '120° Wide Angle Front Dashcam',
      weatherCondition: 'Clear',
    },
    roadCondition: 'Poor',
    priorityScore: 72,
    workflowHistory: [
      {
        stage: 'Detected',
        timestamp: '2026-09-16 08:50:22 IST',
        note: 'AI YOLOv8 model detected construction zone.'
      },
      {
        stage: 'Verified',
        timestamp: '2026-09-16 08:55:00 IST',
        note: 'Verified pipeline trench work.'
      }
    ]
  }
];

// Active Bus Fleets equipped with Edge Cameras & GPS
export const initialBusFleet: BusFleet[] = [
  {
    id: 'BUS-07',
    busNumber: 'GJ-16-Z-4412',
    routeId: 'RT-4B',
    routeName: 'Route 4B (Station - GIDC Industrial - NH48)',
    driverName: 'Ramesh Patel',
    speedKmh: 41,
    lat: 21.7130,
    lng: 72.9910,
    headingDeg: 45,
    routeCoordinates: [
      [21.7085, 72.9860], // Railway Station
      [21.7130, 72.9910], // Bholav turn
      [21.7180, 72.9970], // GIDC Entry
      [21.7260, 73.0080], // Industrial bypass
      [21.7310, 73.0020], // GIDC Phase 1
      [21.7240, 73.0180], // NH48 junction
      [21.7180, 72.9970],
      [21.7085, 72.9860],
    ],
    currentWaypointIndex: 1,
    direction: 1,
    cameraStatus: 'ACTIVE',
    aiInferenceFps: 28.4,
    edgeHardware: 'NVIDIA Jetson Orin Nano + Sony IMX390 1080p',
    detectionsCount: 14,
    lastDetectionTime: 'Just now (09:42 IST)',
  },
  {
    id: 'BUS-12',
    busNumber: 'GJ-16-Z-5589',
    routeId: 'RT-9A',
    routeName: 'Route 9A (Zadeshwar - Kasak - Bholav Loop)',
    driverName: 'Mohan Solanki',
    speedKmh: 34,
    lat: 21.6960,
    lng: 73.0040,
    headingDeg: 120,
    routeCoordinates: [
      [21.6880, 73.0150], // Zadeshwar Bund
      [21.6960, 73.0040], // Narmada approach
      [21.7010, 72.9910], // Kasak Circle
      [21.7080, 72.9900], // Civil Hospital
      [21.7160, 72.9920], // Bholav Patel Circle
      [21.7085, 72.9860], // Station link
      [21.6960, 73.0040],
      [21.6880, 73.0150],
    ],
    currentWaypointIndex: 1,
    direction: 1,
    cameraStatus: 'ACTIVE',
    aiInferenceFps: 29.1,
    edgeHardware: 'NVIDIA Jetson Orin Nano + IMU Sensor Fusion',
    detectionsCount: 19,
    lastDetectionTime: '4m ago (09:38 IST)',
  },
  {
    id: 'BUS-03',
    busNumber: 'GJ-16-Z-1102',
    routeId: 'RT-11',
    routeName: 'Route 11 (Dahej Bypass Express Corridor)',
    driverName: 'Sanjay Parmar',
    speedKmh: 52,
    lat: 21.7190,
    lng: 72.9800,
    headingDeg: 300,
    routeCoordinates: [
      [21.7110, 72.9640], // Dahej Bypass West
      [21.7150, 72.9730],
      [21.7190, 72.9800], // Middle connector
      [21.7240, 73.0180], // NH-48 link
      [21.7310, 73.0020],
      [21.7190, 72.9800],
      [21.7110, 72.9640],
    ],
    currentWaypointIndex: 2,
    direction: 1,
    cameraStatus: 'ACTIVE',
    aiInferenceFps: 30.0,
    edgeHardware: 'Hailo-8 AI Accelerator + Wide-angle 4K Sensor',
    detectionsCount: 8,
    lastDetectionTime: '37m ago (09:05 IST)',
  },
  {
    id: 'BUS-19',
    busNumber: 'GJ-16-Z-8831',
    routeId: 'RT-2C',
    routeName: 'Route 2C (Terminal - Collectorate - Golden Bridge)',
    driverName: 'Vikram Joshi',
    speedKmh: 28,
    lat: 21.6950,
    lng: 72.9810,
    headingDeg: 190,
    routeCoordinates: [
      [21.7085, 72.9860], // City Terminal
      [21.7030, 72.9840], // Collectorate
      [21.6950, 72.9810], // Golden Bridge approach
      [21.6920, 72.9780], // Heritage Bridge
      [21.6950, 72.9810],
      [21.7030, 72.9840],
      [21.7085, 72.9860],
    ],
    currentWaypointIndex: 2,
    direction: 1,
    cameraStatus: 'ACTIVE',
    aiInferenceFps: 27.8,
    edgeHardware: 'Raspberry Pi 5 + Google Coral TPU + IMX219',
    detectionsCount: 11,
    lastDetectionTime: '52m ago (08:50 IST)',
  },
];
