import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  CameraOff, 
  Upload, 
  Sparkles, 
  Sliders, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  ShieldAlert, 
  ArrowRight,
  Maximize2,
  Image as ImageIcon,
  SwitchCamera,
  Zap,
  LayoutGrid
} from 'lucide-react';
import { ClassroomRoom, EquipmentId, InteractiveDetection } from '../types';
import { visionAIService, DetectionOutput, ModelStatus } from '../services/aiVision';
import { renderBoundingBoxes, getDetectionAtPoint } from '../utils/canvasRenderer';
import { SAMPLE_IMAGES, SampleImage } from '../data/sampleImages';
import { GuidedScanOverlay } from './GuidedScanOverlay';
import { InteractiveReviewPanel } from './InteractiveReviewPanel';
import { EQUIPMENT_CATALOG } from '../data/equipmentCatalog';

interface ScannerViewProps {
  selectedRoom: ClassroomRoom;
  modelStatus: ModelStatus;
  modelError?: string;
  interactiveDetections: InteractiveDetection[];
  selectedDetection: InteractiveDetection | null;
  onSelectDetection: (detection: InteractiveDetection | null) => void;
  onConfirmDetection: (id: string) => void;
  onRejectDetection: (id: string) => void;
  onReclassifyDetection: (id: string, newEquipmentId: EquipmentId) => void;
  onResetDetection: (id: string) => void;
  onAnalysisComplete: (output: DetectionOutput, imageSnapshotUrl?: string) => void;
  onNavigateToAudit: () => void;
}

