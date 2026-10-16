import React from 'react';
import { 
  Sparkles, 
  Scan, 
  CheckCircle2, 
  Building2, 
  Cpu, 
  ShieldCheck, 
  ArrowRight, 
  Layers, 
  History, 
  HelpCircle,
  FileCheck
} from 'lucide-react';
import { ClassroomRoom, AuditReportData } from '../types';
import { ModelStatus } from '../services/aiVision';
import { EQUIPMENT_CATALOG } from '../data/equipmentCatalog';

interface OverviewViewProps {
  selectedRoom: ClassroomRoom;
  modelStatus: ModelStatus;
  lastReport: AuditReportData | null;
  onStartNewAudit: () => void;
  onNavigateToAudit: () => void;
  onNavigateToSettings: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  selectedRoom,
  modelStatus,
  lastReport,
  onStartNewAudit,
  onNavigateToAudit,
  onNavigateToSettings
}) => {
  return (
    <div className="space-y-6 pb-20 md:pb-8">
      
      {/* Hero SaaS Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#151D30] via-[#0B1020] to-[#151D30] border border-[#222E47] p-6 sm:p-10 shadow-2xl">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-[#38D9E6]/10 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-80 h-80 rounded-full bg-[#34D399]/10 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#38D9E6]/10 border border-[#38D9E6]/30 text-[#38D9E6] text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>EPITA Smart Classroom · Examen IA for Managers</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            Audit Intelligent des Salles de Cours par <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#38D9E6] to-[#34D399]">Vision IA</span>
          </h1>

          <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            Solution embarquée de contrôle d'inventaire automatisé. Analysez en temps réel le mobilier et le matériel informatique d'une classe, comparez instantanément avec la dotation attendue et éditez des comptes rendus certifiés.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={onStartNewAudit}
              className="flex items-center space-x-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#38D9E6] to-[#34D399] text-[#0B1020] font-extrabold text-sm shadow-xl shadow-[#38D9E6]/25 hover:opacity-95 transition-all transform hover:-translate-y-0.5"
            >
              <Scan className="w-4 h-4" />
              <span>Démarrer un Nouvel Audit</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <button
              onClick={onNavigateToSettings}
              className="flex items-center space-x-2 px-5 py-3 rounded-2xl bg-[#151D30] hover:bg-[#1B253D] border border-[#222E47] text-slate-200 font-semibold text-sm transition-colors"
            >
              <Building2 className="w-4 h-4 text-[#38D9E6]" />
              <span>Gérer les Salles</span>
            </button>
          </div>
        </div>

        {/* Feature badges row */}
        <div className="mt-8 pt-6 border-t border-[#222E47]/70 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="flex items-center space-x-2.5 text-slate-300">
            <div className="w-7 h-7 rounded-lg bg-[#0B1020] border border-[#222E47] flex items-center justify-center text-[#38D9E6]">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-white">TensorFlow.js COCO-SSD</p>
              <p className="text-[11px] text-slate-400">Inférence 100% navigateur</p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5 text-slate-300">
            <div className="w-7 h-7 rounded-lg bg-[#0B1020] border border-[#222E47] flex items-center justify-center text-[#34D399]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-white">Protection de la vie privée</p>
              <p className="text-[11px] text-slate-400">Aucune analyse de personnes</p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5 text-slate-300">
            <div className="w-7 h-7 rounded-lg bg-[#0B1020] border border-[#222E47] flex items-center justify-center text-amber-400">
              <FileCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-white">Rapport Certifié PDF</p>
              <p className="text-[11px] text-slate-400">Exportation & historique local</p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Selected Room Configuration vs Last Audit Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Selected Room Configuration Preview */}
        <div className="lg:col-span-2 bg-[#151D30] border border-[#222E47] rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#222E47]">
            <div className="flex items-center space-x-2.5">
              <Building2 className="w-5 h-5 text-[#38D9E6]" />
              <div>
                <h2 className="text-sm font-bold text-white">
                  Configuration Théorique : {selectedRoom.name}
                </h2>
                <p className="text-[11px] text-slate-400">
                  {selectedRoom.campus} · {selectedRoom.building} · {selectedRoom.floor}
                </p>
              </div>
            </div>

            <button
              onClick={onNavigateToSettings}
              className="text-xs text-[#38D9E6] hover:underline font-semibold"
            >
              Modifier
            </button>
          </div>

          {/* Equipment Pills Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {Object.entries(selectedRoom.expectedConfig)
              .filter(([_, count]) => count > 0)
              .map(([eqId, count]) => {
                const catalog = EQUIPMENT_CATALOG[eqId];
                return (
                  <div 
                    key={eqId}
                    className="p-3 rounded-xl bg-[#0B1020] border border-[#222E47] flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-semibold text-white">
                        {catalog ? catalog.labelFr.split('/')[0] : eqId}
                      </p>
                      <span className={`text-[10px] ${catalog?.supportedByModel ? 'text-[#38D9E6]' : 'text-amber-400'}`}>
                        {catalog?.supportedByModel ? 'Reconnu IA' : 'Vérif. manuelle'}
                      </span>
                    </div>
                    <span className="text-base font-extrabold text-white bg-[#151D30] px-2.5 py-1 rounded-lg border border-[#222E47]">
                      {count}
                    </span>
                  </div>
                );
              })}
          </div>

          <div className="mt-4 pt-3 border-t border-[#222E47] flex items-center justify-between text-xs text-slate-400">
            <span>Capacité d'accueil : <strong className="text-white">{selectedRoom.capacity} places</strong></span>
            <span className="text-[11px] italic">Sujet de référence : GITM Smart Classroom</span>
          </div>
        </div>

        {/* Last Audit Widget */}
        <div className="bg-[#151D30] border border-[#222E47] rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#222E47]">
              <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                <History className="w-4 h-4 text-[#38D9E6]" />
                <span>Dernier Audit Réalisé</span>
              </h2>
            </div>

            {lastReport ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">{lastReport.room.code}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    lastReport.globalStatus === 'CONFORME'
                      ? 'bg-[#34D399]/20 text-[#34D399]'
                      : 'bg-rose-500/20 text-rose-300'
                  }`}>
                    {lastReport.globalStatus}
                  </span>
                </div>

                <p className="text-xs text-slate-400">{lastReport.timestamp}</p>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-[#0B1020] p-2 rounded-lg border border-[#222E47]">
                    <span className="text-[10px] text-slate-400">Objets vus</span>
                    <p className="font-extrabold text-white text-base">{lastReport.totalDetectedObjects}</p>
                  </div>
                  <div className="bg-[#0B1020] p-2 rounded-lg border border-[#222E47]">
                    <span className="text-[10px] text-slate-400">Écarts</span>
                    <p className={`font-extrabold text-base ${lastReport.discrepanciesCount > 0 ? 'text-rose-400' : 'text-[#34D399]'}`}>
                      {lastReport.discrepanciesCount}
                    </p>
                  </div>
                </div>

                <button
                  onClick={onNavigateToAudit}
                  className="w-full mt-2 py-2 rounded-xl bg-[#0B1020] hover:bg-[#1B253D] border border-[#222E47] text-[#38D9E6] text-xs font-bold transition-colors"
                >
                  Consulter le détail
                </button>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-400">
                <p>Aucun audit n'a encore été réalisé durant cette session.</p>
                <button
                  onClick={onStartNewAudit}
                  className="mt-3 text-[#38D9E6] font-semibold hover:underline block mx-auto"
                >
                  Lancer le premier scan ›
                </button>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-[#222E47] text-[11px] text-slate-400 flex items-center justify-between">
            <span>État moteur IA</span>
            <span className={`font-bold ${modelStatus === 'ready' ? 'text-[#34D399]' : 'text-amber-400'}`}>
              {modelStatus === 'ready' ? 'Opérationnel' : 'Initialisation...'}
            </span>
          </div>
        </div>

      </div>

    </div>
  );
};
