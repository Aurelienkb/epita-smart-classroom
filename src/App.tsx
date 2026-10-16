import React, { useState, useEffect } from 'react';
import { ClassroomRoom, AuditReportData, EquipmentId } from './types';
import { DEFAULT_ROOMS, loadSavedRooms, saveRooms } from './data/defaultRooms';
import { visionAIService, DetectionOutput, ModelStatus } from './services/aiVision';
import { computeAuditReport, ManualOverride, loadAuditHistory } from './services/auditEngine';

// Components
import { Header } from './components/Header';
import { Navigation, TabId } from './components/Navigation';
import { OverviewView } from './components/OverviewView';
import { ScannerView } from './components/ScannerView';
import { AuditDashboardView } from './components/AuditDashboardView';
import { AuditReportView } from './components/AuditReportView';
import { SettingsView } from './components/SettingsView';
import { HelpModal } from './components/HelpModal';

export const App: React.FC = () => {
  // Rooms state
  const [rooms, setRooms] = useState<ClassroomRoom[]>(() => loadSavedRooms());
  const [selectedRoom, setSelectedRoom] = useState<ClassroomRoom>(() => rooms[0] || DEFAULT_ROOMS[0]);

  // Navigation state
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  // AI Model state
  const [modelStatus, setModelStatus] = useState<ModelStatus>('unloaded');
  const [modelError, setModelError] = useState<string>('');

  // Detection & Audit state
  const [detectionOutput, setDetectionOutput] = useState<DetectionOutput | null>(null);
  const [imageSnapshotUrl, setImageSnapshotUrl] = useState<string | undefined>(undefined);
  const [manualOverrides, setManualOverrides] = useState<Record<string, ManualOverride>>({});
  const [auditReport, setAuditReport] = useState<AuditReportData | null>(null);
  const [lastReport, setLastReport] = useState<AuditReportData | null>(() => {
    const history = loadAuditHistory();
    return history.length > 0 ? history[0] : null;
  });

  // Help Modal state
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);

  // Initialize TensorFlow.js & COCO-SSD on application load
  useEffect(() => {
    const initModel = async () => {
      setModelStatus('loading');
      try {
        await visionAIService.loadModel();
        setModelStatus('ready');
      } catch (err: unknown) {
        setModelStatus('error');
        setModelError(err instanceof Error ? err.message : 'Erreur de chargement du modèle');
      }
    };

    initModel();
  }, []);

  // Recalculate audit report whenever detection output, selected room, or manual overrides change
  useEffect(() => {
    if (!detectionOutput) {
      setAuditReport(null);
      return;
    }

    const report = computeAuditReport(
      selectedRoom,
      detectionOutput,
      manualOverrides,
      'Auditeur Campus EPITA',
      'Responsable Déploiement GITM',
      0.45
    );

    setAuditReport(report);
    setLastReport(report);
  }, [detectionOutput, selectedRoom, manualOverrides]);

  // Handle analysis output from ScannerView
  const handleAnalysisComplete = (output: DetectionOutput, snapshotUrl?: string) => {
    setDetectionOutput(output);
    setImageSnapshotUrl(snapshotUrl);
    // Reset manual overrides for a new photo capture
    setManualOverrides({});
  };

  // Handle human-in-the-loop manual adjustment
  const handleUpdateManualOverride = (equipmentId: EquipmentId, override: ManualOverride) => {
    setManualOverrides(prev => ({
      ...prev,
      [equipmentId]: override
    }));
  };

  // Handle loading an audit report from history
  const handleLoadHistoricalAudit = (report: AuditReportData) => {
    setAuditReport(report);
    // Find matching room if still exists
    const matchingRoom = rooms.find(r => r.id === report.room.id);
    if (matchingRoom) {
      setSelectedRoom(matchingRoom);
    }
    setActiveTab('report');
  };

  // Room switching handler
  const handleSelectRoom = (room: ClassroomRoom) => {
    setSelectedRoom(room);
    // Keep detections if already present, but reset overrides
    setManualOverrides({});
  };

  return (
    <div className="min-h-screen bg-[#0B1020] text-slate-100 flex flex-col selection:bg-[#38D9E6]/30 selection:text-[#38D9E6]">
      {/* Header */}
      <Header
        rooms={rooms}
        selectedRoom={selectedRoom}
        onSelectRoom={handleSelectRoom}
        modelStatus={modelStatus}
        modelError={modelError}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* Navigation */}
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        hasAuditReady={!!auditReport}
        discrepanciesCount={auditReport?.discrepanciesCount}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'overview' && (
          <OverviewView
            selectedRoom={selectedRoom}
            modelStatus={modelStatus}
            lastReport={lastReport}
            onStartNewAudit={() => setActiveTab('scanner')}
            onNavigateToAudit={() => setActiveTab('audit')}
            onNavigateToSettings={() => setActiveTab('settings')}
          />
        )}

        {activeTab === 'scanner' && (
          <ScannerView
            selectedRoom={selectedRoom}
            modelStatus={modelStatus}
            modelError={modelError}
            onAnalysisComplete={handleAnalysisComplete}
            onNavigateToAudit={() => setActiveTab('audit')}
          />
        )}

        {activeTab === 'audit' && (
          auditReport ? (
            <AuditDashboardView
              report={auditReport}
              onUpdateManualOverride={handleUpdateManualOverride}
              onNavigateToReport={() => setActiveTab('report')}
              onNavigateToScanner={() => setActiveTab('scanner')}
            />
          ) : (
            <div className="bg-[#151D30] border border-[#222E47] rounded-3xl p-8 sm:p-12 text-center max-w-lg mx-auto my-12">
              <div className="w-16 h-16 rounded-2xl bg-[#0B1020] border border-[#222E47] flex items-center justify-center mx-auto mb-4 text-[#38D9E6]">
                <span className="text-2xl font-black">!</span>
              </div>
              <h3 className="text-base font-bold text-white mb-2">
                Aucun audit en cours pour {selectedRoom.name}
              </h3>
              <p className="text-xs text-slate-400 mb-6">
                Activez la caméra ou sélectionnez une image de test dans le scanner pour générer l'analyse comparative.
              </p>
              <button
                onClick={() => setActiveTab('scanner')}
                className="px-6 py-2.5 rounded-xl bg-[#38D9E6] text-[#0B1020] text-xs font-bold shadow-lg shadow-[#38D9E6]/20 hover:opacity-95 transition-all"
              >
                Ouvrir le Scanner IA
              </button>
            </div>
          )
        )}

        {activeTab === 'report' && (
          auditReport ? (
            <AuditReportView
              report={auditReport}
              imageSnapshotUrl={imageSnapshotUrl}
              onBackToAudit={() => setActiveTab('audit')}
            />
          ) : (
            <div className="bg-[#151D30] border border-[#222E47] rounded-3xl p-8 text-center max-w-md mx-auto my-12">
              <p className="text-xs text-slate-400 mb-4">Veuillez d'abord réaliser une analyse d'image.</p>
              <button
                onClick={() => setActiveTab('scanner')}
                className="px-4 py-2 rounded-xl bg-[#38D9E6] text-[#0B1020] text-xs font-bold"
              >
                Aller au Scanner
              </button>
            </div>
          )
        )}

        {activeTab === 'settings' && (
          <SettingsView
            rooms={rooms}
            selectedRoom={selectedRoom}
            onUpdateRooms={setRooms}
            onSelectRoom={handleSelectRoom}
            onLoadHistoricalAudit={handleLoadHistoricalAudit}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="no-print border-t border-[#222E47] py-4 bg-[#0B1020] text-center text-[11px] text-slate-500 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <span>EPITA SmartScan — Intelligent Classroom Auditing · GITM Promotion</span>
          <span>Inférence embarquée TensorFlow.js · Détection conforme RGPD (zéro stockage serveur)</span>
        </div>
      </footer>

      {/* Help Modal */}
      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  );
};

export default App;
