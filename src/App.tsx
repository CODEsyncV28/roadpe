import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { CityMap } from './components/CityMap';
import { LiveAlertPanel } from './components/LiveAlertPanel';
import { IssueDetailModal } from './components/IssueDetailModal';
import { BusCameraHUDModal } from './components/BusCameraHUDModal';
import { SimulateDetectionModal } from './components/SimulateDetectionModal';
import { AuthorityActionModal } from './components/AuthorityActionModal';
import { LayerManagerPanel } from './components/LayerManagerPanel';
import { UploadInterfaceModal } from './components/UploadInterfaceModal';
import { AssignProblemModal } from './components/AssignProblemModal';
import { 
  RoadIssue, 
  BusFleet, 
  ActiveLayer, 
  IssueType, 
  Severity 
} from './types';
import { initialRoadIssues, initialBusFleet, generateEvidenceDataUrl } from './data/mockRoadData';
import { AlertTriangle, Bell, CheckCircle2, Sparkles, X } from 'lucide-react';

export default function App() {
  const [issues, setIssues] = useState<RoadIssue[]>(() => {
    const saved = localStorage.getItem('roadvision_issues');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return initialRoadIssues;
  });

  const [busFleet, setBusFleet] = useState<BusFleet[]>(initialBusFleet);
  const [selectedIssue, setSelectedIssue] = useState<RoadIssue | null>(null);
  const [selectedBusForHUD, setSelectedBusForHUD] = useState<BusFleet | null>(null);
  const [activeLayer, setActiveLayer] = useState<ActiveLayer>('AI_LAYER');
  const [filterType, setFilterType] = useState<IssueType | 'ALL'>('ALL');
  const [filterSeverity, setFilterSeverity] = useState<Severity | 'ALL'>('ALL');

  // Modals
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isSimulateModalOpen, setIsSimulateModalOpen] = useState(false);
  const [isManualAddModalOpen, setIsManualAddModalOpen] = useState(false);
  const [problemToAssign, setProblemToAssign] = useState<RoadIssue | null>(null);
  const [showLayerManager, setShowLayerManager] = useState(true);

  // Fetch persisted problems from backend on initial mount
  useEffect(() => {
    fetch('/api/problems')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.success && Array.isArray(data.problems) && data.problems.length > 0) {
          const backendIssues: RoadIssue[] = data.problems.map((p: any) => {
            const resolvedLocName = p.locationName || (typeof p.location === 'string' ? p.location : p.location?.address || p.location?.city) || (p.lat && p.lng ? `${p.lat.toFixed(4)}°N, ${p.lng.toFixed(4)}°E` : 'Location not selected');
            const resolvedLat = typeof p.lat === 'number' ? p.lat : (p.location?.latitude || 0);
            const resolvedLng = typeof p.lng === 'number' ? p.lng : (p.location?.longitude || 0);
            const hasLocation = p.hasSelectedLocation ?? (resolvedLat !== 0 && resolvedLng !== 0);

            return {
              id: p.id,
              type: p.type || 'pothole',
              title: p.title || `Detected Hazard ${p.id}`,
              locationName: resolvedLocName,
              lat: resolvedLat,
              lng: resolvedLng,
              hasSelectedLocation: hasLocation,
              location: p.location && typeof p.location === 'object' ? p.location : (hasLocation ? {
                latitude: resolvedLat,
                longitude: resolvedLng,
                address: resolvedLocName,
                formattedAddress: resolvedLocName,
              } : undefined),
              googleMapsUrl: p.googleMapsUrl || (hasLocation ? `https://www.google.com/maps?q=${resolvedLat.toFixed(6)},${resolvedLng.toFixed(6)}` : undefined),
              severity: p.severity || 'HIGH',
              confidence: p.confidence || 94,
              busId: p.busId || 'BUS-03',
              busRoute: p.busRoute || 'Route 1',
              timestamp: p.timestamp || new Date().toLocaleString(),
              status: p.status || 'Pending',
              verification: p.verification || 'Pending Verification',
              evidenceImage: p.evidenceImage || p.image || '/results/result_1789567316953_vgh5qcj.jpg',
              boundingBoxes: p.boundingBoxes || [],
              assignedAuthority: p.assignedAuthority,
              assignedDept: p.assignedDept,
              assignedPerson: p.assignedPerson,
              priority: p.priority,
              dueDate: p.dueDate,
              notes: p.notes,
              authorityNotes: p.authorityNotes,
              workflowHistory: p.workflowHistory,
              telemetry: {
                speedKmh: 38,
                zVibrationG: 1.8,
                roadRoughnessIRI: 5.2,
                cameraFov: 'Forward Bus Dashcam',
                weatherCondition: 'Clear Sunlight',
              },
            };
          });

          setIssues((prev) => {
            const backendIds = new Set(backendIssues.map((b) => b.id));
            const existingRemaining = prev.filter((i) => !backendIds.has(i.id));
            return [...backendIssues, ...existingRemaining];
          });
        }
      })
      .catch((err) => {
        console.warn('Backend problems load note:', err);
      });
  }, []);

  // Live Toast Notification
  const [liveToast, setLiveToast] = useState<{ id: string; title: string; busId: string; severity: Severity } | null>(null);

  // Real-time Clock
  const [currentTime, setCurrentTime] = useState('');

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem('roadvision_issues', JSON.stringify(issues));
  }, [issues]);

  // Update Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-IN', { hour12: false }) + ' IST');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Bus Movement Simulation Loop (advances buses along their predefined GPS transit routes)
  useEffect(() => {
    const interval = setInterval(() => {
      setBusFleet((prevFleet) =>
        prevFleet.map((bus) => {
          const coords = bus.routeCoordinates;
          if (!coords || coords.length < 2) return bus;

          let nextIdx = bus.currentWaypointIndex + bus.direction;
          let newDirection = bus.direction;

          if (nextIdx >= coords.length) {
            nextIdx = coords.length - 2;
            newDirection = -1;
          } else if (nextIdx < 0) {
            nextIdx = 1;
            newDirection = 1;
          }

          const targetCoord = coords[nextIdx];
          const currLat = bus.lat;
          const currLng = bus.lng;

          // Interpolate step towards target waypoint
          const stepFactor = 0.12;
          const newLat = currLat + (targetCoord[0] - currLat) * stepFactor;
          const newLng = currLng + (targetCoord[1] - currLng) * stepFactor;

          // Check if close to target waypoint to advance
          const distSq = (targetCoord[0] - newLat) ** 2 + (targetCoord[1] - newLng) ** 2;
          const advancedIdx = distSq < 0.00001 ? nextIdx : bus.currentWaypointIndex;

          return {
            ...bus,
            lat: newLat,
            lng: newLng,
            currentWaypointIndex: advancedIdx,
            direction: newDirection,
            speedKmh: Math.max(22, Math.min(58, bus.speedKmh + Math.floor((Math.random() - 0.5) * 4))),
          };
        })
      );
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Handle New Ingestion from Edge AI or Bus
  const handleIngestNewIssue = (newIssue: RoadIssue) => {
    setIssues((prev) => [newIssue, ...prev]);
    setSelectedIssue(newIssue);

    // Trigger HUD Toast
    setLiveToast({
      id: newIssue.id,
      title: newIssue.title,
      busId: newIssue.busId,
      severity: newIssue.severity,
    });

    // Auto-dismiss toast after 6s
    setTimeout(() => {
      setLiveToast((current) => (current?.id === newIssue.id ? null : current));
    }, 6000);

    // Increment detections count on the reporting bus
    setBusFleet((prev) =>
      prev.map((b) =>
        b.id === newIssue.busId
          ? {
              ...b,
              detectionsCount: b.detectionsCount + 1,
              lastDetectionTime: 'Just now (' + new Date().toLocaleTimeString() + ')',
            }
          : b
      )
    );
  };

  // Ingest batch of detections flagged from uploaded road video or image
  const handleIngestMultipleDetections = (newIssues: RoadIssue[], generatedRouteBus?: BusFleet) => {
    setIssues((prev) => [...newIssues, ...prev]);

    if (generatedRouteBus) {
      setBusFleet((prev) => [
        generatedRouteBus,
        ...prev.filter((b) => b.id !== generatedRouteBus.id),
      ]);
    }

    if (newIssues.length > 0) {
      setSelectedIssue(newIssues[0]);
      setLiveToast({
        id: newIssues[0].id,
        title: generatedRouteBus
          ? `📍 Pin Attached & Bus Route ${generatedRouteBus.routeName} Generated!`
          : `${newIssues.length} Hazard(s) Detected from Uploaded Footage`,
        busId: newIssues[0].busId,
        severity: newIssues[0].severity,
      });

      // Update reporting buses
      const busIds = new Set(newIssues.map((i) => i.busId));
      setBusFleet((prev) =>
        prev.map((b) => {
          if (busIds.has(b.id)) {
            const countForBus = newIssues.filter((i) => i.busId === b.id).length;
            return {
              ...b,
              detectionsCount: b.detectionsCount + countForBus,
              lastDetectionTime: 'Just now (Media Upload)',
            };
          }
          return b;
        })
      );

      setTimeout(() => {
        setLiveToast(null);
      }, 7000);
    }
  };

  // Update Existing Issue (e.g. from Detail Modal)
  const handleUpdateIssue = (updated: RoadIssue, generatedBus?: BusFleet) => {
    setIssues((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
    if (selectedIssue?.id === updated.id) {
      setSelectedIssue(updated);
    }
    // Sync with backend database
    fetch(`/api/problems/${updated.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    }).catch((e) => console.warn('Backend problem update sync note:', e));

    if (generatedBus) {
      setBusFleet((prev) => [
        generatedBus,
        ...prev.filter((b) => b.id !== generatedBus.id),
      ]);
      setLiveToast({
        id: updated.id,
        title: `Bus Survey Route Deployed: ${generatedBus.routeName}`,
        busId: generatedBus.id,
        severity: updated.severity,
      });
      setTimeout(() => setLiveToast(null), 6000);
    }
  };

  // Linear Workflow: Authority Verification Action
  const handleVerifyProblem = async (issueId: string) => {
    try {
      const res = await fetch(`/api/problems/${issueId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verifiedBy: 'Authorized Municipal Inspector' }),
      });
      const data = await res.json();
      if (data && data.success && data.problem) {
        setIssues((prev) =>
          prev.map((i) =>
            i.id === issueId
              ? {
                  ...i,
                  verification: 'Verified',
                  authorityNotes: data.problem.authorityNotes,
                  workflowHistory: data.problem.workflowHistory,
                }
              : i
          )
        );
        if (selectedIssue?.id === issueId) {
          setSelectedIssue((prev) =>
            prev
              ? {
                  ...prev,
                  verification: 'Verified',
                  authorityNotes: data.problem.authorityNotes,
                  workflowHistory: data.problem.workflowHistory,
                }
              : null
          );
        }
        return;
      }
    } catch (e) {
      console.warn('Backend verify call note:', e);
    }
    // Optimistic fallback
    setIssues((prev) =>
      prev.map((i) => (i.id === issueId ? { ...i, verification: 'Verified' } : i))
    );
    if (selectedIssue?.id === issueId) {
      setSelectedIssue((prev) => (prev ? { ...prev, verification: 'Verified' } : null));
    }
  };

  // Linear Workflow: Authority Rejection Action
  const handleRejectProblem = async (issueId: string) => {
    try {
      const res = await fetch(`/api/problems/${issueId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Rejected after municipal review: Non-actionable road variation' }),
      });
      const data = await res.json();
      if (data && data.success && data.problem) {
        setIssues((prev) =>
          prev.map((i) =>
            i.id === issueId
              ? {
                  ...i,
                  verification: 'Rejected',
                  status: 'Rejected',
                  workflowHistory: data.problem.workflowHistory,
                }
              : i
          )
        );
        if (selectedIssue?.id === issueId) {
          setSelectedIssue((prev) =>
            prev ? { ...prev, verification: 'Rejected', status: 'Rejected', workflowHistory: data.problem.workflowHistory } : null
          );
        }
        return;
      }
    } catch (e) {
      console.warn('Backend reject call note:', e);
    }
    // Optimistic fallback
    setIssues((prev) =>
      prev.map((i) => (i.id === issueId ? { ...i, verification: 'Rejected', status: 'Rejected' } : i))
    );
    if (selectedIssue?.id === issueId) {
      setSelectedIssue((prev) => (prev ? { ...prev, verification: 'Rejected', status: 'Rejected' } : null));
    }
  };

  // Linear Workflow: Assign Problem to Department Action
  const handleAssignProblem = async (
    issueId: string,
    assignmentData: {
      assignedAuthority: string;
      assignedDept: string;
      assignedPerson: string;
      priority: any;
      dueDate: string;
      notes: string;
    }
  ) => {
    try {
      const res = await fetch(`/api/problems/${issueId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assignmentData),
      });
      const data = await res.json();
      if (data && data.success && data.problem) {
        const p = data.problem;
        setIssues((prev) =>
          prev.map((i) =>
            i.id === issueId
              ? {
                  ...i,
                  assignedAuthority: p.assignedAuthority,
                  assignedDept: p.assignedDept,
                  assignedPerson: p.assignedPerson,
                  priority: p.priority,
                  dueDate: p.dueDate,
                  notes: p.notes,
                  status: i.status === 'Pending' || i.status === 'PENDING' ? 'In Progress' : i.status,
                  workflowHistory: p.workflowHistory,
                }
              : i
          )
        );
        if (selectedIssue?.id === issueId) {
          setSelectedIssue((prev) =>
            prev
              ? {
                  ...prev,
                  assignedAuthority: p.assignedAuthority,
                  assignedDept: p.assignedDept,
                  assignedPerson: p.assignedPerson,
                  priority: p.priority,
                  dueDate: p.dueDate,
                  notes: p.notes,
                  status: prev.status === 'Pending' || prev.status === 'PENDING' ? 'In Progress' : prev.status,
                  workflowHistory: p.workflowHistory,
                }
              : null
          );
        }
        return;
      }
    } catch (e) {
      console.warn('Backend assign call note:', e);
    }
    // Optimistic fallback
    setIssues((prev) =>
      prev.map((i) =>
        i.id === issueId
          ? {
              ...i,
              ...assignmentData,
              status: i.status === 'Pending' || i.status === 'PENDING' ? 'In Progress' : i.status,
            }
          : i
      )
    );
    if (selectedIssue?.id === issueId) {
      setSelectedIssue((prev) =>
        prev
          ? {
              ...prev,
              ...assignmentData,
              status: prev.status === 'Pending' || prev.status === 'PENDING' ? 'In Progress' : prev.status,
            }
          : null
      );
    }
  };

  // Linear Workflow: Update Problem Status Action (Pending / In Progress / Solved)
  const handleUpdateStatus = async (issueId: string, status: 'Pending' | 'In Progress' | 'Solved') => {
    try {
      const res = await fetch(`/api/problems/${issueId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data && data.success && data.problem) {
        setIssues((prev) =>
          prev.map((i) =>
            i.id === issueId
              ? {
                  ...i,
                  status,
                  roadCondition: status === 'Solved' ? 'Repaired' : i.roadCondition,
                  workflowHistory: data.problem.workflowHistory,
                }
              : i
          )
        );
        if (selectedIssue?.id === issueId) {
          setSelectedIssue((prev) =>
            prev
              ? {
                  ...prev,
                  status,
                  roadCondition: status === 'Solved' ? 'Repaired' : prev.roadCondition,
                  workflowHistory: data.problem.workflowHistory,
                }
              : null
          );
        }
        return;
      }
    } catch (e) {
      console.warn('Backend status call note:', e);
    }
    // Optimistic fallback
    setIssues((prev) =>
      prev.map((i) =>
        i.id === issueId
          ? {
              ...i,
              status,
              roadCondition: status === 'Solved' ? 'Repaired' : i.roadCondition,
            }
          : i
      )
    );
    if (selectedIssue?.id === issueId) {
      setSelectedIssue((prev) =>
        prev
          ? {
              ...prev,
              status,
              roadCondition: status === 'Solved' ? 'Repaired' : prev.roadCondition,
            }
          : null
      );
    }
  };

  // Trigger from Bus Camera HUD
  const handleTriggerDetectionFromBus = (bus: BusFleet) => {
    const timestampStr = new Date().toLocaleTimeString() + ' IST';
    const newId = `DET-${Math.floor(8950 + Math.random() * 800)}`;
    const randomTypes: IssueType[] = ['pothole', 'waterlogging', 'road_damage', 'accident'];
    const chosenType = randomTypes[Math.floor(Math.random() * randomTypes.length)];

    const titleMap: Record<IssueType, string> = {
      pothole: 'Deep Surface Cavity Cluster Detected',
      waterlogging: 'Critical Waterlogging Across Left Lane',
      road_damage: 'Severe Alligator Fatigue Cracking on Surface',
      accident: 'Obstruction & Debris Field on Carriageway',
      construction: 'Unscheduled Trenching Work',
      road_closed: 'Emergency Route Closure',
      traffic_anomaly: 'Vehicle Stoppage Anomaly',
    };

    const newIssue: RoadIssue = {
      id: newId,
      type: chosenType,
      title: titleMap[chosenType],
      locationName: `${bus.routeName} Corridor, Bharuch`,
      lat: bus.lat + (Math.random() - 0.5) * 0.002,
      lng: bus.lng + (Math.random() - 0.5) * 0.002,
      severity: chosenType === 'accident' || chosenType === 'pothole' ? 'HIGH' : 'MEDIUM',
      confidence: Math.round((89 + Math.random() * 9) * 10) / 10,
      busId: bus.id,
      busRoute: bus.routeName,
      timestamp: `${new Date().toISOString().split('T')[0]} ${timestampStr}`,
      status: 'PENDING',
      verification: 'AI_DETECTED',
      evidenceImage: generateEvidenceDataUrl(chosenType, titleMap[chosenType], bus.id, timestampStr),
      boundingBoxes: [
        {
          id: `box-${Date.now()}`,
          label: `${chosenType}_event`,
          confidence: 94.2,
          x: 35,
          y: 40,
          width: 35,
          height: 30,
          color: chosenType === 'accident' || chosenType === 'pothole' ? '#ef4444' : '#f59e0b',
        }
      ],
      telemetry: {
        speedKmh: bus.speedKmh,
        zVibrationG: chosenType === 'pothole' ? 2.62 : 0.94,
        roadRoughnessIRI: 5.6,
        cameraFov: '120° Wide Angle Front Dashcam',
        weatherCondition: 'Clear',
      },
      estimatedDimensions: {
        depthCm: chosenType === 'pothole' ? 8.2 : undefined,
        lengthM: 1.8,
        widthM: 1.2,
        blockedLanes: 1,
      },
      roadCondition: 'Critical',
      priorityScore: 90,
    };

    handleIngestNewIssue(newIssue);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#080b11] text-slate-100 font-sans antialiased">
      
      {/* 1. Header Bar with BEL & System Status */}
      <Header
        activeLayer={activeLayer}
        setActiveLayer={(layer) => {
          setActiveLayer(layer);
          setShowLayerManager(true);
        }}
        issues={issues}
        busFleet={busFleet}
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
        onOpenSimulateModal={() => setIsSimulateModalOpen(true)}
        onOpenBusCameraModal={(busId) => {
          const b = busId ? busFleet.find((f) => f.id === busId) : busFleet[0];
          setSelectedBusForHUD(b || busFleet[0]);
        }}
        onOpenManualAddModal={() => setIsManualAddModalOpen(true)}
        currentTime={currentTime}
      />

      {/* Main Workspace Layout: City Map (Primary Panel) + Live Alert Panel (Side Panel) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        
        {/* Primary View: Full Interactive Leaflet Map */}
        <main className="flex-1 h-full relative overflow-hidden">
          <CityMap
            issues={issues}
            busFleet={busFleet}
            selectedIssue={selectedIssue}
            onSelectIssue={(issue) => setSelectedIssue(issue)}
            onSelectBus={(bus) => setSelectedBusForHUD(bus)}
            filterType={filterType}
            setFilterType={setFilterType}
            filterSeverity={filterSeverity}
            setFilterSeverity={setFilterSeverity}
          />
        </main>

        {/* Side Panel: Real-Time Live Alert Feed */}
        <LiveAlertPanel
          issues={issues}
          selectedIssue={selectedIssue}
          onSelectIssue={(issue) => setSelectedIssue(issue)}
          onOpenEvidence={(issue) => setSelectedIssue(issue)}
          filterType={filterType}
          setFilterType={setFilterType}
          filterSeverity={filterSeverity}
          setFilterSeverity={setFilterSeverity}
          onOpenUploadModal={() => setIsUploadModalOpen(true)}
          onOpenSimulateModal={() => setIsSimulateModalOpen(true)}
        />

      </div>

      {/* Bottom Linear Workflow Panel (AI Detection, Authority & Verification, Problem Status Tracking) */}
      {showLayerManager && (
        <LayerManagerPanel
          activeLayer={activeLayer}
          issues={issues}
          onSelectIssue={(issue) => setSelectedIssue(issue)}
          onUpdateIssue={handleUpdateIssue}
          onOpenAssignModal={(issue) => setProblemToAssign(issue)}
          onVerifyProblem={handleVerifyProblem}
          onRejectProblem={handleRejectProblem}
          onUpdateStatus={handleUpdateStatus}
          onClose={() => setShowLayerManager(false)}
        />
      )}

      {/* Real-time Ingestion Toast Notification */}
      {liveToast && (
        <div 
          onClick={() => {
            const found = issues.find((i) => i.id === liveToast.id);
            if (found) setSelectedIssue(found);
            setLiveToast(null);
          }}
          className="fixed bottom-16 right-6 z-[2500] max-w-md p-3 rounded-lg bg-[#0c1322]/95 border border-cyan-500/80 shadow-[0_0_25px_rgba(6,182,212,0.4)] text-xs font-mono flex items-center gap-3 cursor-pointer animate-bounce hover:animate-none"
        >
          <div className="w-3 h-3 rounded-full bg-rose-500 animate-ping shrink-0"></div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between text-[11px] text-cyan-300 font-bold mb-0.5">
              <span>🚨 NEW DETECTION: {liveToast.id}</span>
              <span className="text-amber-400">{liveToast.busId}</span>
            </div>
            <p className="text-slate-100 font-sans font-semibold text-xs truncate">
              {liveToast.title}
            </p>
            <span className="text-[10px] text-cyan-400 underline">
              Click to view camera evidence &amp; dispatch
            </span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setLiveToast(null);
            }}
            className="text-slate-500 hover:text-slate-300 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Modal 1: Issue Detail View */}
      {selectedIssue && (
        <IssueDetailModal
          issue={selectedIssue}
          onClose={() => setSelectedIssue(null)}
          onUpdateIssue={handleUpdateIssue}
          onOpenAssignModal={(issue) => setProblemToAssign(issue)}
        />
      )}

      {/* Modal 6: Assign Problem to Municipal Authority / Department */}
      {problemToAssign && (
        <AssignProblemModal
          isOpen={!!problemToAssign}
          issue={problemToAssign}
          onClose={() => setProblemToAssign(null)}
          onAssign={handleAssignProblem}
        />
      )}

      {/* Modal 2: Bus Dashcam HUD Viewer */}
      {selectedBusForHUD && (
        <BusCameraHUDModal
          bus={selectedBusForHUD}
          busFleet={busFleet}
          onClose={() => setSelectedBusForHUD(null)}
          onSelectBus={(b) => setSelectedBusForHUD(b)}
          onTriggerDetectionFromBus={handleTriggerDetectionFromBus}
          onOpenUploadModal={() => setIsUploadModalOpen(true)}
        />
      )}

      {/* Modal 3: Simulate Edge Ingestion Packet */}
      {isSimulateModalOpen && (
        <SimulateDetectionModal
          busFleet={busFleet}
          onClose={() => setIsSimulateModalOpen(false)}
          onIngestDetection={handleIngestNewIssue}
        />
      )}

      {/* Modal 4: Manual Authority Action / Road Closure Entry */}
      {isManualAddModalOpen && (
        <AuthorityActionModal
          onClose={() => setIsManualAddModalOpen(false)}
          onAddManualIssue={handleIngestNewIssue}
        />
      )}

      {/* Modal 5: Upload Road Video / Photo Ingestion Interface */}
      {isUploadModalOpen && (
        <UploadInterfaceModal
          busFleet={busFleet}
          onClose={() => setIsUploadModalOpen(false)}
          onIngestDetections={handleIngestMultipleDetections}
        />
      )}

    </div>
  );
}
