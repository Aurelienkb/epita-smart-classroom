import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  UserCheck, 
  ArrowRight, 
  Layers, 
  BarChart3, 
  FileText, 
  ShieldAlert,
  Info,
  Edit3,
  Check,
  Cpu,
  SlidersHorizontal,
  XCircle,
  Sparkles
} from 'lucide-react';
import { ClassroomRoom, EquipmentId, AuditReportData, InteractiveDetection } from '../types';
import { ManualOverride } from '../services/auditEngine';
import { AIReliabilityCenter } from './AIReliabilityCenter';

interface AuditDashboardViewProps {
  report: AuditReportData;
  detections: InteractiveDetection[];
  onUpdateManualOverride: (equipmentId: EquipmentId, override: ManualOverride) => void;
  onNavigateToReport: () => void;
  onNavigateToScanner: () => void;
}

export const AuditDashboardView: React.FC<AuditDashboardViewProps> = ({
  report,
  detections,
  onUpdateManualOverride,
  onNavigateToReport,
  onNavigateToScanner
}) => {
  const [activeSection, setActiveSection] = useState<'inventory' | 'reliability'>('inventory');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempManualCount, setTempManualCount] = useState<number>(0);
  const [tempNotes, setTempNotes] = useState<string>('');

  const startEdit = (eqId: EquipmentId, currentCount: number, existingNotes?: string) => {
    setEditingId(eqId);
    setTempManualCount(currentCount);
    setTempNotes(existingNotes || '');
  };

  const saveManualValidation = (eqId: EquipmentId) => {
    onUpdateManualOverride(eqId, {
      verified: true,
      manualCount: tempManualCount,
      notes: tempNotes
    });
    setEditingId(null);
  };

  const cancelManualValidation = (eqId: EquipmentId) => {
    onUpdateManualOverride(eqId, {
      verified: false
    });
    setEditingId(null);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      
      {/* Top Header Card */}
      <div className="bg-[#151D30] border border-[#222E47] p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-white">Tableau de Bord & Audit Comparatif</h2>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
              report.globalStatus === 'CONFORME'
                ? 'bg-[#34D399]/20 text-[#34D399] border border-[#34D399]/40'
                : report.globalStatus === 'ATTENTION_ECART'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
            }`}>
              {report.globalStatus === 'CONFORME' && 'CONFORME'}
              {report.globalStatus === 'ATTENTION_ECART' && 'ATTENTION — ÉCARTS CONSTATÉS'}
              {report.globalStatus === 'VERIFICATION_REQUISE' && 'VÉRIFICATION HUMAINE REQUISE'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Audit de la <span className="text-[#38D9E6] font-semibold">{report.room.name}</span> ({report.room.code}) — {report.timestamp}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onNavigateToScanner}
            className="px-3.5 py-2 rounded-xl bg-[#0B1020] hover:bg-[#1B253D] border border-[#222E47] text-slate-300 hover:text-white text-xs font-semibold transition-colors"
          >
            Refaire une capture
          </button>
          <button
            onClick={onNavigateToReport}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-[#38D9E6] text-[#0B1020] text-xs font-bold shadow-lg shadow-[#38D9E6]/20 hover:opacity-95 transition-all"
          >
            <FileText className="w-4 h-4" />
            <span>Générer le Rapport Officiel</span>
          </button>
        </div>
      </div>

      {/* View Switcher: Inventory Matrix vs AI Reliability Center */}
      <div className="flex items-center space-x-2 border-b border-[#222E47] pb-1">
        <button
          onClick={() => setActiveSection('inventory')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeSection === 'inventory'
              ? 'bg-[#151D30] text-[#38D9E6] border border-[#38D9E6]/40 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-[#151D30]/50'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Matrice & Inventaire Consolidé</span>
          {report.discrepanciesCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30">
              {report.discrepanciesCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSection('reliability')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeSection === 'reliability'
              ? 'bg-[#151D30] text-[#38D9E6] border border-[#38D9E6]/40 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-[#151D30]/50'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>Centre de Fiabilité & Explicabilité IA</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#38D9E6]/20 text-[#38D9E6] border border-[#38D9E6]/30">
            Audit transparent
          </span>
        </button>
      </div>

      {activeSection === 'reliability' ? (
        /* AI Reliability Center Component (Amélioration prioritaire) */
        <AIReliabilityCenter report={report} detections={detections} />
      ) : (
        <>
          {/* Synthetic Metric KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            {/* Total Raw Detected */}
            <div className="bg-[#151D30] border border-[#222E47] p-4 rounded-xl">
              <p className="text-[11px] text-slate-400 font-medium">Prédictions Brutes (IA)</p>
              <div className="mt-1 flex items-baseline space-x-2">
                <span className="text-2xl font-black text-white">{report.totalInitialDetections}</span>
                <span className="text-[10px] text-slate-400">boîtes</span>
              </div>
              <p className="text-[10px] text-[#38D9E6] mt-1">Inférence TensorFlow.js</p>
            </div>

            {/* Human Revisions */}
            <div className="bg-[#151D30] border border-[#222E47] p-4 rounded-xl">
              <p className="text-[11px] text-slate-400 font-medium">Revue Humaine</p>
              <div className="mt-1 flex items-baseline space-x-2">
                <span className="text-2xl font-black text-[#34D399]">{report.totalConfirmedObjects}</span>
                <span className="text-[10px] text-slate-400">validé(s)</span>
              </div>
              <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-1">
                {report.totalRejectedObjects > 0 && (
                  <span className="text-rose-400">-{report.totalRejectedObjects} faux positif(s)</span>
                )}
                {report.totalReclassifiedObjects > 0 && (
                  <span className="text-amber-400">⚡ {report.totalReclassifiedObjects} reclassé(s)</span>
                )}
              </div>
            </div>

            {/* Consolidated Valid Inventory */}
            <div className="bg-[#151D30] border border-[#222E47] p-4 rounded-xl">
              <p className="text-[11px] text-slate-400 font-medium">Inventaire Consolidé</p>
              <div className="mt-1 flex items-baseline space-x-2">
                <span className="text-2xl font-black text-white">{report.totalConsolidatedObjects}</span>
                <span className="text-[10px] text-slate-400">unités nettes</span>
              </div>
              <p className="text-[10px] text-[#34D399] mt-1">Après revue & filtrage</p>
            </div>

            {/* Discrepancies Count */}
            <div className="bg-[#151D30] border border-[#222E47] p-4 rounded-xl">
              <p className="text-[11px] text-slate-400 font-medium">Écarts Constatés</p>
              <div className="mt-1 flex items-baseline space-x-2">
                <span className={`text-2xl font-black ${report.discrepanciesCount > 0 ? 'text-rose-400' : 'text-[#34D399]'}`}>
                  {report.discrepanciesCount}
                </span>
                <span className="text-[10px] text-slate-400">anomalie(s)</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">vs dotation cible</p>
            </div>

            {/* Audit Readiness Score */}
            <div className="col-span-2 lg:col-span-1 bg-[#151D30] border border-[#222E47] p-4 rounded-xl flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <p className="text-[11px] text-slate-400 font-medium">Audit Readiness</p>
                <span className="text-xs font-bold text-[#38D9E6]">{report.auditReadinessScore}%</span>
              </div>
              <div className="w-full bg-[#0B1020] h-2 rounded-full overflow-hidden my-2">
                <div 
                  className="bg-gradient-to-r from-[#38D9E6] to-[#34D399] h-full transition-all duration-500 rounded-full"
                  style={{ width: `${report.auditReadinessScore}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-slate-400">
                Complétude du contrôle (IA + Humain)
              </p>
            </div>
          </div>

          {/* Human-in-the-Loop Clarification Banner */}
          <div className="bg-[#0B1020] border border-[#38D9E6]/30 p-3.5 rounded-xl flex items-start space-x-3 text-xs">
            <UserCheck className="w-4 h-4 text-[#38D9E6] shrink-0 mt-0.5" />
            <div className="text-slate-300 leading-relaxed">
              <span className="font-semibold text-white">Principe de Séparation Rigoureuse : </span>
              L'IA fournit des prédictions brutes avec boîtes englobantes. Les corrections humaines (confirmations, rejets de faux positifs, reclassifications et comptages in-situ) restent rigoureusement tracées dans des colonnes distinctes et ne sont jamais imputées au modèle.
            </div>
          </div>

          {/* Tripartite Comparison Matrix Table */}
          <div className="bg-[#151D30] border border-[#222E47] rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 bg-[#151D30] border-b border-[#222E47] flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Layers className="w-4 h-4 text-[#38D9E6]" />
                <span>Matrice Tripartite : Théorique vs IA Brute vs Revue vs Consolidé</span>
              </h3>
              <span className="text-xs text-slate-400">
                {report.items.length} catégorie(s) auditée(s)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0B1020]/70 text-slate-400 uppercase tracking-wider font-semibold border-b border-[#222E47]">
                  <tr>
                    <th className="py-3 px-4">Équipement</th>
                    <th className="py-3 px-2 text-center">Cible</th>
                    <th className="py-3 px-2 text-center">IA Brute</th>
                    <th className="py-3 px-3 text-center">Revue Humaine</th>
                    <th className="py-3 px-2 text-center">Consolidé</th>
                    <th className="py-3 px-2 text-center">Écart</th>
                    <th className="py-3 px-4">Statut & Diagnostic</th>
                    <th className="py-3 px-4 text-right">Contrôle In-Situ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222E47]/60">
                  {report.items.map((item) => {
                    const isEditing = editingId === item.equipmentId;

                    return (
                      <tr key={item.equipmentId} className="hover:bg-[#1B253D]/40 transition-colors">
                        {/* Equipment Name */}
                        <td className="py-3 px-4 font-semibold text-white">
                          <div className="flex items-center space-x-2">
                            <span>{item.labelFr}</span>
                            {!item.supportedByModel && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                Hors IA
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 font-normal mt-0.5 max-w-xs">
                            {item.observations}
                          </p>
                        </td>

                        {/* Expected Count */}
                        <td className="py-3 px-2 text-center font-bold text-slate-200">
                          {item.expectedCount}
                        </td>

                        {/* Raw AI Prediction */}
                        <td className="py-3 px-2 text-center">
                          {item.supportedByModel ? (
                            <div>
                              <span className="font-extrabold text-white text-sm">
                                {item.initialDetectedCount}
                              </span>
                              {item.initialDetectedCount > 0 && (
                                <span className="block text-[10px] text-[#38D9E6]">
                                  conf. {item.averageConfidence}%
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-500 italic text-[11px]">Hors scope</span>
                          )}
                        </td>

                        {/* Human Review (Confirmed, Rejected, Reclassified, Manual) */}
                        <td className="py-3 px-3 text-center">
                          {item.manuallyVerified ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#38D9E6]/20 text-[#38D9E6] border border-[#38D9E6]/40">
                              In-situ: {item.consolidatedCount}
                            </span>
                          ) : item.supportedByModel ? (
                            <div className="text-[11px] space-y-0.5">
                              {item.confirmedCount > 0 && (
                                <span className="inline-block px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-300 mr-1">
                                  ✓ {item.confirmedCount}
                                </span>
                              )}
                              {item.rejectedCount > 0 && (
                                <span className="inline-block px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-300 mr-1">
                                  ✕ {item.rejectedCount}
                                </span>
                              )}
                              {item.reclassifiedInCount > 0 && (
                                <span className="inline-block px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300">
                                  +{item.reclassifiedInCount}
                                </span>
                              )}
                              {item.confirmedCount === 0 && item.rejectedCount === 0 && item.reclassifiedInCount === 0 && (
                                <span className="text-slate-500 text-[10px]">Non révisé</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-amber-400/80 text-[10px]">Visuel requis</span>
                          )}
                        </td>

                        {/* Consolidated Count */}
                        <td className="py-3 px-2 text-center">
                          <span className="font-extrabold text-white text-sm">
                            {item.status === 'non_verifiable' ? 0 : item.consolidatedCount}
                          </span>
                        </td>

                        {/* Discrepancy */}
                        <td className="py-3 px-2 text-center">
                          {item.status === 'non_verifiable' ? (
                            <span className="text-slate-500">—</span>
                          ) : (
                            <span className={`inline-block font-extrabold px-2 py-0.5 rounded text-xs ${
                              item.discrepancy === 0 
                                ? 'text-[#34D399] bg-[#34D399]/10' 
                                : item.discrepancy < 0 
                                  ? 'text-rose-400 bg-rose-500/10' 
                                  : 'text-amber-400 bg-amber-500/10'
                            }`}>
                              {item.discrepancy > 0 ? `+${item.discrepancy}` : item.discrepancy}
                            </span>
                          )}
                        </td>

                        {/* Status Badge */}
                        <td className="py-3 px-4">
                          {item.status === 'conforme' && (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#34D399]/20 text-[#34D399] border border-[#34D399]/40">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Conforme</span>
                            </span>
                          )}
                          {item.status === 'ecart' && (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-rose-500/20 text-rose-300 border border-rose-500/40">
                              <AlertTriangle className="w-3 h-3" />
                              <span>Écart ({item.discrepancy})</span>
                            </span>
                          )}
                          {item.status === 'non_verifiable' && (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              <HelpCircle className="w-3 h-3" />
                              <span>Contrôle requis</span>
                            </span>
                          )}
                          {item.status === 'verifie_manuellement' && (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#38D9E6]/20 text-[#38D9E6] border border-[#38D9E6]/40">
                              <UserCheck className="w-3 h-3" />
                              <span>In-situ vérifié</span>
                            </span>
                          )}
                        </td>

                        {/* Human Action */}
                        <td className="py-3 px-4 text-right">
                          {isEditing ? (
                            <div className="flex items-center justify-end space-x-2">
                              <input
                                type="number"
                                min="0"
                                value={tempManualCount}
                                onChange={(e) => setTempManualCount(parseInt(e.target.value) || 0)}
                                className="w-14 px-2 py-1 rounded bg-[#0B1020] border border-[#38D9E6] text-white text-xs font-bold text-center focus:outline-none"
                                placeholder="Qté"
                              />
                              <button
                                onClick={() => saveManualValidation(item.equipmentId)}
                                className="p-1 rounded bg-[#34D399] text-[#0B1020] hover:bg-[#34D399]/90 font-bold"
                                title="Confirmer la validation"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="text-[10px] text-slate-400 hover:text-white px-1"
                              >
                                Annuler
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end space-x-2">
                              {item.manuallyVerified ? (
                                <button
                                  onClick={() => cancelManualValidation(item.equipmentId)}
                                  className="text-[11px] text-slate-400 hover:text-rose-400 transition-colors"
                                >
                                  Réinitialiser
                                </button>
                              ) : (
                                <button
                                  onClick={() => startEdit(
                                    item.equipmentId, 
                                    item.supportedByModel ? item.consolidatedCount : item.expectedCount, 
                                    item.observations
                                  )}
                                  className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-[#0B1020] hover:bg-[#222E47] border border-[#222E47] text-slate-300 hover:text-white transition-colors"
                                >
                                  <Edit3 className="w-3 h-3 text-[#38D9E6]" />
                                  <span>Valider in-situ</span>
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Visual Chart Card */}
          <div className="bg-[#151D30] border border-[#222E47] p-5 rounded-2xl">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-[#38D9E6]" />
              <span>Comparaison Graphique des Volumes (Attendu vs Consolidé)</span>
            </h3>

            <div className="space-y-3">
              {report.items.filter(i => i.expectedCount > 0 || i.consolidatedCount > 0).map((item) => {
                const maxVal = Math.max(item.expectedCount, item.consolidatedCount, 1);
                const expectedPct = (item.expectedCount / maxVal) * 100;
                const consolidatedPct = item.status !== 'non_verifiable' ? (item.consolidatedCount / maxVal) * 100 : 0;

                return (
                  <div key={item.equipmentId} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-slate-300">{item.labelFr}</span>
                      <div className="space-x-3 text-[11px]">
                        <span className="text-slate-400">Attendu : <strong className="text-white">{item.expectedCount}</strong></span>
                        {item.status !== 'non_verifiable' ? (
                          <span className="text-[#38D9E6]">Consolidé : <strong>{item.consolidatedCount}</strong></span>
                        ) : (
                          <span className="text-amber-400 italic">Non vérifié</span>
                        )}
                      </div>
                    </div>

                    <div className="h-3 bg-[#0B1020] rounded-full overflow-hidden flex flex-col justify-center space-y-0.5 p-0.5">
                      <div 
                        className="h-1 bg-slate-500 rounded-full transition-all duration-300"
                        style={{ width: `${expectedPct}%` }}
                        title={`Attendu: ${item.expectedCount}`}
                      ></div>
                      {item.status !== 'non_verifiable' && (
                        <div 
                          className={`h-1 rounded-full transition-all duration-300 ${
                            item.discrepancy === 0 ? 'bg-[#34D399]' : 'bg-[#38D9E6]'
                          }`}
                          style={{ width: `${consolidatedPct}%` }}
                          title={`Consolidé: ${item.consolidatedCount}`}
                        ></div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

    </div>
  );
};
