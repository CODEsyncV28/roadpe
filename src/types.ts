export type IssueType = 
  | 'pothole' 
  | 'waterlogging' 
  | 'road_damage' 
  | 'accident' 
  | 'traffic_anomaly' 
  | 'construction' 
  | 'road_closed';

export type Severity = 'HIGH' | 'MEDIUM' | 'LOW';

export type PriorityLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export type WorkflowStatus = 
  | 'Pending' 
  | 'In Progress' 
  | 'Solved' 
  | 'Rejected'
  | 'Closed'
  | 'PENDING' 
  | 'DISPATCHED' 
  | 'IN_PROGRESS' 
  | 'RESOLVED' 
  | 'REJECTED'
  | 'CLOSED';

export type VerificationStatus = 
  | 'Pending Verification' 
  | 'Verified' 
  | 'Rejected'
  | 'AI_DETECTED' 
  | 'VERIFIED' 
  | 'FALSE_POSITIVE' 
  | 'AUTHORITY_OVERRIDE'
  | 'Verified by Staff'
  | 'False Positive'
  | 'Authority Override';

export interface WorkflowHistoryEntry {
  stage: 'Detected' | 'Verified' | 'Rejected' | 'Assigned' | 'In Progress' | 'Solved' | 'False Positive' | 'Closed' | 'Override' | string;
  timestamp: string;
  author?: string;
  note?: string;
}

export interface BoundingBox {
  id: string;
  label: string;
  confidence: number;
  x: number; // percentage 0-100
  y: number;
  width: number;
  height: number;
  color: string;
}

export interface SourceMedia {
  fileName: string;
  fileType: 'video' | 'image';
  fileSizeMb?: number;
  videoTimestamp?: string; // e.g. "00:14"
  videoSecond?: number; // e.g. 14
  busIdTag: string; // e.g. "BUS-07"
  corridor: string;
  uploadTime: string;
  locationMappingMethod: 'PREDEFINED_TIMELINE_MAPPING' | 'EXIF_METADATA' | 'FLEET_CORRIDOR_REGISTRY' | 'GOOGLE_MAPS_ATTACHMENT';
}

export interface RouteWaypoint {
  name: string;
  lat: number;
  lng: number;
  isTargetLocation?: boolean;
  instruction?: string;
  dwellTimeSec?: number;
}

export interface GeneratedBusRoute {
  routeId: string;
  routeName: string;
  busId: string;
  busNumber: string;
  totalDistanceKm: number;
  estimatedDurationMin: number;
  targetLocationName: string;
  targetLat: number;
  targetLng: number;
  waypoints: RouteWaypoint[];
  routeCoordinates: [number, number][];
  generatedAt: string;
  description: string;
}

export interface DetailedLocation {
  latitude: number;
  longitude: number;
  city?: string;
  district?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  formattedAddress?: string;
  address?: string;
}

export interface RoadIssue {
  id: string;
  type: IssueType;
  title: string;
  locationName: string;
  lat: number;
  lng: number;
  location?: DetailedLocation;
  hasSelectedLocation?: boolean;
  severity: Severity;
  confidence: number;
  busId: string;
  busRoute: string;
  timestamp: string;
  status: WorkflowStatus;
  verification: VerificationStatus;
  evidenceImage: string;
  boundingBoxes: BoundingBox[];
  telemetry: {
    speedKmh: number;
    zVibrationG: number; // accelerometer bump
    roadRoughnessIRI: number; // International Roughness Index
    cameraFov: string;
    weatherCondition: string;
  };
  // Uploaded media & timeline tracking
  sourceMedia?: SourceMedia;
  videoTimestamp?: string; // e.g. "00:14 in uploaded clip"
  googleMapsUrl?: string;
  attachedLocationMethod?: 'GOOGLE_MAPS_LINK' | 'COORDINATES' | 'LANDMARK_SEARCH' | 'MAP_PIN' | 'TIMELINE_MAPPING';
  generatedBusRoute?: GeneratedBusRoute;
  estimatedDimensions?: {
    lengthM?: number;
    widthM?: number;
    depthCm?: number;
    potholeVolumeL?: number;
    waterDepthCm?: number;
    blockedLanes?: number;
  };
  roadCondition: 'Poor' | 'Hazardous' | 'Moderate' | 'Critical' | 'Repaired';
  // Problem Workflow & Assignment Details
  source?: string;
  assignedAuthority?: string;
  assignedPerson?: string;
  priority?: PriorityLevel;
  dueDate?: string;
  notes?: string;
  workflowHistory?: WorkflowHistoryEntry[];
  // Original AI Preservation (Never overwritten)
  originalAI?: {
    type: IssueType;
    confidence: number;
    severity: Severity;
    locationName: string;
    lat: number;
    lng: number;
    timestamp: string;
    evidenceImage?: string;
  };
  // Authority Override Audit Record
  authorityOverride?: {
    originalType: IssueType;
    newType: IssueType;
    originalSeverity: Severity;
    newSeverity: Severity;
    authority: string;
    reason: string;
    timestamp: string;
    roadClosureActive?: boolean;
    speedLimitKmh?: number;
  };
  // Verification and False Positive Audit Data
  verificationNotes?: string;
  falsePositiveReason?: string;
  // Authority Layer
  authorityNotes?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  roadClosureActive?: boolean;
  detourRouteName?: string;
  speedLimitKmh?: number;
  // Maintenance Layer
  assignedDept?: string;
  assignedCrew?: string;
  workOrderId?: string;
  priorityScore?: number; // 1-100 computed dispatch score
  dispatchedAt?: string;
  resolvedAt?: string;
  repairNotes?: string;
  repairMaterials?: string;
  afterRepairImage?: string;
  repairCostEstimateInr?: number;
}

export interface BusFleet {
  id: string;
  busNumber: string;
  routeId: string;
  routeName: string;
  driverName: string;
  speedKmh: number;
  lat: number;
  lng: number;
  headingDeg: number;
  routeCoordinates: [number, number][];
  currentWaypointIndex: number;
  direction: 1 | -1;
  cameraStatus: 'ACTIVE' | 'CALIBRATING' | 'OFFLINE';
  aiInferenceFps: number;
  edgeHardware: string;
  detectionsCount: number;
  lastDetectionTime: string;
  liveFeedUrl?: string;
  isGeneratedRoute?: boolean;
  targetHazardId?: string;
  targetLocationName?: string;
}

export type ActiveWorkflowStage = 
  | 'AI_DETECTION' 
  | 'AUTHORITY_VERIFICATION' 
  | 'ASSIGN_TRACKING';

export type ActiveLayer = 
  | 'AI_LAYER' 
  | 'AUTHORITY_LAYER' 
  | 'MAINTENANCE_LAYER'
  | 'AI_DETECTION' 
  | 'AUTHORITY_VERIFICATION' 
  | 'ASSIGN_TRACKING';

export type MapViewMode = 'DEFAULT' | 'SATELLITE' | 'HEATMAP';