export const ScannerView: React.FC<ScannerViewProps> = ({
  selectedRoom,
  modelStatus,
  modelError,
  interactiveDetections,
  selectedDetection,
  onSelectDetection,
  onConfirmDetection,
  onRejectDetection,
  onReclassifyDetection,
  onResetDetection,
  onAnalysisComplete,
  onNavigateToAudit
}) => {
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(0.28);
  const [boostContrast, setBoostContrast] = useState<boolean>(true);
  const [enableSahi, setEnableSahi] = useState<boolean>(true);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [lastOutput, setLastOutput] = useState<DetectionOutput | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [currentImageSrc, setCurrentImageSrc] = useState<string | null>(null);
  const [selectedSampleId, setSelectedSampleId] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const imageElementRef = useRef<HTMLImageElement | null>(null);
  const frozenSourceRef = useRef<HTMLImageElement | HTMLVideoElement | HTMLCanvasElement | null>(null);

  // Re-render canvas bounding boxes whenever interactive detections or selection changes
  useEffect(() => {
    if (canvasRef.current && frozenSourceRef.current && interactiveDetections.length > 0) {
      renderBoundingBoxes(
        canvasRef.current,
        frozenSourceRef.current,
        interactiveDetections,
        selectedDetection?.id
      );
    }
  }, [interactiveDetections, selectedDetection]);

  // Canvas tap / click hit testing to select bounding boxes directly on the image
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || interactiveDetections.length === 0) return;
    const clickedDet = getDetectionAtPoint(
      canvasRef.current,
      interactiveDetections,
      e.clientX,
      e.clientY
    );
    onSelectDetection(clickedDet);
  };

  // Initialize camera stream
  const startCamera = async () => {
    setCameraError(null);
    stopCamera();

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setCameraActive(true);
      setCurrentImageSrc(null);
      setSelectedSampleId(null);
    } catch (err: unknown) {
      console.error('Camera access error:', err);
      let message = 'Impossible d\'accéder à la caméra.';
      if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          message = 'Autorisation caméra refusée. Vous pouvez utiliser l\'import d\'image ou les clichés de démonstration.';
        } else if (err.name === 'NotFoundError') {
          message = 'Aucune caméra détectée sur cet appareil.';
        }
      }
      setCameraError(message);
      setCameraActive(false);
    }
  };

  // Teardown camera stream
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  // Switch between front and back camera
  const toggleFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    if (cameraActive) {
      setTimeout(() => startCamera(), 100);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Perform object detection on current frozen image or video frame
  const handleAnalyze = async () => {
    if (isAnalyzing) return;
    setIsAnalyzing(true);

    try {
      let sourceElement: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement | null = null;

      if (cameraActive && videoRef.current) {
        // Freeze frame into an offscreen canvas for interactive review
        const freezeCanvas = document.createElement('canvas');
        freezeCanvas.width = videoRef.current.videoWidth || 1280;
        freezeCanvas.height = videoRef.current.videoHeight || 720;
        const fctx = freezeCanvas.getContext('2d');
        if (fctx) {
          fctx.drawImage(videoRef.current, 0, 0);
          sourceElement = freezeCanvas;
          const dataUrl = freezeCanvas.toDataURL('image/jpeg', 0.9);
          stopCamera();
          setCurrentImageSrc(dataUrl);
        } else {
          sourceElement = videoRef.current;
        }
      } else if (imageElementRef.current) {
        sourceElement = imageElementRef.current;
      }

      if (!sourceElement) {
        throw new Error('Veuillez activer la caméra ou sélectionner une image de test avant de lancer l\'analyse.');
      }

      frozenSourceRef.current = sourceElement;

      // Execute genuine detection with optional adaptive contrast boost and SAHI multi-tile
      const output = await visionAIService.detect(sourceElement, confidenceThreshold, boostContrast, enableSahi);

      // Render bounding boxes onto visual canvas
      if (canvasRef.current) {
        renderBoundingBoxes(canvasRef.current, sourceElement, output.detections, selectedDetection?.id);
      }

      setLastOutput(output);

      // Create snapshot URL for report
      let snapshotUrl: string | undefined;
      if (canvasRef.current) {
        snapshotUrl = canvasRef.current.toDataURL('image/jpeg', 0.85);
      }

      onAnalysisComplete(output, snapshotUrl);
    } catch (err: unknown) {
      console.error('Detection failed:', err);
      alert(err instanceof Error ? err.message : 'Erreur lors de l\'analyse');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Load sample test image
  const handleSelectSample = (sample: SampleImage) => {
    stopCamera();
    setSelectedSampleId(sample.id);
    setCurrentImageSrc(sample.url);
  };

  // Handle local file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    stopCamera();
    setSelectedSampleId(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setCurrentImageSrc(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Trigger analysis when sample image is loaded into DOM
  const handleImageLoaded = () => {
    if (imageElementRef.current && canvasRef.current) {
      frozenSourceRef.current = imageElementRef.current;
      // Clear canvas before running detection
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = imageElementRef.current.naturalWidth;
        canvas.height = imageElementRef.current.naturalHeight;
        ctx.drawImage(imageElementRef.current, 0, 0);
      }
      handleAnalyze();
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Top Banner & Guided Scan */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#151D30] border border-[#222E47] p-4 rounded-2xl">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-base sm:text-lg font-bold text-white">
              Scanner Visuel Intelligent
            </h2>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#38D9E6]/10 text-[#38D9E6] border border-[#38D9E6]/30">
              Salle ciblée : {selectedRoom.code}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Capturez un cliché ponctuel pour analyser les équipements présents avec le modèle COCO-SSD.
          </p>
        </div>

        <GuidedScanOverlay />
      </div>

      {/* Camera Access Error Alert */}
      {cameraError && (
        <div className="flex items-start space-x-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs animate-fadeIn">
          <AlertCircle className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-amber-200">Accès caméra indisponible</p>
            <p className="mt-0.5">{cameraError}</p>
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => handleSelectSample(SAMPLE_IMAGES[0])}
                className="px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 font-medium text-amber-200 transition-colors"
              >
                Utiliser le cliché de démo (Salle 104)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Model Error Alert */}
      {modelStatus === 'error' && (
        <div className="flex items-center space-x-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
          <div>
            <p className="font-semibold text-rose-200">Échec d'initialisation de l'IA</p>
            <p className="mt-0.5">{modelError || 'Impossible de charger le modèle de vision artificielle.'}</p>
          </div>
        </div>
      )}

      {/* Main Viewport Card */}
      <div className="relative bg-[#0B1020] border border-[#222E47] rounded-2xl overflow-hidden shadow-2xl">
        
        {/* Viewport Header Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-[#151D30]/80 border-b border-[#222E47]">
          {/* Source toggles */}
          <div className="flex items-center space-x-2">
            {!cameraActive ? (
              <button
                onClick={startCamera}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#38D9E6] text-[#0B1020] font-semibold text-xs hover:bg-[#38D9E6]/90 transition-all shadow-md shadow-[#38D9E6]/10"
              >
                <Camera className="w-4 h-4" />
                <span>Activer Caméra</span>
              </button>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={stopCamera}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold text-xs hover:bg-rose-500/30 transition-all"
                >
                  <CameraOff className="w-4 h-4" />
                  <span>Arrêter Caméra</span>
                </button>
                <button
                  onClick={toggleFacingMode}
                  title="Basculer caméra avant / arrière"
                  className="p-1.5 rounded-lg bg-[#151D30] border border-[#222E47] text-slate-300 hover:text-white"
                >
                  <SwitchCamera className="w-4 h-4" />
                </button>
              </div>
            )}

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#151D30] hover:bg-[#1B253D] border border-[#222E47] text-slate-300 hover:text-white font-medium text-xs transition-colors"
            >
              <Upload className="w-4 h-4 text-[#38D9E6]" />
              <span className="hidden sm:inline">Importer Cliché</span>
              <span className="sm:hidden">Photo</span>
            </button>
            <input 
              ref={fileInputRef} 
              type="file" 
              accept="image/*" 
              onChange={handleFileUpload} 
              className="hidden" 
            />
          </div>

          {/* Right Toolbar: Boost IA & Sensitivity Slider */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setBoostContrast(!boostContrast)}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all ${
                boostContrast 
                  ? 'bg-[#38D9E6]/20 border-[#38D9E6] text-[#38D9E6]' 
                  : 'bg-[#0B1020] border-[#222E47] text-slate-400 hover:text-white'
              }`}
              title="Activer le prétraitement adaptatif pour détacher le mobilier sombre"
            >
              <Zap className={`w-3.5 h-3.5 ${boostContrast ? 'fill-[#38D9E6]' : ''}`} />
              <span className="hidden sm:inline">Boost IA</span>
            </button>

            <button
              onClick={() => setEnableSahi(!enableSahi)}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all ${
                enableSahi 
                  ? 'bg-[#34D399]/20 border-[#34D399] text-[#34D399]' 
                  : 'bg-[#0B1020] border-[#222E47] text-slate-400 hover:text-white'
              }`}
              title="Tuilage Haute Définition (SAHI) : Découpe l'image en 4 quadrants pour détecter les chaises et tables éloignées avec 4x plus de résolution"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tuilage HD (SAHI)</span>
              <span className="sm:hidden">SAHI</span>
            </button>

            {/* Threshold Slider */}
            <div className="flex items-center space-x-2 bg-[#0B1020] px-3 py-1 rounded-lg border border-[#222E47]">
              <Sliders className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap">
                Sensibilité : <span className="text-[#38D9E6] font-bold">{Math.round(confidenceThreshold * 100)}%</span>
              </span>
              <input
                type="range"
                min="0.15"
                max="0.75"
                step="0.05"
                value={confidenceThreshold}
                onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
                className="w-18 sm:w-24 h-1.5 bg-[#222E47] rounded-lg appearance-none cursor-pointer accent-[#38D9E6]"
                title="Abaisser le seuil pour détecter davantage d'équipements en arrière-plan"
              />
            </div>
          </div>
        </div>

        {/* Viewport Canvas & Video Display Area */}
        <div className="relative min-h-[340px] sm:min-h-[460px] max-h-[580px] bg-slate-950 flex items-center justify-center overflow-hidden">
          
          {/* Live Video Element */}
          <video
            ref={videoRef}
            playsInline
            muted
            className={`w-full h-full object-contain ${cameraActive && !lastOutput ? 'block' : 'hidden'}`}
          />

          {/* Hidden Image Element for File/Sample Loading */}
          {currentImageSrc && (
            <img
              ref={imageElementRef}
              src={currentImageSrc}
              alt="Cliché de salle"
              onLoad={handleImageLoaded}
              className="hidden"
            />
          )}

          {/* Annotation Canvas (Renders image + bounding boxes) */}
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            className={`w-full h-full object-contain max-h-[580px] ${
              interactiveDetections.length > 0 ? 'cursor-pointer' : ''
            } ${(!cameraActive || lastOutput) && currentImageSrc || lastOutput ? 'block' : 'hidden'}`}
            title={interactiveDetections.length > 0 ? 'Cliquez sur un objet pour l\'examiner ou le corriger' : ''}
          />

          {/* Interactive Click Helper Pill */}
          {interactiveDetections.length > 0 && !isAnalyzing && (
            <div className="absolute top-3 right-3 bg-[#0B1020]/90 border border-[#38D9E6]/50 text-[#38D9E6] px-3 py-1 rounded-full text-[11px] font-semibold backdrop-blur-md flex items-center space-x-1.5 shadow-lg pointer-events-none">
              <span className="w-2 h-2 rounded-full bg-[#38D9E6] animate-pulse"></span>
              <span>Cliquez sur une boîte pour réviser</span>
            </div>
          )}

          {/* Fallback Empty State Placeholder */}
          {!cameraActive && !currentImageSrc && !lastOutput && (
            <div className="text-center p-8 max-w-sm">
              <div className="w-16 h-16 rounded-2xl bg-[#151D30] border border-[#222E47] flex items-center justify-center mx-auto mb-4 text-[#38D9E6]">
                <ImageIcon className="w-8 h-8 opacity-80" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1">
                Aucune image en cours d'analyse
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Activez la caméra de votre smartphone ou chargez un des clichés étalons ci-dessous pour lancer l'audit IA.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <button
                  onClick={startCamera}
                  className="px-4 py-2 rounded-xl bg-[#38D9E6] text-[#0B1020] font-semibold text-xs shadow-lg shadow-[#38D9E6]/20"
                >
                  Démarrer la caméra
                </button>
                <button
                  onClick={() => handleSelectSample(SAMPLE_IMAGES[0])}
                  className="px-4 py-2 rounded-xl bg-[#151D30] border border-[#222E47] text-slate-200 hover:text-white font-medium text-xs"
                >
                  Charger Démo Salle 104
                </button>
              </div>
            </div>
          )}

          {/* Scanning Radar Line Animation when active */}
          {cameraActive && !lastOutput && (
            <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#38D9E6] to-transparent shadow-[0_0_15px_#38D9E6] animate-scanline pointer-events-none"></div>
          )}

          {/* Analyzing Spinner Overlay */}
          {isAnalyzing && (
            <div className="absolute inset-0 bg-[#0B1020]/75 backdrop-blur-sm flex flex-col items-center justify-center z-20">
              <div className="relative">
                <div className="w-14 h-14 rounded-full border-4 border-[#38D9E6]/20 border-t-[#38D9E6] animate-spin"></div>
                <Sparkles className="w-6 h-6 text-[#38D9E6] absolute inset-0 m-auto" />
              </div>
              <p className="text-white text-xs font-semibold mt-4">Inférence TensorFlow.js (COCO-SSD) en cours...</p>
              <p className="text-[11px] text-slate-400 mt-1">Filtrage éthique des personnes actif</p>
            </div>
          )}

          {/* Privacy Filtering Banner Badge */}
          {lastOutput && lastOutput.filteredPersonsCount > 0 && (
            <div className="absolute top-3 left-3 bg-[#0B1020]/90 border border-amber-500/40 text-amber-300 px-3 py-1 rounded-full text-[11px] font-medium flex items-center space-x-1.5 backdrop-blur-md">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>{lastOutput.filteredPersonsCount} silhouette(s) humaine(s) ignorée(s) (RGPD)</span>
            </div>
          )}

          {/* Bottom Floating Action Bar over canvas */}
          {(cameraActive || currentImageSrc) && (
            <div className="absolute bottom-4 inset-x-0 flex justify-center items-center px-4 z-10">
              <div className="bg-[#0B1020]/90 backdrop-blur-md border border-[#222E47] rounded-2xl p-2 shadow-2xl flex items-center space-x-2">
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#38D9E6] to-[#34D399] text-[#0B1020] font-bold text-xs sm:text-sm hover:opacity-95 transition-all shadow-lg shadow-[#38D9E6]/20 disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{cameraActive ? 'Capturer & Analyser' : 'Réanalyser le Cliché'}</span>
                </button>

                {lastOutput && (
                  <button
                    onClick={onNavigateToAudit}
                    className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-[#151D30] hover:bg-[#1B253D] text-white border border-[#38D9E6]/40 font-semibold text-xs sm:text-sm transition-all"
                  >
                    <span>Voir l'Audit & Écarts</span>
                    <ArrowRight className="w-4 h-4 text-[#38D9E6]" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Real Detection Summary Results Strip */}
        {lastOutput && (
          <div className="p-4 bg-[#151D30] border-t border-[#222E47]">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-[#34D399]" />
                <span className="text-xs font-bold text-white">
                  Détection réelle terminée : {lastOutput.totalCount} équipement(s) identifié(s)
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#0B1020] text-slate-400 border border-[#222E47]">
                  Latence : {lastOutput.inferenceTimeMs} ms
                </span>
                {lastOutput.sahiEnabled && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#34D399]/20 text-[#34D399] border border-[#34D399]/40 font-semibold">
                    Tuilage SAHI Actif (Inférence 4 Quadrants)
                  </span>
                )}
              </div>

              <button
                onClick={onNavigateToAudit}
                className="text-xs text-[#38D9E6] hover:underline font-semibold flex items-center space-x-1"
              >
                <span>Accéder au comparatif détaillé</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Chips per detected equipment category */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
              {(Object.keys(lastOutput.counts) as EquipmentId[]).map((key) => {
                const catalog = EQUIPMENT_CATALOG[key];
                if (!catalog) return null;

                const initialCount = interactiveDetections.filter(d => d.originalEquipmentId === key).length;
                const activeCount = interactiveDetections.filter(d => d.currentEquipmentId === key && d.status !== 'rejected').length;
                const rejectedCount = interactiveDetections.filter(d => d.originalEquipmentId === key && d.status === 'rejected').length;
                const reclassifiedIn = interactiveDetections.filter(d => d.currentEquipmentId === key && d.originalEquipmentId !== key && d.status === 'reclassified').length;

                if (!catalog.supportedByModel && activeCount === 0 && initialCount === 0) return null;

                const expected = selectedRoom.expectedConfig[key] || 0;
                const isDiscrepant = activeCount !== expected;

                return (
                  <div 
                    key={key}
                    className={`p-2.5 rounded-xl border text-xs transition-all ${
                      activeCount > 0 
                        ? 'bg-[#0B1020] border-[#38D9E6]/40' 
                        : 'bg-[#0B1020]/40 border-[#222E47] opacity-60'
                    }`}
                  >
                    <div className="flex justify-between items-center text-slate-400 text-[11px]">
                      <span className="truncate">{catalog.labelFr.split('/')[0]}</span>
                      {activeCount > 0 && (
                        <span className="text-[#38D9E6] font-semibold text-[10px]">
                          {lastOutput.averageConfidenceByEquipment[key] || 0}%
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex items-baseline justify-between">
                      <span className="text-base font-extrabold text-white">
                        {activeCount} <span className="text-[10px] font-normal text-slate-400">validé(s)</span>
                      </span>
                      <span className={`text-[10px] font-medium px-1.5 py-0.2 rounded ${
                        isDiscrepant ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                      }`}>
                        Cible: {expected}
                      </span>
                    </div>
                    {(rejectedCount > 0 || reclassifiedIn > 0) && (
                      <div className="mt-1 flex items-center space-x-1 text-[9px]">
                        {rejectedCount > 0 && (
                          <span className="text-rose-400">-{rejectedCount} faux positif</span>
                        )}
                        {reclassifiedIn > 0 && (
                          <span className="text-amber-400">+{reclassifiedIn} reclassé</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* Interactive AI Review Component (Amélioration prioritaire) */}
      {interactiveDetections.length > 0 && (
        <InteractiveReviewPanel
          detections={interactiveDetections}
          selectedDetection={selectedDetection}
          onSelectDetection={onSelectDetection}
          onConfirmDetection={onConfirmDetection}
          onRejectDetection={onRejectDetection}
          onReclassifyDetection={onReclassifyDetection}
          onResetDetection={onResetDetection}
        />
      )}

      {/* Preset Sample Gallery Card */}
      <div className="bg-[#151D30] border border-[#222E47] p-4 sm:p-5 rounded-2xl">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <ImageIcon className="w-4 h-4 text-[#38D9E6]" />
              <span>Jeux de test & Scénarios d'évaluation étalons</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Images pré-intégrées pour évaluer immédiatement la précision de détection et les règles d'audit.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {SAMPLE_IMAGES.map((sample) => {
            const isSelected = selectedSampleId === sample.id;
            return (
              <div
                key={sample.id}
                onClick={() => handleSelectSample(sample)}
                className={`group cursor-pointer rounded-xl border overflow-hidden p-3 transition-all flex flex-col justify-between ${
                  isSelected 
                    ? 'bg-[#1B253D] border-[#38D9E6] ring-1 ring-[#38D9E6]' 
                    : 'bg-[#0B1020] border-[#222E47] hover:border-[#38D9E6]/50'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <img
                    src={sample.url}
                    alt={sample.name}
                    className="w-16 h-16 rounded-lg object-cover border border-[#222E47] shrink-0"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-[#38D9E6] transition-colors">
                      {sample.name}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">
                      {sample.description}
                    </p>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-[#222E47] flex items-center justify-between text-[10px]">
                  <span className={`px-2 py-0.5 rounded font-medium ${
                    sample.scenarioType === 'nominal' 
                      ? 'bg-emerald-500/10 text-emerald-300' 
                      : 'bg-amber-500/10 text-amber-300'
                  }`}>
                    {sample.category}
                  </span>
                  <span className="text-[#38D9E6] font-semibold flex items-center space-x-1">
                    <span>Tester</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
