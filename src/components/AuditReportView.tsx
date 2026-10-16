import React, { useState } from 'react';
import { 
  Printer, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  UserCheck, 
  ShieldCheck, 
  Save, 
  ArrowLeft,
  Building2,
  Calendar,
  User,
  Sliders,
  Check,
  FileCheck2,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AuditReportData } from '../types';
import { saveAuditToHistory } from '../services/auditEngine';

interface AuditReportViewProps {
  report: AuditReportData;
  imageSnapshotUrl?: string;
  onBackToAudit: () => void;
}

export const AuditReportView: React.FC<AuditReportViewProps> = ({
  report,
  imageSnapshotUrl,
  onBackToAudit
}) => {
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleSaveHistory = () => {
    saveAuditToHistory(report);
    setSavedSuccess(true);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 }
    });
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      
      {/* Top Action Bar (Hidden when printing) */}
      <div className="no-print bg-[#151D30] border border-[#222E47] p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-xl">
        <button
          onClick={onBackToAudit}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#0B1020] hover:bg-[#1B253D] border border-[#222E47] text-slate-300 text-xs font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour à la révision interactive</span>
        </button>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleSaveHistory}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
              savedSuccess 
                ? 'bg-[#34D399]/20 text-[#34D399] border-[#34D399]' 
                : 'bg-[#0B1020] hover:bg-[#1B253D] text-slate-200 border-[#222E47]'
            }`}
          >
            {savedSuccess ? <Check className="w-4 h-4 text-[#34D399]" /> : <Save className="w-4 h-4 text-[#38D9E6]" />}
            <span>{savedSuccess ? 'Enregistré dans l\'Historique' : 'Sauvegarder l\'Audit'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-[#38D9E6] text-[#0B1020] text-xs font-bold shadow-lg shadow-[#38D9E6]/20 hover:opacity-95 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimer / Exporter en PDF</span>
          </button>
        </div>
      </div>

      {/* Main Printable University Infrastructure Report */}
      <div className="bg-[#151D30] print-card border border-[#222E47] rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8 text-slate-200 print-text-dark">
        
        {/* Document Official Header */}
        <div className="border-b-2 border-[#222E47] pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-white print-text-dark">
                EPITA <span className="text-[#38D9E6]">SmartScan</span>
              </span>
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-[#0B1020] text-[#38D9E6] border border-[#222E47] print-card">
                LIVRABLE D'AUDIT D'INFRASTRUCTURE
              </span>
            </div>
            <p className="text-xs text-slate-400 print-text-muted mt-1">
              Direction des Moyens Généraux & Campus · Spécialisation Ingénierie GITM
            </p>
          </div>

          <div className="sm:text-right font-mono text-xs">
            <p className="font-bold text-[#38D9E6] print-text-dark">
              RÉF : {report.id}
            </p>
            <p className="text-[11px] text-slate-400 print-text-muted mt-0.5">
              Horodatage : {report.timestamp}
            </p>
          </div>
        </div>

        {/* Executive Summary Section */}
        <div className="p-5 rounded-2xl bg-[#0B1020]/70 print-card border border-[#222E47] space-y-3 print-break-inside-avoid">
          <div className="flex items-center justify-between border-b border-[#222E47] pb-2">
            <h3 className="text-xs font-bold text-white print-text-dark uppercase tracking-wider flex items-center space-x-2">
              <FileCheck2 className="w-4 h-4 text-[#38D9E6]" />
              <span>Synthèse Exécutive de l'Audit</span>
            </h3>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
              report.globalStatus === 'CONFORME'
                ? 'bg-[#34D399]/20 text-[#34D399] border border-[#34D399]/40'
                : report.globalStatus === 'ATTENTION_ECART'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
            }`}>
              {report.globalStatus === 'CONFORME' && 'STATUT : CONFORME'}
              {report.globalStatus === 'ATTENTION_ECART' && 'STATUT : RÉSERVES — ÉCARTS CONSTATÉS'}
              {report.globalStatus === 'VERIFICATION_REQUISE' && 'STATUT : VÉRIFICATION IN-SITU REQUISE'}
            </span>
          </div>

          <p className="text-xs text-slate-300 print-text-dark leading-relaxed">
            L'audit de la salle <strong>{report.room.name}</strong> ({report.room.code}) a été conduit à l'aide du système de vision embarquée EPITA SmartScan assisté par révision humaine (Human-in-the-Loop). Sur les <strong>{report.totalInitialDetections}</strong> prédictions générées par le modèle, <strong>{report.totalConfirmedObjects}</strong> ont été formellement validées, <strong>{report.totalRejectedObjects}</strong> faux positif(s) ont été éliminés et <strong>{report.totalReclassifiedObjects}</strong> objet(s) ont été réattribués dans leur catégorie exacte. Le volume d'équipements consolidé s'établit à <strong>{report.totalConsolidatedObjects}</strong> unités vérifiées avec un indice de complétude de contrôle (*Audit Readiness*) de <strong>{report.auditReadinessScore}%</strong>.
          </p>
        </div>

        {/* Audit Context Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-[#0B1020]/50 print-card border border-[#222E47]">
          <div>
            <span className="text-[10px] text-slate-400 print-text-muted uppercase font-semibold flex items-center space-x-1">
              <Building2 className="w-3 h-3 text-[#38D9E6]" />
              <span>Localisation</span>
            </span>
            <p className="font-bold text-white print-text-dark text-xs sm:text-sm mt-0.5">{report.room.name}</p>
            <p className="text-[11px] text-slate-400 print-text-muted">{report.room.campus} · {report.room.floor}</p>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 print-text-muted uppercase font-semibold flex items-center space-x-1">
              <User className="w-3 h-3 text-[#38D9E6]" />
              <span>Auditeur Responsable</span>
            </span>
            <p className="font-bold text-white print-text-dark text-xs sm:text-sm mt-0.5">{report.auditorName}</p>
            <p className="text-[11px] text-slate-400 print-text-muted">{report.auditorRole}</p>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 print-text-muted uppercase font-semibold flex items-center space-x-1">
              <Sliders className="w-3 h-3 text-[#38D9E6]" />
              <span>Moteur de Vision</span>
            </span>
            <p className="font-bold text-white print-text-dark text-xs sm:text-sm mt-0.5">COCO-SSD + SAHI</p>
            <p className="text-[11px] text-slate-400 print-text-muted">Seuil réglé : {Math.round(report.confidenceThreshold * 100)}%</p>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 print-text-muted uppercase font-semibold flex items-center space-x-1">
              <CheckCircle2 className="w-3 h-3 text-[#34D399]" />
              <span>Bilan des Écarts</span>
            </span>
            <p className={`font-black text-xs sm:text-sm mt-0.5 ${
              report.discrepanciesCount === 0 ? 'text-[#34D399]' : 'text-rose-400'
            }`}>
              {report.discrepanciesCount} anomalie(s)
            </p>
            <p className="text-[11px] text-slate-400 print-text-muted">Complétude : {report.auditReadinessScore}%</p>
          </div>
        </div>

        {/* Snapshot Thumbnail if present */}
        {imageSnapshotUrl && (
          <div className="rounded-2xl overflow-hidden border border-[#222E47] print-break-inside-avoid">
            <div className="bg-[#0B1020] px-3 py-2 text-xs font-semibold text-slate-300 border-b border-[#222E47] flex justify-between">
              <span>Cliché annoté in-situ (Boîtes englobantes révisées)</span>
              <span className="text-[10px] text-slate-500">Horodaté {report.timestamp}</span>
            </div>
            <img 
              src={imageSnapshotUrl} 
              alt="Cliché de l'audit" 
              className="w-full max-h-72 object-contain bg-black"
            />
          </div>
        )}

        {/* Detailed Tripartite Inventory Table */}
        <div className="space-y-3 print-break-inside-avoid">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white print-text-dark uppercase tracking-wider">
              1. Tableau d'Inventaire Tripartite : Théorique vs IA vs Consolidé
            </h3>
            <span className="text-[10px] text-slate-400 print-text-muted">
              Distinction rigoureuse prédictions brutes / corrections humaines
            </span>
          </div>

          <div className="border border-[#222E47] rounded-xl overflow-hidden print-card">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0B1020] print-card text-slate-400 print-text-muted uppercase text-[10px] font-bold border-b border-[#222E47]">
                <tr>
                  <th className="py-2.5 px-3">Équipement</th>
                  <th className="py-2.5 px-2 text-center" title="Dotation réglementaire attendue">Cible</th>
                  <th className="py-2.5 px-2 text-center text-[#38D9E6]" title="Détection initiale brute de l'IA">IA Brute</th>
                  <th className="py-2.5 px-2 text-center" title="Revue humaine : validés / rejetés">Revue Humaine</th>
                  <th className="py-2.5 px-2 text-center font-bold text-white" title="Inventaire final vérifié">Consolidé</th>
                  <th className="py-2.5 px-2 text-center font-bold">Écart Net</th>
                  <th className="py-2.5 px-3">Statut & Remarques</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222E47] print-text-dark">
                {report.items.map((item) => (
                  <tr key={item.equipmentId} className="hover:bg-[#0B1020]/30">
                    <td className="py-2.5 px-3 font-semibold text-white print-text-dark">
                      {item.labelFr}
                    </td>
                    <td className="py-2.5 px-2 text-center font-semibold text-slate-300">
                      {item.expectedCount}
                    </td>
                    <td className="py-2.5 px-2 text-center font-mono text-[#38D9E6]">
                      {item.supportedByModel ? item.initialDetectedCount : '—'}
                    </td>
                    <td className="py-2.5 px-2 text-center text-[10px]">
                      {item.rejectedCount > 0 && <span className="text-rose-400 mr-1">-{item.rejectedCount} rejet</span>}
                      {item.confirmedCount > 0 && <span className="text-[#34D399] mr-1">{item.confirmedCount} validé</span>}
                      {item.reclassifiedInCount > 0 && <span className="text-amber-400">+{item.reclassifiedInCount} reclassé</span>}
                      {item.rejectedCount === 0 && item.confirmedCount === 0 && item.reclassifiedInCount === 0 && <span className="text-slate-500">—</span>}
                    </td>
                    <td className="py-2.5 px-2 text-center font-extrabold text-white print-text-dark text-sm">
                      {item.status === 'non_verifiable' ? '—' : item.consolidatedCount}
                    </td>
                    <td className="py-2.5 px-2 text-center font-bold">
                      {item.status === 'non_verifiable' ? (
                        <span className="text-slate-500">—</span>
                      ) : (
                        <span className={item.discrepancy === 0 ? 'text-[#34D399]' : 'text-rose-400'}>
                          {item.discrepancy > 0 ? `+${item.discrepancy}` : item.discrepancy}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-[11px] text-slate-400 print-text-muted">
                      {item.observations}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Technical Limitations and Non-Supported Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print-break-inside-avoid">
          <div className="bg-[#0B1020]/70 print-card border border-[#222E47] p-4 rounded-xl space-y-2">
            <h4 className="text-xs font-bold text-amber-400 flex items-center space-x-1.5">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Limites du Périmètre d'Apprentissage IA</span>
            </h4>
            <ul className="list-disc list-inside text-[11px] text-slate-400 print-text-muted space-y-1">
              <li><strong>Classes non entraînées :</strong> Fenêtres, vitrages et vidéoprojecteurs de plafond ne font pas partie de l'ontologie d'entraînement initiale.</li>
              <li><strong>Tableaux muraux :</strong> Détectés par heuristique de réflectance géométrique nécessitant un cadrage frontal net.</li>
              <li><strong>Non-calibration des scores :</strong> Les scores représentent des activations relatives et non une probabilité absolue de terrain.</li>
            </ul>
          </div>

          <div className="bg-[#0B1020]/70 print-card border border-[#222E47] p-4 rounded-xl space-y-2">
            <h4 className="text-xs font-bold text-[#38D9E6] flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Garanties Éthiques & Protection de la Vie Privée</span>
            </h4>
            <ul className="list-disc list-inside text-[11px] text-slate-400 print-text-muted space-y-1">
              <li><strong>Filtrage humain strict :</strong> Toute silhouette humaine entrant dans le champ est immédiatement éliminée sans traitement.</li>
              <li><strong>Zéro stockage serveur :</strong> Traitement 100% navigateur en mémoire vive locale (zéro fuite de données RGPD).</li>
              <li><strong>Absence $\neq$ Disparition :</strong> Une non-détection optique ne prouve pas une absence physique (mobilier occulté ou hors champ).</li>
            </ul>
          </div>
        </div>

        {/* Operational Recommendations & Sign-off */}
        <div className="bg-[#0B1020]/70 print-card border border-[#222E47] p-4 rounded-xl space-y-4 print-break-inside-avoid">
          <div>
            <h4 className="text-xs font-bold text-white print-text-dark mb-2 uppercase tracking-wider">
              2. Recommandations Opérationnelles (Générées par règles déterministes)
            </h4>
            <div className="space-y-1.5 text-xs text-slate-300 print-text-dark">
              {report.recommendations.map((rec, i) => (
                <p key={i} className="flex items-start space-x-2">
                  <span className="text-[#38D9E6] font-bold">›</span>
                  <span>{rec}</span>
                </p>
              ))}
            </div>
          </div>

          {/* Formal Sign-off block */}
          <div className="pt-4 border-t border-[#222E47] grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-[10px] text-slate-400 print-text-muted uppercase font-bold">Visa de l'Auditeur Campus :</p>
              <p className="font-semibold text-white print-text-dark mt-1">{report.auditorName}</p>
              <div className="w-48 h-12 border border-dashed border-[#222E47] rounded-lg mt-1 flex items-center justify-center text-[10px] text-slate-500 italic">
                Validé électroniquement in-situ
              </div>
            </div>

            <div className="text-right flex flex-col items-end">
              <p className="text-[10px] text-slate-400 print-text-muted uppercase font-bold">Visa Direction des Moyens Généraux :</p>
              <p className="font-semibold text-white print-text-dark mt-1">{report.auditorRole}</p>
              <div className="w-48 h-12 border border-dashed border-[#222E47] rounded-lg mt-1 flex items-center justify-center text-[10px] text-slate-500 italic">
                Enregistré au registre du campus
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
