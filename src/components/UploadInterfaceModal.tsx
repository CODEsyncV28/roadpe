import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  Video, 
  Image as ImageIcon, 
  Sparkles, 
  MapPin, 
  Bus, 
  AlertTriangle, 
  Clock, 
  Cpu, 
  CheckCircle2, 
  ArrowRight,
  Sliders,
  FileVideo,
  Play,
  Layers,
  Database,
  Info,
  ExternalLink,
  Navigation,
  Compass,
  Route,
  Check
} from 'lucide-react';
import { RoadIssue, IssueType, Severity, BusFleet, GeneratedBusRoute } from '../types';
import { generateEvidenceDataUrl } from '../data/mockRoadData';
import { 
  parseGoogleMapsInput, 
  generateBusRouteForLocation, 
  generateGoogleMapsUrl, 
  PRESET_GMAP_LANDMARKS,
  ParsedGoogleMapsLocation
} from '../utils/routeGenerator';

interface UploadInterfaceModalProps {
  busFleet: BusFleet[];
  onClose: () => void;
  onIngestDetections: (newIssues: RoadIssue[], generatedRouteBus?: BusFleet) => void;
}

// Predefined GPS Coordinate Timeline Mapping Registry for Bharuch Transit Network
// Maps timestamps in pre-recorded video footage to exact coordinates
interface TimelineGpsMapping {
  timestampStart: string;
  timestampEnd: string;
  secondMark: number;
  locationName: string;
  lat: number;
  lng: number;
  corridor: string;
  defaultDefect: {
    type: IssueType;
    title: string;
    severity: Severity;
    confidence: number;
    depthCm?: number;
    zBumpG: number;
  };
}

const BHARUCH_TIMELINE_MAPPINGS: TimelineGpsMapping[] = [
  {
    timestampStart: '00:10',
    timestampEnd: '00:18',
    secondMark: 14,
    locationName: 'Station Road Overbridge Cross, Bharuch',
    lat: 21.7085,
    lng: 72.9860,
    corridor: 'Route 4B (Station - GIDC Industrial)',
    defaultDefect: {
      type: 'pothole',
      title: 'Deep Surface Cavity Cluster (8.2cm depth)',
      severity: 'HIGH',
      confidence: 94.8,
      depthCm: 8.2,
      zBumpG: 2.65,
    },
  },
  {
    timestampStart: '00:22',
    timestampEnd: '00:30',
    secondMark: 26,
    locationName: 'Kasak Circle North Avenue, Bharuch',
    lat: 21.7025,
    lng: 72.9930,
    corridor: 'Route 9A (Zadeshwar - Narmada Corridor)',
    defaultDefect: {
      type: 'road_damage',
      title: 'Severe Transverse Asphalt Fatigue Cracking',
      severity: 'MEDIUM',
      confidence: 91.2,
      zBumpG: 1.45,
    },
  },
  {
    timestampStart: '00:35',
    timestampEnd: '00:44',
    secondMark: 38,
    locationName: 'GIDC Industrial Bypass Km 4.2, Bharuch',
    lat: 21.7280,
    lng: 73.0060,
    corridor: 'Route 4B (Station - GIDC Industrial)',
    defaultDefect: {
      type: 'waterlogging',
      title: 'Extensive Road Waterlogging & Lane Submergence',
      severity: 'HIGH',
      confidence: 93.4,
      zBumpG: 0.95,
    },
  },
  {
    timestampStart: '00:48',
    timestampEnd: '00:58',
    secondMark: 52,
    locationName: 'NH-48 Corridor Near Bholav Turn, Bharuch',
    lat: 21.7210,
    lng: 73.0150,
    corridor: 'Route 11 (Bholav Express Corridor)',
    defaultDefect: {
      type: 'accident',
      title: 'Vehicle Collision & Carriageway Debris Field',
      severity: 'HIGH',
      confidence: 96.1,
      zBumpG: 1.80,
    },
  },
];

// Pre-recorded demo fleet footage options (for immediate 1-click evaluation)
interface SampleFootage {
  id: string;
  name: string;
  type: 'video' | 'image';
  duration: string;
  size: string;
  busId: string;
  corridor: string;
  detectedEventsCount: number;
  description: string;
  mappedTimelineIndices: number[]; // indices into BHARUCH_TIMELINE_MAPPINGS
}

const SAMPLE_FOOTAGE_PRESETS: SampleFootage[] = [
  {
    id: 'sample-1',
    name: 'route4b_dashcam_survey_station_to_gidc.mp4',
    type: 'video',
    duration: '00:48 (1080p @ 30FPS)',
    size: '42.8 MB',
    busId: 'BUS-07',
    corridor: 'Route 4B (Station - GIDC Industrial)',
    detectedEventsCount: 2,
    description: 'Front dashcam recording from BUS-07 passing Station Road Overbridge & GIDC bypass.',
    mappedTimelineIndices: [0, 2], // 00:14 Pothole + 00:38 Waterlogging
  },
  {
    id: 'sample-2',
    name: 'route9a_kasak_monsoon_inspection.mp4',
    type: 'video',
    duration: '00:34 (1080p @ 30FPS)',
    size: '31.2 MB',
    busId: 'BUS-12',
    corridor: 'Route 9A (Zadeshwar - Narmada Corridor)',
    detectedEventsCount: 1,
    description: 'Inspection footage from BUS-12 across Kasak Circle documenting road surface cracking.',
    mappedTimelineIndices: [1], // 00:26 Cracks
  },
  {
    id: 'sample-3',
    name: 'nh48_bholav_express_dashcam.mp4',
    type: 'video',
    duration: '01:05 (1080p @ 30FPS)',
    size: '58.4 MB',
    busId: 'BUS-19',
    corridor: 'Route 11 (Bholav Express Corridor)',
    detectedEventsCount: 1,
    description: 'Highway bypass recording tagging unexpected vehicle incident debris.',
    mappedTimelineIndices: [3], // 00:52 Accident
  },
  {
    id: 'sample-4',
    name: 'road_inspection_frame_pothole_409.jpg',
    type: 'image',
    duration: 'Single Frame Still',
    size: '4.2 MB',
    busId: 'BUS-03',
    corridor: 'Route 2C (Old City - Golden Bridge)',
    detectedEventsCount: 1,
    description: 'High-res municipal still photo captured by onboard survey unit.',
    mappedTimelineIndices: [0],
  },
];

