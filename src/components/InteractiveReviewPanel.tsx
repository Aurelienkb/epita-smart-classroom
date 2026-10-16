import React from 'react';
import { 
  Check, 
  X, 
  RefreshCw, 
  SlidersHorizontal, 
  Eye, 
  ChevronLeft, 
  ChevronRight,
  Info,
  ShieldCheck,
  Tag
} from 'lucide-react';
import { InteractiveDetection, EquipmentId } from '../types';
import { EQUIPMENT_CATALOG } from '../data/equipmentCatalog';

interface InteractiveReviewPanelProps {
  detections: InteractiveDetection[];
  selectedDetection: InteractiveDetection | null;
  onSelectDetection: (detection: InteractiveDetection | null) => void;
  onConfirmDetection: (id: string) => void;
  onRejectDetection: (id: string) => void;
  onReclassifyDetection: (id: string, newEquipmentId: EquipmentId) => void;
  onResetDetection: (id: string) => void;
}

export const InteractiveReviewPanel: React.FC<InteractiveReviewPanelProps> = ({
  detections,
  selectedDetection,
  onSelectDetection,
  onConfirmDetection,
  onRejectDetection,
  onReclassifyDetection,
  onResetDetection
}) => {
  if (detections.length === 0) return null;

  const confirmedCount = detections.filter(d => d.status === 'confirmed').length;
  const rejectedCount = detections.filter(d => d.status === 'rejected').length;
  const reclassifiedCount = detections.filter(d => d.status === 'reclassified').length;
  const pendingCount = detections.filter(d => d.status === 'detected').length;

  const selectedIndex = selectedDetection 
    ? detections.findIndex(d => d.id === selectedDetection.id)
    : -1;

  const handleNext = () => {
    if (detections.length === 0) return;
    const nextIdx = (selectedIndex + 1) % detections.length;
    onSelectDetection(detections[nextIdx]);
  };

  const handlePrev = () => {
    if (detections.length === 0) return;
    const prevIdx = (selectedIndex - 1 + detections.length) % detections.length;
    onSelectDetection(detections[prevIdx]);
  };

  return (
    <div className="bg-[#151D30] border border-[#222E47] rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4">
      
      {/* Header and Progress Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#222E47] pb-3">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <SlidersHorizontal className="w-4 h-4 text-[#38D9E6]" />
              <span>Interactive AI Review — Contrôle des Prédictions</span>
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#0B1020] text-[#38D9E6] border border-[#222E47]">
              Human-in-the-Loop
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Cliquez sur un cadre ou sélectionnez un objet ci-dessous pour confirmer, rejeter un faux positif ou reclasser.
          </p>
        </div>

        {/* Counter badges */}
        <div className="flex items-center space-x-2 text-[11px]">
          <span className="px-2 py-0.5 rounded-full bg-[#34D399]/20 text-[#34D399] font-semibold border border-[#34D399]/40" title="Validés par l'auditeur">
            {confirmedCount} validé(s)
          </span>
          <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/40" title="Faux positifs rejetés">
            {rejectedCount} rejeté(s)
          </span>
          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/40" title="Objets reclassés">
            {reclassifiedCount} reclassé(s)
          </span>
          {pendingCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-slate-700/50 text-slate-300 font-medium" title="En attente de revue">
              {pendingCount} restant(s)
            </span>
          )}
        </div>
      </div>

      {/* Selected Object Active Inspector Card */}
      {selectedDetection ? (
        <div className="bg-[#0B1020] border-2 border-[#38D9E6]/60 rounded-xl p-4 shadow-lg animate-fadeIn space-y-3">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#222E47]/70 pb-3">
            <div className="flex items-center space-x-3">
              <div 
                className="w-3.5 h-3.5 rounded-full shrink-0"
                style={{ backgroundColor: selectedDetection.color || '#38D9E6' }}
              ></div>
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="text-sm font-extrabold text-white">
                    {EQUIPMENT_CATALOG[selectedDetection.currentEquipmentId]?.labelFr || selectedDetection.labelFr}
                  </h4>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    selectedDetection.status === 'confirmed' ? 'bg-[#34D399]/20 text-[#34D399] border border-[#34D399]/40' :
                    selectedDetection.status === 'rejected' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                    selectedDetection.status === 'reclassified' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                    'bg-[#151D30] text-[#38D9E6] border border-[#222E47]'
                  }`}>
                    {selectedDetection.status === 'confirmed' && 'Validé par l\'humain'}
                    {selectedDetection.status === 'rejected' && 'Faux positif rejeté'}
                    {selectedDetection.status === 'reclassified' && 'Reclassé manuellement'}
                    {selectedDetection.status === 'detected' && 'Prédiction IA brute'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Prédiction brute modèle : <span className="text-slate-200 font-mono font-bold">{selectedDetection.originalClass}</span> · Confiance : <span className="text-[#38D9E6] font-bold">{Math.round(selectedDetection.score * 100)}%</span>
                </p>
              </div>
            </div>

            {/* Navigation controls */}
            <div className="flex items-center space-x-1.5 self-end sm:self-auto">
              <span className="text-xs text-slate-400 mr-2">
                {selectedIndex + 1} / {detections.length}
              </span>
              <button
                onClick={handlePrev}
                className="p-1.5 rounded-lg bg-[#151D30] hover:bg-[#1B253D] text-slate-300 hover:text-white border border-[#222E47]"
                title="Objet précédent"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                className="p-1.5 rounded-lg bg-[#151D30] hover:bg-[#1B253D] text-slate-300 hover:text-white border border-[#222E47]"
                title="Objet suivant"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center space-x-2">
              {/* Confirm button */}
              <button
                onClick={() => onConfirmDetection(selectedDetection.id)}
                className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedDetection.status === 'confirmed'
                    ? 'bg-[#34D399] text-[#0B1020] shadow-md shadow-[#34D399]/20'
                    : 'bg-[#151D30] hover:bg-[#34D399]/20 text-slate-200 hover:text-[#34D399] border border-[#222E47]'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>Confirmer</span>
              </button>

              {/* Reject False Positive button */}
              <button
                onClick={() => onRejectDetection(selectedDetection.id)}
                className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedDetection.status === 'rejected'
                    ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                    : 'bg-[#151D30] hover:bg-rose-500/20 text-slate-200 hover:text-rose-300 border border-[#222E47]'
                }`}
              >
                <X className="w-4 h-4" />
                <span>Rejeter (Faux positif)</span>
              </button>

              {selectedDetection.status !== 'detected' && (
                <button
                  onClick={() => onResetDetection(selectedDetection.id)}
                  className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-white transition-colors"
                >
                  Rétablir l'état brut
                </button>
              )}
            </div>

            {/* Reclassify Dropdown */}
            <div className="flex items-center space-x-2">
              <Tag className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="text-[11px] text-slate-400">Corriger en :</span>
              <select
                value={selectedDetection.currentEquipmentId}
                onChange={(e) => onReclassifyDetection(selectedDetection.id, e.target.value as EquipmentId)}
                className="bg-[#151D30] text-slate-200 border border-[#222E47] hover:border-amber-400/50 rounded-lg px-2.5 py-1 text-xs font-semibold focus:outline-none cursor-pointer"
              >
                {Object.values(EQUIPMENT_CATALOG).map((eq) => (
                  <option key={eq.id} value={eq.id} className="bg-[#151D30] text-slate-100">
                    {eq.labelFr}
                  </option>
                ))}
              </select>
            </div>
          </div>

        </div>
      ) : (
        <div className="p-3 rounded-xl bg-[#0B1020]/60 border border-[#222E47] text-center text-xs text-slate-400 flex items-center justify-center space-x-2">
          <Eye className="w-4 h-4 text-[#38D9E6]" />
          <span>Touchez ou cliquez sur une boîte englobante dans l'image pour la contrôler et la modifier.</span>
        </div>
      )}

      {/* Interactive Filmstrip of all detected items */}
      <div className="space-y-1.5">
        <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
          Liste sélective des objets détectés ({detections.length})
        </p>
        <div className="flex space-x-2 overflow-x-auto pb-2 pt-1 scrollbar-thin">
          {detections.map((det, idx) => {
            const isSelected = selectedDetection?.id === det.id;
            const currentCat = EQUIPMENT_CATALOG[det.currentEquipmentId];
            return (
              <button
                key={det.id}
                onClick={() => onSelectDetection(det)}
                className={`shrink-0 flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs transition-all ${
                  isSelected 
                    ? 'bg-[#1B253D] border-[#38D9E6] ring-1 ring-[#38D9E6] text-white shadow-md' 
                    : det.status === 'rejected'
                      ? 'bg-[#0B1020]/40 border-rose-500/30 text-rose-300 line-through opacity-50'
                      : det.status === 'confirmed'
                        ? 'bg-[#0B1020] border-[#34D399]/40 text-[#34D399]'
                        : det.status === 'reclassified'
                          ? 'bg-[#0B1020] border-amber-400/40 text-amber-300'
                          : 'bg-[#0B1020] border-[#222E47] text-slate-300 hover:border-slate-500'
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-[#151D30] text-[10px] font-mono flex items-center justify-center font-bold text-slate-400">
                  {idx + 1}
                </span>
                <span className="font-semibold">
                  {currentCat ? currentCat.labelFr.split('/')[0] : det.labelFr}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {Math.round(det.score * 100)}%
                </span>
                {det.status === 'confirmed' && <Check className="w-3 h-3 text-[#34D399]" />}
                {det.status === 'rejected' && <X className="w-3 h-3 text-rose-400" />}
                {det.status === 'reclassified' && <RefreshCw className="w-3 h-3 text-amber-400" />}
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
};
