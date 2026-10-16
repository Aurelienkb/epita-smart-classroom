import React from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  HelpCircle, 
  Info, 
  Cpu, 
  BarChart2, 
  CheckCircle2, 
  EyeOff, 
  Maximize2,
  Sparkles
} from 'lucide-react';
import { AuditReportData, InteractiveDetection } from '../types';
import { EQUIPMENT_CATALOG } from '../data/equipmentCatalog';

interface AIReliabilityCenterProps {
  report: AuditReportData;
  detections: InteractiveDetection[];
}

export const AIReliabilityCenter: React.FC<AIReliabilityCenterProps> = ({
  report,
  detections
}) => {
  // Confidence score tiers (rigorously described as internal model activation scores, not ground-truth probabilities)
  const highConfidence = detections.filter(d => d.score >= 0.70).length;
  const moderateConfidence = detections.filter(d => d.score >= 0.40 && d.score < 0.70).length;
  const lowConfidence = detections.filter(d => d.score < 0.40).length;

  const retainedCount = detections.filter(d => d.status !== 'rejected').length;
  const rejectedCount = detections.filter(d => d.status === 'rejected').length;
  const reclassifiedCount = detections.filter(d => d.status === 'reclassified').length;

  const unsupportedItems = report.items.filter(i => !i.supportedByModel);
  const unverifiedUnsupported = unsupportedItems.filter(i => !i.manuallyVerified);

  return (
    <div className="bg-[#151D30] border border-[#222E47] rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6">
      
      {/* Title Header */}
      <div className="border-b border-[#222E47] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-[#0B1020] border border-[#38D9E6]/30 text-[#38D9E6]">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Centre de Fiabilité & Explicabilité IA (AI Reliability Center)
              </h3>
              <p className="text-xs text-slate-400">
                Diagnostic de transparence algorithmique, distribution des scores et limites opérationnelles
              </p>
            </div>
          </div>
        </div>

        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#0B1020] border border-[#222E47] text-xs font-semibold text-slate-300">
          <ShieldCheck className="w-4 h-4 text-[#34D399]" />
          <span>Gouvernance IA GITM</span>
        </div>
      </div>

      {/* Critical Educational Note: Calibration Warning */}
      <div className="bg-[#0B1020] border border-amber-500/30 rounded-2xl p-4 flex items-start space-x-3 text-xs text-slate-300">
        <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-amber-300">Note managériale sur les scores de confiance : </strong>
          Les pourcentages affichés par le réseau de neurones correspondent à la probabilité softmax de la boîte englobante au sein de son espace d'apprentissage, et <strong>non à une probabilité calibrée d'exactitude absolue sur le terrain</strong>. Un score de 85% peut exceptionnellement masquer un faux positif (ex. dossier de chaise confondu avec un bureau), tandis qu'un objet à 30% peut être parfaitement réel mais éloigné ou sous un éclairage oblique.
        </div>
      </div>

      {/* Grid: Confidence Distribution & Human Revision Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Confidence Spectrum Card */}
        <div className="bg-[#0B1020]/70 border border-[#222E47] rounded-2xl p-4 space-y-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
            <BarChart2 className="w-4 h-4 text-[#38D9E6]" />
            <span>Distribution des Scores de Confiance ({detections.length} détections brutes)</span>
          </h4>

          <div className="space-y-2.5 pt-1">
            {/* High confidence */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">Activation Forte (Score ≥ 70%)</span>
                <span className="font-bold text-[#34D399]">{highConfidence} détection(s)</span>
              </div>
              <div className="w-full bg-[#151D30] h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-[#34D399] h-full rounded-full transition-all duration-300"
                  style={{ width: `${detections.length ? (highConfidence / detections.length) * 100 : 0}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Mobilier au premier plan, silhouettes distinctes et non occultées.</p>
            </div>

            {/* Moderate confidence */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">Activation Modérée (40% - 69%)</span>
                <span className="font-bold text-[#38D9E6]">{moderateConfidence} détection(s)</span>
              </div>
              <div className="w-full bg-[#151D30] h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-[#38D9E6] h-full rounded-full transition-all duration-300"
                  style={{ width: `${detections.length ? (moderateConfidence / detections.length) * 100 : 0}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Mobilier partiellement occulté par les rangées ou angles obliques.</p>
            </div>

            {/* Low confidence */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">Activation Basse (&lt; 40%)</span>
                <span className="font-bold text-amber-400">{lowConfidence} détection(s)</span>
              </div>
              <div className="w-full bg-[#151D30] h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-amber-400 h-full rounded-full transition-all duration-300"
                  style={{ width: `${detections.length ? (lowConfidence / detections.length) * 100 : 0}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Chaises éloignées au fond de salle révélées par le mode Boost IA & Tuilage SAHI.</p>
            </div>
          </div>
        </div>

        {/* Human Review Diagnostics Card */}
        <div className="bg-[#0B1020]/70 border border-[#222E47] rounded-2xl p-4 space-y-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-[#34D399]" />
            <span>Contrôle & Arbitrage Humain</span>
          </h4>

          <div className="grid grid-cols-3 gap-2 text-center pt-1">
            <div className="p-3 rounded-xl bg-[#151D30] border border-[#222E47]">
              <span className="text-[10px] text-slate-400">Prédictions conservées</span>
              <p className="text-xl font-black text-[#34D399] mt-0.5">{retainedCount}</p>
              <span className="text-[9px] text-slate-400">dans l'audit</span>
            </div>

            <div className="p-3 rounded-xl bg-[#151D30] border border-[#222E47]">
              <span className="text-[10px] text-slate-400">Faux positifs rejetés</span>
              <p className="text-xl font-black text-rose-400 mt-0.5">{rejectedCount}</p>
              <span className="text-[9px] text-slate-400">annulés</span>
            </div>

            <div className="p-3 rounded-xl bg-[#151D30] border border-[#222E47]">
              <span className="text-[10px] text-slate-400">Catégories corrigées</span>
              <p className="text-xl font-black text-amber-400 mt-0.5">{reclassifiedCount}</p>
              <span className="text-[9px] text-slate-400">reclassées</span>
            </div>
          </div>

          <div className="pt-2 text-[11px] text-slate-300 space-y-1.5 border-t border-[#222E47]/70">
            <div className="flex justify-between">
              <span className="text-slate-400">Taux de conservation des prédictions :</span>
              <span className="font-bold text-white">
                {detections.length > 0 ? Math.round((retainedCount / detections.length) * 100) : 0}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Statut du contrôle humain :</span>
              <span className="font-bold text-[#38D9E6]">
                {rejectedCount + reclassifiedCount > 0 ? 'Révision active effectuée' : 'Conforme aux prédictions brutes'}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Model Scope & Physical Boundaries */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        
        {/* Classes Supported */}
        <div className="p-4 rounded-2xl bg-[#0B1020]/60 border border-[#222E47] space-y-2">
          <h5 className="font-bold text-[#38D9E6] flex items-center space-x-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Périmètre Modèle Pris en Charge</span>
          </h5>
          <p className="text-[11px] text-slate-400 leading-snug">
            Chaises, bancs d'amphithéâtre, tables de cours, bureaux d'élèves, ordinateurs portables, écrans muraux, claviers, souris, tableaux (par vision géométrique).
          </p>
        </div>

        {/* Classes NOT Supported */}
        <div className="p-4 rounded-2xl bg-[#0B1020]/60 border border-[#222E47] space-y-2">
          <h5 className="font-bold text-amber-400 flex items-center space-x-1.5">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Éléments Hors Périmètre IA</span>
          </h5>
          <p className="text-[11px] text-slate-400 leading-snug">
            Fenêtres et vitrages, vidéoprojecteurs de plafond, prises murales. Ces éléments nécessitent un visa manuel de l'auditeur.
          </p>
        </div>

        {/* Physical Perspective Limits */}
        <div className="p-4 rounded-2xl bg-[#0B1020]/60 border border-[#222E47] space-y-2">
          <h5 className="font-bold text-rose-300 flex items-center space-x-1.5">
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Limites d'Occultation & Cadrage</span>
          </h5>
          <p className="text-[11px] text-slate-400 leading-snug">
            Une prise de vue 2D unique ne peut pas traverser les rangées occultées. Une absence de détection ne constitue jamais une preuve d'absence physique.
          </p>
        </div>

      </div>

    </div>
  );
};