export const UploadInterfaceModal: React.FC<UploadInterfaceModalProps> = ({
  busFleet,
  onClose,
  onIngestDetections,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activeSample, setActiveSample] = useState<SampleFootage | null>(null);
  const [customBusId, setCustomBusId] = useState<string>('BUS-07');
  const [selectedCorridor, setSelectedCorridor] = useState<string>('Route 4B (Station - GIDC Industrial)');
  const [previewMediaUrl, setPreviewMediaUrl] = useState<string | null>(null);
  const [fileInputType, setFileInputType] = useState<'video' | 'image'>('image');

  // YOLO Pipeline unique tracking
  const [uploadId, setUploadId] = useState<string>('');
  const [processedResultImageUrl, setProcessedResultImageUrl] = useState<string | null>(null);
  const [processingError, setProcessingError] = useState<string | null>(null);

  // Google Maps Location Attachment State
  const [googleMapsInput, setGoogleMapsInput] = useState<string>('');
  const [attachedGMapLocation, setAttachedGMapLocation] = useState<ParsedGoogleMapsLocation>(() =>
    parseGoogleMapsInput('')
  );
  const [isLocationAttached, setIsLocationAttached] = useState<boolean>(false);

  // Generated Bus Route State
  const [generatedRouteData, setGeneratedRouteData] = useState<{
    route: GeneratedBusRoute;
    bus: BusFleet;
  } | null>(null);
  const [isGeneratingRoute, setIsGeneratingRoute] = useState<boolean>(false);
  const [autoDeployRoute, setAutoDeployRoute] = useState<boolean>(true);
  const [routeSuccessToast, setRouteSuccessToast] = useState<string>('');

  // AI Pipeline State
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState<string>('');
  const [processingPercent, setProcessingPercent] = useState<number>(0);
  const [processedDetections, setProcessedDetections] = useState<RoadIssue[] | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Parse Google Maps Location handler
  const handleParseLocation = async (customVal?: string) => {
    const valToParse = customVal !== undefined ? customVal : googleMapsInput;
    if (!valToParse.trim()) {
      const empty = parseGoogleMapsInput('');
      setAttachedGMapLocation(empty);
      setIsLocationAttached(false);
      return;
    }

    let parsed = parseGoogleMapsInput(valToParse);

    // If text query, try calling backend geocode endpoint for rich address metadata
    if ((!parsed.isValid || parsed.sourceType === 'CITY_MATCH') && valToParse.trim().length >= 2) {
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(valToParse.trim())}`);
        if (res.ok) {
          const geo = await res.json();
          if (geo && geo.success && geo.location) {
            parsed = {
              lat: geo.location.latitude,
              lng: geo.location.longitude,
              isValid: true,
              name: geo.location.address || geo.location.formattedAddress || valToParse,
              formattedCoordinates: `${geo.location.latitude.toFixed(5)}°N, ${geo.location.longitude.toFixed(5)}°E`,
              sourceType: 'GEOCODE_API',
              googleMapsUrl: `https://www.google.com/maps?q=${geo.location.latitude.toFixed(6)},${geo.location.longitude.toFixed(6)}`,
              city: geo.location.city,
              state: geo.location.state,
              country: geo.location.country || 'India',
              address: geo.location.address,
              formattedAddress: geo.location.formattedAddress,
            };
          }
        }
      } catch (e) {
        console.warn('Geocoding API note:', e);
      }
    }

    setAttachedGMapLocation(parsed);
    setIsLocationAttached(parsed.isValid);

    // If route was already generated, automatically update route for new point
    if (generatedRouteData && parsed.isValid) {
      const regenerated = generateBusRouteForLocation(parsed.lat, parsed.lng, parsed.name);
      setGeneratedRouteData(regenerated);
    }
  };

  // Preset Landmark selector handler
  const handleSelectLandmark = (landmark: typeof PRESET_GMAP_LANDMARKS[0]) => {
    const gUrl = `https://maps.google.com/?q=${landmark.lat},${landmark.lng}`;
    setGoogleMapsInput(gUrl);
    const parsed: ParsedGoogleMapsLocation = {
      lat: landmark.lat,
      lng: landmark.lng,
      isValid: true,
      name: landmark.name,
      formattedCoordinates: `${landmark.lat.toFixed(5)}°N, ${landmark.lng.toFixed(5)}°E`,
      sourceType: 'LANDMARK_PRESET',
      googleMapsUrl: gUrl,
      city: landmark.city,
      state: landmark.state,
      country: 'India',
      address: landmark.address,
      formattedAddress: `${landmark.name}, ${landmark.address}`,
    };
    setAttachedGMapLocation(parsed);
    setIsLocationAttached(true);

    if (generatedRouteData) {
      const regenerated = generateBusRouteForLocation(parsed.lat, parsed.lng, parsed.name);
      setGeneratedRouteData(regenerated);
    }
  };

  // Generate Bus Route handler
  const handleGenerateRoute = () => {
    setIsGeneratingRoute(true);
    setTimeout(() => {
      const generated = generateBusRouteForLocation(
        attachedGMapLocation.lat,
        attachedGMapLocation.lng,
        attachedGMapLocation.name,
        {
          busId: 'BUS-05',
          busNumber: 'GJ-16-Z-9905',
        }
      );
      setGeneratedRouteData(generated);
      setIsGeneratingRoute(false);
      setRouteSuccessToast(`Survey Route Generated: ${generated.route.totalDistanceKm} km across ${generated.route.waypoints.length} waypoints.`);
      setTimeout(() => setRouteSuccessToast(''), 4500);
    }, 500);
  };

  // Handle local file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset stale state completely
    setProcessedDetections(null);
    setProcessedResultImageUrl(null);
    setProcessingError(null);
    setActiveSample(null);

    const newUploadId = `upload_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    setUploadId(newUploadId);
    setSelectedFile(file);

    // Required Debug Logging 1: Uploaded filename/ID
    console.log('[Frontend Upload] 1. Uploaded filename/ID:', file.name, `(${newUploadId})`);

    const isVid = file.type.startsWith('video') || file.name.endsWith('.mp4') || file.name.endsWith('.mov');
    setFileInputType(isVid ? 'video' : 'image');

    const objUrl = URL.createObjectURL(file);
    setPreviewMediaUrl(objUrl);
  };

  // Handle preset sample pick
  const handleSelectSample = (sample: SampleFootage) => {
    setActiveSample(sample);
    setSelectedFile(null);
    setProcessedDetections(null);
    setProcessedResultImageUrl(null);
    setProcessingError(null);
    setFileInputType(sample.type);
    setCustomBusId(sample.busId);
    setSelectedCorridor(sample.corridor);
    setPreviewMediaUrl(null);
  };

  // Run AI Detection Pipeline
  const handleRunDetection = async () => {
    if (!selectedFile && !activeSample) {
      setProcessingError('Please select or upload a road survey image/footage first.');
      return;
    }

    setIsProcessing(true);
    setProcessingError(null);
    setProcessedDetections(null);
    setProcessedResultImageUrl(null);
    setProcessingPercent(15);
    setProcessingStage('Ingesting media into edge decode buffer...');

    if (selectedFile) {
      const activeUploadId = uploadId || `upload_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      try {
        console.log('[Frontend Upload] Starting YOLO detection for uploaded file:', selectedFile.name, `[ID: ${activeUploadId}]`);
        setProcessingPercent(35);
        setProcessingStage('Transmitting exact uploaded file to YOLOv8 inference service...');

        const formData = new FormData();
        formData.append('image', selectedFile);
        formData.append('uploadId', activeUploadId);

        // LOCATION SYNCHRONIZATION: Transmit selected location fields to backend
        if (isLocationAttached && attachedGMapLocation.isValid) {
          formData.append('locationSelected', 'true');
          formData.append('lat', String(attachedGMapLocation.lat));
          formData.append('lng', String(attachedGMapLocation.lng));
          formData.append('locationName', attachedGMapLocation.name);
          if (attachedGMapLocation.city) formData.append('city', attachedGMapLocation.city);
          if (attachedGMapLocation.state) formData.append('state', attachedGMapLocation.state);
          if (attachedGMapLocation.country) formData.append('country', attachedGMapLocation.country || 'India');
          if (attachedGMapLocation.address) formData.append('address', attachedGMapLocation.address);
          if (attachedGMapLocation.googleMapsUrl) formData.append('googleMapsUrl', attachedGMapLocation.googleMapsUrl);
        } else {
          formData.append('locationSelected', 'false');
          formData.append('lat', '0');
          formData.append('lng', '0');
          formData.append('locationName', 'Location not selected');
        }

        console.log('[Frontend Upload] Calling POST /api/detect-hazard...');
        setProcessingPercent(60);
        setProcessingStage('Running YOLOv8 road hazard model & computing bounding boxes...');

        const response = await fetch('/api/detect-hazard', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => null);
          const errorMsg = errData?.error || `Server responded with status ${response.status} (${response.statusText})`;
          console.error('[Frontend Upload Error] YOLO inference failed:', errorMsg);
          setIsProcessing(false);
          setProcessingError(`YOLO Model Execution Error: ${errorMsg}`);
          return;
        }

        const data = await response.json();
        
        // Required Debug Logging 7 & 8: Backend response & Frontend result-image URL
        console.log('[Frontend Upload] 7. Backend response:', data);
        console.log('[Frontend Upload] 8. Frontend result-image URL:', data.result_image);

        if (!data.success || !data.result_image) {
          const errorMsg = data.error || 'Server did not return a valid result image.';
          console.error('[Frontend Upload Error] Invalid response payload:', data);
          setIsProcessing(false);
          setProcessingError(errorMsg);
          return;
        }

        const hasLocation = Boolean(data.hasSelectedLocation || (isLocationAttached && attachedGMapLocation.isValid));
        const resolvedLocName = hasLocation
          ? (data.locationName || attachedGMapLocation.name)
          : 'Location not selected';
        const resolvedLat = hasLocation
          ? (data.location?.latitude ?? attachedGMapLocation.lat)
          : 0;
        const resolvedLng = hasLocation
          ? (data.location?.longitude ?? attachedGMapLocation.lng)
          : 0;
        const resolvedCity = hasLocation
          ? (data.location?.city || attachedGMapLocation.city || (resolvedLocName.includes('Vadodara') ? 'Vadodara' : ''))
          : '';

        setProcessingPercent(85);
        setProcessingStage(hasLocation ? `Mapping detection metadata to ${resolvedCity || resolvedLocName}...` : 'Formatting detection metadata...');

        const nowStr = new Date().toLocaleTimeString('en-IN', { hour12: false }) + ' IST';
        const todayDate = new Date().toISOString().split('T')[0];

        // Map backend detections into RoadIssue structure
        let newIssues: RoadIssue[] = (data.detections || []).map((det: any, idx: number) => {
          const backendProblem = data.problems && data.problems[idx];
          const newId = backendProblem?.id || det.id || `DET-${Math.floor(9300 + Math.random() * 600)}`;
          const timestampStr = `${todayDate} ${nowStr}`;

          const issueLat = hasLocation ? resolvedLat + (idx > 0 ? idx * 0.0006 : 0) : 0;
          const issueLng = hasLocation ? resolvedLng + (idx > 0 ? idx * 0.0005 : 0) : 0;

          const assignedCorridor = generatedRouteData
            ? generatedRouteData.route.routeName
            : (resolvedCity ? `${resolvedCity} Transit Survey Corridor` : (hasLocation ? `${resolvedLocName} Corridor` : selectedCorridor));

          return {
            id: newId,
            type: (det.class as IssueType) || 'pothole',
            title: det.title || (backendProblem?.title) || `Detected ${String(det.class).toUpperCase()} on Roadway`,
            locationName: resolvedLocName,
            lat: issueLat,
            lng: issueLng,
            hasSelectedLocation: hasLocation,
            location: hasLocation ? {
              latitude: issueLat,
              longitude: issueLng,
              city: resolvedCity,
              state: attachedGMapLocation.state || 'Gujarat',
              country: 'India',
              address: resolvedLocName,
              formattedAddress: attachedGMapLocation.formattedAddress || resolvedLocName,
            } : undefined,
            googleMapsUrl: hasLocation ? (attachedGMapLocation.googleMapsUrl || `https://www.google.com/maps?q=${issueLat.toFixed(6)},${issueLng.toFixed(6)}`) : undefined,
            attachedLocationMethod: hasLocation
              ? (attachedGMapLocation.sourceType === 'URL_QUERY' || attachedGMapLocation.sourceType === 'URL_COORDINATE_PATH'
                ? 'GOOGLE_MAPS_LINK'
                : 'COORDINATES')
              : undefined,
            generatedBusRoute: generatedRouteData ? generatedRouteData.route : undefined,
            severity: det.severity || 'HIGH',
            confidence: det.confidence || 94.0,
            busId: generatedRouteData ? generatedRouteData.bus.id : (customBusId || 'BUS-07'),
            busRoute: assignedCorridor,
            timestamp: timestampStr,
            videoTimestamp: 'Uploaded Frame',
            sourceMedia: {
              fileName: selectedFile.name,
              fileType: fileInputType,
              busIdTag: customBusId || (generatedRouteData ? generatedRouteData.bus.id : 'BUS-07'),
              corridor: assignedCorridor,
              uploadTime: timestampStr,
              locationMappingMethod: hasLocation ? 'GOOGLE_MAPS_ATTACHMENT' : 'LOCATION_NOT_SELECTED',
            },
            status: 'Pending',
            verification: 'Pending Verification',
            evidenceImage: data.result_image, // Exact annotated output image returned by backend!
            boundingBoxes: [
              {
                id: `box-${Date.now()}-${idx}`,
                label: `${det.class}_detected`,
                confidence: det.confidence,
                x: det.box?.xPct || 30,
                y: det.box?.yPct || 45,
                width: det.box?.widthPct || 35,
                height: det.box?.heightPct || 25,
                color: det.severity === 'HIGH' ? '#ef4444' : '#f59e0b',
              },
            ],
            telemetry: {
              speedKmh: 35,
              zVibrationG: det.zBumpG || 2.45,
              roadRoughnessIRI: 5.2,
              cameraFov: 'Uploaded Survey Footage',
              weatherCondition: 'Standard Lighting',
            },
            estimatedDimensions: {
              depthCm: det.depthCm || (det.class === 'pothole' ? 7.6 : undefined),
              lengthM: 2.1,
              widthM: 1.4,
              blockedLanes: det.severity === 'HIGH' ? 2 : 1,
            },
            roadCondition: det.severity === 'HIGH' ? 'Critical' : 'Poor',
            priorityScore: Math.floor(82 + Math.random() * 14),
          };
        });

        setProcessingPercent(100);
        setProcessingStage('YOLOv8 Detection Complete! Annotated result ready.');
        setProcessedResultImageUrl(data.result_image);
        setProcessedDetections(newIssues);
        setIsProcessing(false);
      } catch (networkErr: any) {
        console.error('[Frontend Upload Network Error]:', networkErr);
        setIsProcessing(false);
        setProcessingError(`Network connection to YOLO inference backend failed: ${networkErr.message || networkErr}`);
      }
    } else if (activeSample) {
      // Demo preset sample path
      setTimeout(() => {
        setProcessingPercent(50);
        setProcessingStage('Analyzing preset dashcam stream...');
      }, 700);

      setTimeout(() => {
        const nowStr = new Date().toLocaleTimeString('en-IN', { hour12: false }) + ' IST';
        const todayDate = new Date().toISOString().split('T')[0];

        let newIssues: RoadIssue[] = activeSample.mappedTimelineIndices.map((idx, i) => {
          const mapping = BHARUCH_TIMELINE_MAPPINGS[idx];
          const newId = `DET-${Math.floor(9100 + Math.random() * 800)}`;
          const timestampStr = `${todayDate} ${nowStr}`;

          return {
            id: newId,
            type: mapping.defaultDefect.type,
            title: mapping.defaultDefect.title,
            locationName: mapping.locationName,
            lat: mapping.lat + (Math.random() - 0.5) * 0.001,
            lng: mapping.lng + (Math.random() - 0.5) * 0.001,
            severity: mapping.defaultDefect.severity,
            confidence: mapping.defaultDefect.confidence,
            busId: customBusId || activeSample.busId,
            busRoute: selectedCorridor || activeSample.corridor,
            timestamp: timestampStr,
            videoTimestamp: `at ${mapping.timestampStart} in ${activeSample.name}`,
            sourceMedia: {
              fileName: activeSample.name,
              fileType: activeSample.type,
              videoTimestamp: mapping.timestampStart,
              videoSecond: mapping.secondMark,
              busIdTag: customBusId || activeSample.busId,
              corridor: selectedCorridor || activeSample.corridor,
              uploadTime: timestampStr,
              locationMappingMethod: 'PREDEFINED_TIMELINE_MAPPING',
            },
            status: 'PENDING',
            verification: 'AI_DETECTED',
            evidenceImage: generateEvidenceDataUrl(
              mapping.defaultDefect.type,
              mapping.defaultDefect.title,
              customBusId || activeSample.busId,
              mapping.timestampStart
            ),
            boundingBoxes: [
              {
                id: `box-up-${Date.now()}-${i}`,
                label: `${mapping.defaultDefect.type}_detected`,
                confidence: mapping.defaultDefect.confidence,
                x: 32 + (i * 10),
                y: 35 + (i * 8),
                width: 38,
                height: 32,
                color: mapping.defaultDefect.severity === 'HIGH' ? '#ef4444' : '#f59e0b',
              }
            ],
            telemetry: {
              speedKmh: Math.floor(32 + Math.random() * 15),
              zVibrationG: mapping.defaultDefect.zBumpG,
              roadRoughnessIRI: 5.5,
              cameraFov: '120° Wide Angle Dashcam (Recorded)',
              weatherCondition: 'Dry / Daytime Survey',
            },
            estimatedDimensions: {
              depthCm: mapping.defaultDefect.depthCm,
              lengthM: 2.2,
              widthM: 1.5,
              blockedLanes: mapping.defaultDefect.severity === 'HIGH' ? 2 : 1,
            },
            roadCondition: mapping.defaultDefect.severity === 'HIGH' ? 'Critical' : 'Hazardous',
            priorityScore: Math.floor(82 + Math.random() * 14),
          };
        });

        if (isLocationAttached && attachedGMapLocation.isValid) {
          newIssues = newIssues.map((issue, idx) => {
            const issueLat = attachedGMapLocation.lat + (idx > 0 ? idx * 0.0006 : 0);
            const issueLng = attachedGMapLocation.lng + (idx > 0 ? idx * 0.0005 : 0);
            return {
              ...issue,
              locationName: attachedGMapLocation.name,
              lat: issueLat,
              lng: issueLng,
              hasSelectedLocation: true,
              location: {
                latitude: issueLat,
                longitude: issueLng,
                city: attachedGMapLocation.city || (attachedGMapLocation.name.includes('Vadodara') ? 'Vadodara' : 'Bharuch'),
                state: attachedGMapLocation.state || 'Gujarat',
                country: 'India',
                address: attachedGMapLocation.name,
                formattedAddress: attachedGMapLocation.formattedAddress || attachedGMapLocation.name,
              },
              googleMapsUrl: attachedGMapLocation.googleMapsUrl,
              attachedLocationMethod:
                attachedGMapLocation.sourceType === 'URL_QUERY' || attachedGMapLocation.sourceType === 'URL_COORDINATE_PATH'
                  ? 'GOOGLE_MAPS_LINK'
                  : 'COORDINATES',
              generatedBusRoute: generatedRouteData ? generatedRouteData.route : undefined,
              busRoute: generatedRouteData ? generatedRouteData.route.routeName : (attachedGMapLocation.city ? `${attachedGMapLocation.city} Survey Route` : issue.busRoute),
              busId: generatedRouteData ? generatedRouteData.bus.id : issue.busId,
              sourceMedia: issue.sourceMedia
                ? {
                    ...issue.sourceMedia,
                    locationMappingMethod: 'GOOGLE_MAPS_ATTACHMENT',
                  }
                : undefined,
            };
          });
        }

        setProcessingPercent(100);
        setProcessingStage('Preset footage processed.');
        setProcessedDetections(newIssues);
        setIsProcessing(false);
      }, 1500);
    }
  };

  const handleApplyToDashboard = () => {
    if (processedDetections && processedDetections.length > 0) {
      let busToDeploy = autoDeployRoute && generatedRouteData ? generatedRouteData.bus : undefined;

      // If user specified a location and route wasn't explicitly generated, auto-create a route bus for that location
      if (!busToDeploy && autoDeployRoute && isLocationAttached && attachedGMapLocation.isValid) {
        const autoGen = generateBusRouteForLocation(
          attachedGMapLocation.lat,
          attachedGMapLocation.lng,
          attachedGMapLocation.name,
          { busId: 'BUS-05', busNumber: 'GJ-06-V-2026' }
        );
        busToDeploy = autoGen.bus;
      }

      onIngestDetections(processedDetections, busToDeploy);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[2200] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md select-none overflow-y-auto">
      
      {/* Modal Card */}
      <div className="relative w-full max-w-4xl bg-[#090e1a] border border-cyan-700/80 rounded-xl shadow-[0_0_50px_rgba(6,182,212,0.25)] text-slate-100 flex flex-col max-h-[94vh] overflow-hidden my-auto">
        
        {/* Header: Title + Pipeline Concept */}
        <div className="px-5 py-3.5 bg-[#0c1322] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-cyan-950 border border-cyan-500/50 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-mono text-sm sm:text-base font-bold text-slate-100 uppercase tracking-wide">
                  Road Footage Ingestion &amp; AI Detection Engine
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-700">
                  MVP Model: Uploaded Footage
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                Processes pre-recorded dashcam video or photos • Maps video timestamps to Bharuch GPS coordinates
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 6-Stage Pipeline Graphic Banner */}
        <div className="px-5 py-2.5 bg-[#060a12] border-b border-slate-800/80 overflow-x-auto scrollbar-none">
          <div className="flex items-center justify-between min-w-[700px] text-[10px] font-mono text-slate-400 gap-1">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-900 border border-slate-800 text-cyan-300">
              <Upload className="w-3.5 h-3.5 text-cyan-400" />
              <span>1. Upload Media</span>
            </div>
            <ArrowRight className="w-3 h-3 text-slate-600 shrink-0" />
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-900 border border-slate-800 text-cyan-300">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>2. YOLOv8 / OpenCV</span>
            </div>
            <ArrowRight className="w-3 h-3 text-slate-600 shrink-0" />
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-900 border border-slate-800 text-amber-300">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>3. Detect Defect</span>
            </div>
            <ArrowRight className="w-3 h-3 text-slate-600 shrink-0" />
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-900 border border-slate-800 text-emerald-300">
              <Sliders className="w-3.5 h-3.5 text-emerald-400" />
              <span>4. Conf% &amp; Severity</span>
            </div>
            <ArrowRight className="w-3 h-3 text-slate-600 shrink-0" />
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-900 border border-slate-800 text-cyan-300">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span>5. Timeline GPS Tag</span>
            </div>
            <ArrowRight className="w-3 h-3 text-slate-600 shrink-0" />
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-cyan-950/80 border border-cyan-600 text-cyan-200 font-bold">
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              <span>6. Fast-API &amp; Map</span>
            </div>
          </div>
        </div>

        {/* Modal Main Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs font-mono">
          
          {/* Section 1: File Input & Quick-Pick Pre-recorded Samples */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* Left: Upload Dropzone (7/12 cols) */}
            <div className="lg:col-span-7 space-y-3">
              <label className="text-slate-300 font-bold block text-[11px]">
                1. Select or Upload Road Footage (Video / Image):
              </label>

              {/* Drag & Drop Area */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`p-5 rounded-xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center group ${
                  selectedFile
                    ? 'bg-cyan-950/30 border-cyan-500/80 shadow-[0_0_20px_rgba(6,182,212,0.15)]'
                    : 'bg-slate-950 hover:bg-slate-900/80 border-slate-700 hover:border-cyan-500/60'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/mp4,video/quicktime,image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="w-12 h-12 rounded-full bg-slate-900 group-hover:bg-cyan-950 border border-slate-700 group-hover:border-cyan-500 flex items-center justify-center text-cyan-400 mb-2 transition-colors">
                  {selectedFile?.type.startsWith('video') || fileInputType === 'video' ? (
                    <FileVideo className="w-6 h-6" />
                  ) : (
                    <ImageIcon className="w-6 h-6" />
                  )}
                </div>

                {selectedFile ? (
                  <div>
                    <span className="font-bold text-cyan-300 text-xs block mb-0.5">
                      ✓ {selectedFile.name}
                    </span>
                    <span className="text-slate-400 text-[10px]">
                      {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB • Click to replace file
                    </span>
                  </div>
                ) : activeSample ? (
                  <div>
                    <span className="text-slate-200 font-bold block mb-0.5">
                      Loaded: <span className="text-cyan-300">{activeSample.name}</span>
                    </span>
                    <span className="text-slate-400 text-[10px]">
                      {activeSample.duration} • Click to browse your own .mp4 / .jpg
                    </span>
                  </div>
                ) : (
                  <div>
                    <span className="text-slate-200 font-semibold block mb-0.5">
                      Click to upload Road Video or Image
                    </span>
                    <span className="text-slate-500 text-[10px]">
                      Supports pre-recorded .mp4, .mov, .jpg, .png (Dashcam footage / Road survey photos)
                    </span>
                  </div>
                )}
              </div>

              {/* Tagging Fields: Optional Bus ID & Corridor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-slate-400 text-[11px] block flex items-center justify-between">
                    <span>Tag Fleet Bus ID (Optional):</span>
                    <span className="text-cyan-400 text-[10px]">e.g. BUS-07</span>
                  </label>
                  <div className="relative">
                    <Bus className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      value={customBusId}
                      onChange={(e) => setCustomBusId(e.target.value.toUpperCase())}
                      placeholder="e.g. BUS-07 or MUNI-01"
                      className="w-full pl-8 pr-3 py-1.5 rounded bg-slate-900 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 text-[11px] block">
                    Assigned Transit Corridor (Bharuch):
                  </label>
                  <select
                    value={selectedCorridor}
                    onChange={(e) => setSelectedCorridor(e.target.value)}
                    className="w-full py-1.5 px-2 rounded bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
                  >
                    <option value="Route 4B (Station - GIDC Industrial)">Route 4B: Station Rd → GIDC</option>
                    <option value="Route 9A (Zadeshwar - Narmada Corridor)">Route 9A: Zadeshwar → Narmada</option>
                    <option value="Route 11 (Bholav Express Corridor)">Route 11: NH-48 Bholav Corridor</option>
                    <option value="Route 2C (Old City - Golden Bridge)">Route 2C: Heritage Golden Bridge</option>
                  </select>
                </div>
              </div>

              {/* Section 1B: Location Adding Dashboard - Positioned DIRECTLY BELOW the Image Adding Dashboard */}
              <div 
                id="location-adding-dashboard" 
                className="p-4 rounded-xl bg-[#091122] border border-cyan-800/80 shadow-[0_0_25px_rgba(6,182,212,0.15)] space-y-3.5"
              >
                {/* Top Bar: Title & Toggle */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-cyan-950/80 border border-cyan-500/50 text-cyan-400">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-100 text-xs uppercase tracking-wide">
                          Attach Google Maps Location &amp; Generate Bus Survey Route
                        </span>
                        <span className="px-2 py-0.5 rounded text-[9px] bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-amber-300 font-mono font-bold">
                          Dynamic Routing
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400">
                        Attach an image or defect to exact Google Maps coordinates &amp; automatically compute an optimized bus patrol itinerary
                      </p>
                    </div>
                  </div>

                  {/* Location Attach Checkbox */}
                  <label className="flex items-center gap-2 cursor-pointer bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-700/80 hover:border-cyan-500 transition-colors shrink-0">
                    <input
                      type="checkbox"
                      checked={isLocationAttached}
                      onChange={(e) => setIsLocationAttached(e.target.checked)}
                      className="rounded bg-slate-950 border-slate-600 text-cyan-500 focus:ring-0 cursor-pointer"
                    />
                    <span className="text-[11px] text-cyan-300 font-semibold">Attach Google Maps Pin</span>
                  </label>
                </div>

                {isLocationAttached && (
                  <div className="space-y-3 pt-1">
                    {/* Input row */}
                    <div>
                      <label className="text-slate-300 text-[11px] font-semibold block mb-1">
                        Google Maps URL, Place Link, or Latitude/Longitude Coordinates:
                      </label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <div className="relative flex-1">
                          <Compass className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                          <input
                            type="text"
                            value={googleMapsInput}
                            onChange={(e) => {
                              setGoogleMapsInput(e.target.value);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleParseLocation();
                            }}
                            placeholder="e.g. https://maps.google.com/?q=21.7160,72.9920 or 21.7160, 72.9920"
                            className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleParseLocation()}
                          className="px-4 py-2 rounded-lg bg-cyan-900/80 hover:bg-cyan-800 text-cyan-200 border border-cyan-600/80 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          <span>Parse &amp; Pin</span>
                        </button>
                      </div>
                    </div>

                    {/* Quick-Pick Landmark Chips */}
                    <div>
                      <div className="text-[10px] text-slate-400 mb-1.5 flex items-center justify-between">
                        <span>Quick Select Transit Landmarks (Vadodara &amp; Bharuch):</span>
                        <span className="text-slate-500 font-mono">1-Click Auto-Fill</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {PRESET_GMAP_LANDMARKS.slice(0, 6).map((lm) => {
                          const isCurrent = attachedGMapLocation.lat === lm.lat && attachedGMapLocation.lng === lm.lng;
                          return (
                            <button
                              key={lm.id}
                              type="button"
                              onClick={() => handleSelectLandmark(lm)}
                              className={`px-2.5 py-1 rounded text-[10px] font-mono transition-all cursor-pointer flex items-center gap-1 ${
                                isCurrent
                                  ? 'bg-cyan-950 text-cyan-200 border border-cyan-400 font-bold shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 hover:border-slate-500'
                              }`}
                            >
                              <MapPin className="w-2.5 h-2.5 text-cyan-400" />
                              <span>{lm.name.split('&')[0].trim()}</span>
                              <span className="text-[9px] text-cyan-400/80 font-sans">({lm.city})</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Location Verification Card */}
                    <div className={`p-3 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                      attachedGMapLocation.isValid
                        ? 'bg-[#060a14] border-cyan-900/70'
                        : 'bg-slate-950/80 border-slate-800'
                    }`}>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${
                            attachedGMapLocation.isValid
                              ? 'bg-cyan-950 text-cyan-300 border-cyan-700'
                              : 'bg-slate-900 text-slate-400 border-slate-700'
                          }`}>
                            {attachedGMapLocation.isValid ? attachedGMapLocation.sourceType : 'NOT SELECTED'}
                          </span>
                          <span className="font-bold text-slate-200 truncate max-w-sm">
                            {attachedGMapLocation.isValid ? attachedGMapLocation.name : 'Location not selected'}
                          </span>
                        </div>
                        <div className="text-[11px] font-mono flex items-center gap-2">
                          {attachedGMapLocation.isValid ? (
                            <>
                              <span className="text-cyan-400">Coordinates: {attachedGMapLocation.formattedCoordinates}</span>
                              <span className="text-slate-500">•</span>
                              <span className="text-slate-400">Lat {attachedGMapLocation.lat.toFixed(5)}, Lng {attachedGMapLocation.lng.toFixed(5)}</span>
                            </>
                          ) : (
                            <span className="text-slate-500">Enter a Google Maps URL/coordinates above or pick a quick landmark</span>
                          )}
                        </div>
                      </div>

                      {attachedGMapLocation.isValid && attachedGMapLocation.googleMapsUrl ? (
                        <a
                          href={attachedGMapLocation.googleMapsUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-700 hover:border-cyan-500 text-xs font-mono transition-colors shrink-0"
                        >
                          <span>Open in Google Maps</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      ) : null}
                    </div>

                    {/* Action: Generate Bus Route for this Location */}
                    <div className="pt-1">
                      {!generatedRouteData ? (
                        <button
                          type="button"
                          disabled={isGeneratingRoute}
                          onClick={handleGenerateRoute}
                          className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.35)] transition-all cursor-pointer active:scale-98 disabled:opacity-50"
                        >
                          <Route className="w-4 h-4 text-slate-950" />
                          <span>{isGeneratingRoute ? 'Calculating Transit Corridors & Waypoints...' : '🧭 Generate Bus Survey Route for this Location'}</span>
                        </button>
                      ) : (
                        /* Generated Bus Route Preview Card */
                        <div className="p-3.5 rounded-xl bg-gradient-to-b from-[#0b1626] to-[#070e1a] border border-amber-500/70 shadow-[0_0_25px_rgba(245,158,11,0.2)] space-y-3 animate-fadeIn">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800 pb-2.5">
                            <div className="flex items-center gap-2">
                              <span className="p-1 rounded bg-amber-950 border border-amber-600/80 text-amber-400">
                                <Route className="w-4 h-4" />
                              </span>
                              <div>
                                <span className="font-bold text-amber-300 text-xs block">
                                  {generatedRouteData.route.routeName}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  Assigned Fleet Vehicle: <strong className="text-cyan-300">{generatedRouteData.bus.id} ({generatedRouteData.bus.busNumber})</strong>
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <span className="px-2 py-0.5 rounded text-[10px] bg-slate-900 border border-slate-700 text-slate-300 font-mono">
                                📏 {generatedRouteData.route.totalDistanceKm} km
                              </span>
                              <span className="px-2 py-0.5 rounded text-[10px] bg-slate-900 border border-slate-700 text-amber-300 font-mono font-bold">
                                ⏱️ ~{generatedRouteData.route.estimatedDurationMin} mins
                              </span>
                              <button
                                type="button"
                                onClick={handleGenerateRoute}
                                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 hover:text-white transition-colors cursor-pointer"
                                title="Recalculate route"
                              >
                                Recalculate
                              </button>
                            </div>
                          </div>

                          {/* Waypoint Itinerary Timeline */}
                          <div>
                            <div className="text-[10px] text-slate-400 font-mono mb-1.5 flex items-center justify-between">
                              <span>Route Itinerary &amp; Defect Inspection Sweep:</span>
                              <span className="text-emerald-400">{generatedRouteData.route.waypoints.length} Waypoints</span>
                            </div>
                            <div className="space-y-1.5 font-mono text-[10px] max-h-44 overflow-y-auto pr-1">
                              {generatedRouteData.route.waypoints.map((wp, wIdx) => (
                                <div
                                  key={wIdx}
                                  className={`p-2 rounded flex items-start justify-between gap-2 ${
                                    wp.isTargetLocation
                                      ? 'bg-amber-950/60 border border-amber-500/80 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                                      : 'bg-slate-950/80 border border-slate-800 text-slate-300'
                                  }`}
                                >
                                  <div className="flex items-start gap-2">
                                    <span className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[9px] font-bold ${
                                      wp.isTargetLocation ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                                    }`}>
                                      {wIdx + 1}
                                    </span>
                                    <div>
                                      <span className="font-bold block">
                                        {wp.name}
                                      </span>
                                      <span className="text-[9px] text-slate-400 block">
                                        {wp.instruction}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <span className="text-[9px] text-cyan-400 block font-mono">
                                      {wp.lat.toFixed(4)}, {wp.lng.toFixed(4)}
                                    </span>
                                    {wp.dwellTimeSec && (
                                      <span className="text-[8px] text-amber-400 font-semibold block">
                                        Dwell: {wp.dwellTimeSec}s
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Auto Deploy Checkbox */}
                          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px]">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={autoDeployRoute}
                                onChange={(e) => setAutoDeployRoute(e.target.checked)}
                                className="rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-0 cursor-pointer"
                              />
                              <span className="text-slate-200">
                                Auto-deploy <strong>BUS-05</strong> on City Map along this generated route
                              </span>
                            </label>
                            <span className="text-emerald-400 text-[10px] font-mono font-semibold flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              <span>Route Ready to Synchronize</span>
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {routeSuccessToast && (
                      <div className="p-2 rounded bg-emerald-950/70 border border-emerald-500/70 text-emerald-300 text-[11px] font-mono flex items-center gap-2 animate-fadeIn">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{routeSuccessToast}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>

            {/* Right: Quick-Pick 1-Click Pre-recorded Demo Footage (5/12 cols) */}
            <div className="lg:col-span-5 space-y-2">
              <label className="text-slate-300 font-bold block text-[11px] flex items-center justify-between">
                <span>Or Select Demo Recorded Fleet Footage:</span>
                <span className="text-emerald-400 text-[10px]">Instant 1-Click</span>
              </label>

              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
                {SAMPLE_FOOTAGE_PRESETS.map((sample) => {
                  const isPicked = activeSample?.id === sample.id && !selectedFile;
                  return (
                    <div
                      key={sample.id}
                      onClick={() => handleSelectSample(sample)}
                      className={`p-2 rounded-lg border transition-all cursor-pointer ${
                        isPicked
                          ? 'bg-cyan-950/40 border-cyan-500/90 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <span className={`text-[11px] font-bold truncate ${isPicked ? 'text-cyan-300' : 'text-slate-200'}`}>
                          {sample.name}
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] bg-slate-900 border border-slate-700 text-amber-300 font-mono">
                          {sample.busId}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 line-clamp-1 mb-1">
                        {sample.description}
                      </p>
                      <div className="flex items-center justify-between text-[9px] text-slate-500 pt-1 border-t border-slate-900">
                        <span>⏱️ {sample.duration}</span>
                        <span className="text-cyan-400 font-semibold">{sample.detectedEventsCount} Hazard(s) Mapped</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Informational note about MVP detection input method */}
              <div className="p-2 rounded bg-slate-950 border border-slate-800/80 text-[10px] text-slate-400 flex items-start gap-2">
                <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Input Architecture Notice:</strong> AI does not stream live video from moving cameras in this MVP. It processes pre-recorded media and attaches synchronized GPS coordinates.
                </span>
              </div>
            </div>

          </div>

          {/* Section 2: Timeline GPS Mapping Registry (How Timestamps Map to Bharuch Coordinates) */}
          <div className="p-3.5 rounded-xl bg-[#070b14] border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-cyan-400" />
                <span className="font-bold text-slate-200 text-xs uppercase tracking-wider">
                  Timeline GPS Mapping Registry (Bharuch Corridor Coordinates)
                </span>
              </div>
              <span className="text-[10px] text-slate-400">
                Synchronized Video Timeline ➔ Road Registry GPS
              </span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Because public bus dashcams record locally to internal solid-state media before depot sync, the AI model pinpoints timestamp marks in the supplied video and indexes against the surveyed transit route registry:
            </p>

            {/* Registry Table */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-1 text-[11px]">
              {BHARUCH_TIMELINE_MAPPINGS.map((m, idx) => (
                <div key={idx} className="p-2 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold text-[10px]">
                      ⏱️ {m.timestampStart} - {m.timestampEnd}
                    </span>
                    <span className={`text-[9px] font-bold px-1 rounded ${
                      m.defaultDefect.severity === 'HIGH' ? 'bg-rose-950 text-rose-300' : 'bg-amber-950 text-amber-300'
                    }`}>
                      {m.defaultDefect.type.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-slate-300 text-[10px] font-sans font-semibold truncate">
                    {m.locationName}
                  </div>
                  <div className="text-[10px] text-cyan-400 font-mono">
                    {m.lat.toFixed(4)}° N, {m.lng.toFixed(4)}° E
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Processing & Results State */}
          {processingError && !isProcessing && (
            <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-500/80 shadow-[0_0_20px_rgba(244,63,94,0.25)] text-rose-200 text-xs font-mono flex items-start gap-3 animate-fadeIn">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1 flex-1">
                <strong className="block font-bold text-rose-300 text-sm">YOLO Inference Execution Error</strong>
                <p className="text-slate-300">{processingError}</p>
                <p className="text-[11px] text-rose-400/90 font-mono pt-1">
                  The uploaded file could not be processed by the YOLO model. Please verify file integrity and try again.
                </p>
              </div>
            </div>
          )}

          {isProcessing && (
            <div className="p-4 rounded-xl bg-[#0c1322] border border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.2)] space-y-2 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-300 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                  <span>AI INFERENCE &amp; PIPELINE PROCESSING</span>
                </span>
                <span className="text-cyan-400 font-bold">{processingPercent}%</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-400 transition-all duration-300 rounded-full"
                  style={{ width: `${processingPercent}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>{processingStage}</span>
                <span className="text-emerald-400">YOLOv8 + OpenCV Ingestion</span>
              </div>
            </div>
          )}

          {/* Render Exact YOLOv8 Annotated Output Image */}
          {processedResultImageUrl && !isProcessing && (
            <div className="rounded-xl border-2 border-emerald-500/80 bg-[#040812] overflow-hidden shadow-[0_0_35px_rgba(16,185,129,0.3)] space-y-0 animate-fadeIn">
              <div className="px-4 py-2 bg-[#0a1220] border-b border-slate-800 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>YOLOv8 Output Image (Exact Uploaded File Annotated)</span>
                </div>
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="text-slate-400">Unique URL:</span>
                  <a 
                    href={processedResultImageUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-cyan-400 hover:text-cyan-300 underline flex items-center gap-1 font-mono"
                    title={processedResultImageUrl}
                  >
                    <span className="truncate max-w-[220px] inline-block">{processedResultImageUrl}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                </div>
              </div>

              {/* Display Result Image */}
              <div className="relative p-2 bg-black flex items-center justify-center min-h-[220px]">
                <img
                  id="yolo-annotated-result-image"
                  key={processedResultImageUrl}
                  src={processedResultImageUrl}
                  alt="YOLOv8 Annotated Defect Result"
                  className="max-h-[380px] w-auto max-w-full object-contain rounded border border-slate-800 shadow-2xl"
                  onLoad={() => console.log('[Frontend Display] Loaded processed result image:', processedResultImageUrl)}
                  onError={(e) => console.error('[Frontend Display Error] Failed to load image from backend URL:', e)}
                />
              </div>

              <div className="px-4 py-2 bg-slate-950/90 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Direct model inference output • Real-time bounding box annotations</span>
                <span className="text-emerald-400 font-bold">✓ Verified Pipeline Connection</span>
              </div>
            </div>
          )}

          {/* Processed Results Summary */}
          {processedDetections && !isProcessing && (
            <div className="p-4 rounded-xl bg-[#0b1625] border border-emerald-500/60 shadow-[0_0_25px_rgba(16,185,129,0.2)] space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Detection Complete: {processedDetections.length} Road Hazard(s) Identified</span>
                </div>
                <span className="text-[10px] text-slate-400">
                  Ready to commit to Map &amp; Alert Panel
                </span>
              </div>

              <div className="space-y-2">
                {processedDetections.map((det) => (
                  <div 
                    key={det.id}
                    className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-bold text-cyan-400">{det.id}</span>
                        <span className="text-slate-600">•</span>
                        <span className="font-semibold text-slate-200">{det.title}</span>
                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                          det.severity === 'HIGH' ? 'bg-rose-950 text-rose-300' : 'bg-amber-950 text-amber-300'
                        }`}>
                          {det.severity}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2">
                        <span>📍 {det.locationName}</span>
                        <span>•</span>
                        <span className="text-amber-300 font-mono">Timestamp: {det.videoTimestamp}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-cyan-300 font-bold block">{det.confidence}% Conf</span>
                      <span className="text-[10px] text-slate-500">Bus: {det.busId}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-[#0c1322] border-t border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
          <div className="text-[11px] font-mono text-slate-400">
            {selectedFile ? (
              <span>Target: <strong className="text-cyan-300">{selectedFile.name}</strong></span>
            ) : activeSample ? (
              <span>Target: <strong className="text-cyan-300">{activeSample.name}</strong> ({activeSample.duration})</span>
            ) : (
              <span>No file selected yet</span>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 font-mono text-xs">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            {processedDetections ? (
              <button
                id="btn-apply-detections-to-dashboard"
                onClick={handleApplyToDashboard}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 font-bold shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all cursor-pointer active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Publish {processedDetections.length} Detection(s) to City Grid</span>
              </button>
            ) : (
              <button
                id="btn-run-detection-analyze"
                disabled={isProcessing}
                onClick={handleRunDetection}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-slate-950 font-bold shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isProcessing ? 'Analyzing Footage...' : 'Analyze & Run Detection'}</span>
              </button>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
