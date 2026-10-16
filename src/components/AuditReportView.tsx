import React, { useState } from 'react';
import { 
  Printer, 
  Download, 
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
  Check
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
      
      {/* Action Bar (Hidden when printing) */}
      <div className="no-print bg-[#151D30] border border-[#222E47] p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onBackToAudit}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#0B1020] hover:bg-[#1B253D] border border-[#222E47] text-slate-300 text-xs font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour au tableau de bord</span>
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

      {/* Main Printable Audit Report Document */}
      <div className="bg-[#151D30] print-card border border-[#222E47] rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8 text-slate-200 print-text-dark">
        
        {/* Document Header */}
        <div className="border-b border-[#222E47] pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-white print-text-dark">
                EPITA <span className="text-[#38D9E6]">SmartScan</span>
              </span>
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-[#0B1020] text-[#38D9E6] border border-[#222E47] print-card">
                RAPPORT OFFICIEL D'AUDIT
              </span>
            </div>
            <p className="text-xs text-slate-400 print-text-muted mt-1">
              Contrôle et inventaire automatisé des salles de cours par Vision IA embarquée
            </p>
          </div>

          <div className="sm:text-right">
            <p className="text-xs font-mono font-bold text-[#38D9E6] print-text-dark">
              Réf : {report.id}
            </p>
            <p className="text-[11px] text-slate-400 print-text-muted mt-0.5">
              Généré le {report.timestamp}
            </p>
          </div>
        </div>

        {/* Audit Context Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-[#0B1020]/60 print-card border border-[#222E47]">
          <div>
            <span className="text-[10px] text-slate-400 print-text-muted uppercase font-semibold flex items-center space-x-1">
              <Building2 className="w-3 h-3 text-[#38D9E6]" />
              <span>Salle Auditée</span>
            </span>
            <p className="font-bold text-white print-text-dark text-sm mt-0.5">{report.room.name}</p>
            <p className="text-[11px] text-slate-400 print-text-muted">{report.room.campus} · {report.room.floor}</p>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 print-text-muted uppercase font-semibold flex items-center space-x-1">
              <User className="w-3 h-3 text-[#38D9E6]" />
              <span>Auditeur Campus</span>
            </span>
            <p className="font-bold text-white print-text-dark text-sm mt-0.5">{report.auditorName}</p>
            <p className="text-[11px] text-slate-400 print-text-muted">{report.auditorRole}</p>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 print-text-muted uppercase font-semibold flex items-center space-x-1">
              <Sliders className="w-3 h-3 text-[#38D9E6]" />
              <span>Modèle & Seuil IA</span>
            </span>
            <p className="font-bold text-white print-text-dark text-sm mt-0.5">COCO-SSD v2</p>
            <p className="text-[11px] text-slate-400 print-text-muted">Seuil confiance : {Math.round(report.confidenceThreshold * 100)}%</p>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 print-text-muted uppercase font-semibold flex items-center space-x-1">
              <CheckCircle2 className="w-3 h-3 text-[#34D399]" />
              <span>Statut d'Audit</span>
            </span>
            <p className={`font-black text-sm mt-0.5 ${
              report.globalStatus === 'CONFORME' ? 'text-[#34D399]' : 'text-rose-400'
            }`}>
              {report.globalStatus === 'CONFORME' ? 'CONFORME' : 'RÉSERVES / ÉCARTS'}
            </p>
            <p className="text-[11px] text-slate-400 print-text-muted">Readiness: {report.auditReadinessScore}%</p>
          </div>
        </div>

        {/* Snapshot Thumbnail if present */}
        {imageSnapshotUrl && (
          <div className="rounded-2xl overflow-hidden border border-[#222E47] print-break-inside-avoid">
            <div className="bg-[#0B1020] px-3 py-2 text-xs font-semibold text-slate-300 border-b border-[#222E47] flex justify-between">
              <span>Cliché analysé in-situ (avec cadres de détection)</span>
              <span className="text-[10px] text-slate-500">Horodaté {report.timestamp}</span>
            </div>
            <img 
              src={imageSnapshotUrl} 
              alt="Cliché de l'audit" 
              className="w-full max-h-72 object-contain bg-black"
            />
          </div>
        )}

        {/* Detailed Inventory Table */}
        <div className="space-y-3 print-break-inside-avoid">
          <h3 className="text-sm font-bold text-white print-text-dark uppercase tracking-wider">
            1. Bilan Comparatif des Équipements et Mobilier
          </h3>

          <div className="border border-[#222E47] rounded-xl overflow-hidden print-card">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0B1020] print-card text-slate-400 print-text-muted uppercase text-[10px] font-bold border-b border-[#222E47]">
                <tr>
                  <th className="py-2.5 px-3">Équipement</th>
                  <th className="py-2.5 px-3 text-center">Attendu</th>
                  <th className="py-2.5 px-3 text-center">Observé (IA)</th>
                  <th className="py-2.5 px-3 text-center">Écart</th>
                  <th className="py-2.5 px-3">Statut de Contrôle</th>
                  <th className="py-2.5 px-3">Diagnostic & Justification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222E47] print-text-dark">
                {report.items.map((item) => (
                  <tr key={item.equipmentId} className="hover:bg-[#0B1020]/30">
                    <td className="py-2.5 px-3 font-semibold text-white print-text-dark">
                      {item.labelFr}
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold">
                      {item.expectedCount}
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold">
                      {item.supportedByModel ? item.detectedCount : 'N/A'}
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold">
                      {item.status === 'non_verifiable' ? (
                        <span className="text-slate-500">—</span>
                      ) : (
                        <span className={item.discrepancy === 0 ? 'text-[#34D399]' : 'text-rose-400'}>
                          {item.discrepancy > 0 ? `+${item.discrepancy}` : item.discrepancy}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                        item.status === 'conforme' ? 'bg-[#34D399]/20 text-[#34D399]' :
                        item.status === 'verifie_manuellement' ? 'bg-[#38D9E6]/20 text-[#38D9E6]' :
                        item.status === 'ecart' ? 'bg-rose-500/20 text-rose-300' :
                        'bg-amber-500/20 text-amber-300'
                      }`}>
                        {item.status === 'conforme' && 'Conforme'}
                        {item.status === 'verifie_manuellement' && 'Validé humain'}
                        {item.status === 'ecart' && 'Écart détecté'}
                        {item.status === 'non_verifiable' && 'Non supporté IA'}
                      </span>
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

        {/* Unsupported Categories & AI Limits */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print-break-inside-avoid">
          <div className="bg-[#0B1020]/70 print-card border border-[#222E47] p-4 rounded-xl">
            <h4 className="text-xs font-bold text-amber-400 mb-2 flex items-center space-x-1.5">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Équipements Non Pris en Charge par le Modèle</span>
            </h4>
            <p className="text-[11px] text-slate-300 print-text-dark mb-2">
              Le modèle COCO-SSD ne dispose pas d'étiquettes d'entraînement pour les éléments suivants :
            </p>
            <ul className="list-disc list-inside text-[11px] text-slate-400 print-text-muted space-y-1">
              <li><strong>Tableau blanc / TBI :</strong> Non reconnu par COCO-SSD (nécessite vérification visuelle).</li>
              <li><strong>Fenêtres :</strong> Non reconnues nativement dans le jeu de 80 classes.</li>
              <li><strong>Vidéoprojecteur suspendu :</strong> Non inclus dans le détecteur de base.</li>
            </ul>
          </div>

          <div className="bg-[#0B1020]/70 print-card border border-[#222E47] p-4 rounded-xl">
            <h4 className="text-xs font-bold text-[#38D9E6] mb-2 flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Limites Techniques & Garantie RGPD</span>
            </h4>
            <ul className="list-disc list-inside text-[11px] text-slate-400 print-text-muted space-y-1">
              {report.technicalLimits.map((limit, i) => (
                <li key={i}>{limit}</li>
              ))}
              <li className="text-[#34D399]">
                <strong>Confidentialité :</strong> Exécution 100% navigateur, aucune image stockée ni transférée. Personnes ignorées.
              </li>
            </ul>
          </div>
        </div>

        {/* Recommendations & Conclusion */}
        <div className="bg-[#0B1020]/70 print-card border border-[#222E47] p-4 rounded-xl print-break-inside-avoid">
          <h4 className="text-xs font-bold text-white print-text-dark mb-2">
            2. Recommandations de Contrôle Complémentaire & Conclusion
          </h4>
          <div className="space-y-1.5 text-xs text-slate-300 print-text-dark">
            {report.recommendations.map((rec, i) => (
              <p key={i} className="flex items-start space-x-2">
                <span className="text-[#38D9E6] font-bold">›</span>
                <span>{rec}</span>
              </p>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-[#222E47] flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs">
            <div>
              <span className="text-slate-400 print-text-muted">Avis Global de l'Auditeur : </span>
              <strong className={report.globalStatus === 'CONFORME' ? 'text-[#34D399]' : 'text-amber-400'}>
                {report.globalStatus === 'CONFORME' ? 'Salle conforme aux standards EPITA' : 'Audit validé avec réserves à lever'}
              </strong>
            </div>

            <div className="mt-4 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#222E47] text-right">
              <p className="text-[10px] text-slate-400 print-text-muted">Visa du Gestionnaire de Campus :</p>
              <div className="w-40 h-10 border border-dashed border-[#222E47] rounded mt-1 flex items-center justify-center text-[10px] text-slate-500 italic">
                Signé numériquement
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
