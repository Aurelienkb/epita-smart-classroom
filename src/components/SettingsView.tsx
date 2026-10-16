import React, { useState } from 'react';
import { 
  Building2, 
  Plus, 
  Trash2, 
  Save, 
  RotateCcw, 
  History, 
  Cpu, 
  ShieldCheck, 
  Check, 
  FileText,
  AlertCircle
} from 'lucide-react';
import { ClassroomRoom, EquipmentId, AuditReportData } from '../types';
import { EQUIPMENT_CATALOG } from '../data/equipmentCatalog';
import { DEFAULT_ROOMS, saveRooms } from '../data/defaultRooms';
import { loadAuditHistory } from '../services/auditEngine';

interface SettingsViewProps {
  rooms: ClassroomRoom[];
  selectedRoom: ClassroomRoom;
  onUpdateRooms: (rooms: ClassroomRoom[]) => void;
  onSelectRoom: (room: ClassroomRoom) => void;
  onLoadHistoricalAudit: (report: AuditReportData) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  rooms,
  selectedRoom,
  onUpdateRooms,
  onSelectRoom,
  onLoadHistoricalAudit
}) => {
  const [activeTab, setActiveTab] = useState<'rooms' | 'history' | 'about'>('rooms');
  const [currentConfig, setCurrentConfig] = useState<Record<EquipmentId, number>>({
    ...selectedRoom.expectedConfig
  });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [auditHistory, setAuditHistory] = useState<AuditReportData[]>(loadAuditHistory());

  // Update counter in local editing state
  const handleCountChange = (eqId: EquipmentId, val: number) => {
    setCurrentConfig(prev => ({
      ...prev,
      [eqId]: Math.max(0, val)
    }));
  };

  // Save changes to current room
  const handleSaveRoomConfig = () => {
    const updatedRooms = rooms.map(r => {
      if (r.id === selectedRoom.id) {
        return {
          ...r,
          expectedConfig: { ...currentConfig }
        };
      }
      return r;
    });

    onUpdateRooms(updatedRooms);
    saveRooms(updatedRooms);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  // Reset all rooms to exam defaults
  const handleResetDefaults = () => {
    if (confirm('Réinitialiser toutes les salles aux configurations d\'origine du sujet d\'examen ?')) {
      onUpdateRooms(DEFAULT_ROOMS);
      saveRooms(DEFAULT_ROOMS);
      const matching = DEFAULT_ROOMS.find(r => r.id === selectedRoom.id) || DEFAULT_ROOMS[0];
      onSelectRoom(matching);
      setCurrentConfig({ ...matching.expectedConfig });
    }
  };

  // Clear local audit history
  const handleClearHistory = () => {
    if (confirm('Effacer tout l\'historique local des audits ?')) {
      localStorage.removeItem('epita_smartscan_audit_history_v1');
      setAuditHistory([]);
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      
      {/* Sub-navigation tabs */}
      <div className="flex space-x-2 border-b border-[#222E47] pb-3">
        <button
          onClick={() => setActiveTab('rooms')}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'rooms'
              ? 'bg-[#151D30] text-[#38D9E6] border border-[#38D9E6]/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Configuration des Salles</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('history');
            setAuditHistory(loadAuditHistory());
          }}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'history'
              ? 'bg-[#151D30] text-[#38D9E6] border border-[#38D9E6]/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Historique des Audits ({auditHistory.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('about')}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'about'
              ? 'bg-[#151D30] text-[#38D9E6] border border-[#38D9E6]/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>Modèle IA & Système</span>
        </button>
      </div>

      {/* Tab: Rooms Configuration */}
      {activeTab === 'rooms' && (
        <div className="bg-[#151D30] border border-[#222E47] rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#222E47] pb-4">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center space-x-2">
                <span>Dotation Attendue pour :</span>
                <span className="text-[#38D9E6]">{selectedRoom.name}</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Ajustez les quotas d'équipements attendus pour cette salle de cours.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleResetDefaults}
                className="px-3 py-1.5 rounded-lg bg-[#0B1020] hover:bg-[#1B253D] border border-[#222E47] text-slate-400 hover:text-white text-xs font-medium transition-colors flex items-center space-x-1"
                title="Rétablir les dotations initiales"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Réinitialiser</span>
              </button>

              <button
                onClick={handleSaveRoomConfig}
                className="flex items-center space-x-1.5 px-4 py-1.5 rounded-lg bg-[#38D9E6] text-[#0B1020] font-bold text-xs shadow-md shadow-[#38D9E6]/20 hover:opacity-95 transition-all"
              >
                {savedSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                <span>{savedSuccess ? 'Enregistré !' : 'Enregistrer'}</span>
              </button>
            </div>
          </div>

          {/* Form grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(Object.keys(EQUIPMENT_CATALOG) as EquipmentId[]).map((eqId) => {
              const catalog = EQUIPMENT_CATALOG[eqId];
              const count = currentConfig[eqId] ?? 0;

              return (
                <div 
                  key={eqId}
                  className="p-3.5 rounded-xl bg-[#0B1020] border border-[#222E47] flex items-center justify-between"
                >
                  <div className="pr-2">
                    <p className="text-xs font-semibold text-white">{catalog.labelFr}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                      {catalog.supportedByModel ? 'Supporté par COCO-SSD' : 'Contrôle manuel requis'}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={() => handleCountChange(eqId, count - 1)}
                      className="w-7 h-7 rounded-lg bg-[#151D30] hover:bg-[#1B253D] text-slate-200 border border-[#222E47] text-sm font-bold flex items-center justify-center transition-colors"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="0"
                      value={count}
                      onChange={(e) => handleCountChange(eqId, parseInt(e.target.value) || 0)}
                      className="w-12 h-7 rounded-lg bg-[#151D30] border border-[#38D9E6]/40 text-center text-xs font-extrabold text-white focus:outline-none"
                    />
                    <button
                      onClick={() => handleCountChange(eqId, count + 1)}
                      className="w-7 h-7 rounded-lg bg-[#151D30] hover:bg-[#1B253D] text-slate-200 border border-[#222E47] text-sm font-bold flex items-center justify-center transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab: History */}
      {activeTab === 'history' && (
        <div className="bg-[#151D30] border border-[#222E47] rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#222E47] pb-3">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white">
                Historique des Audits Enregistrés
              </h2>
              <p className="text-xs text-slate-400">
                Synthèse locale des audits réalisés (aucune image stockée pour la confidentialité).
              </p>
            </div>

            {auditHistory.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="text-xs text-rose-400 hover:underline flex items-center space-x-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Effacer l'historique</span>
              </button>
            )}
          </div>

          {auditHistory.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              Aucun audit sauvegardé dans cet appareil pour le moment.
            </div>
          ) : (
            <div className="space-y-3">
              {auditHistory.map((report) => (
                <div 
                  key={report.id}
                  className="p-4 rounded-xl bg-[#0B1020] border border-[#222E47] flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#38D9E6]/40 transition-all"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-white text-xs">{report.room.name}</span>
                      <span className={`px-2 py-0.2 rounded text-[10px] font-bold ${
                        report.globalStatus === 'CONFORME' 
                          ? 'bg-[#34D399]/20 text-[#34D399]' 
                          : 'bg-rose-500/20 text-rose-300'
                      }`}>
                        {report.globalStatus}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Réf : {report.id} · {report.timestamp} · {report.totalDetectedObjects} objets détectés · {report.discrepanciesCount} écarts
                    </p>
                  </div>

                  <button
                    onClick={() => onLoadHistoricalAudit(report)}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-[#151D30] hover:bg-[#1B253D] border border-[#222E47] text-[#38D9E6] text-xs font-semibold self-start sm:self-auto transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Consulter le Rapport</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: About AI & System Architecture */}
      {activeTab === 'about' && (
        <div className="bg-[#151D30] border border-[#222E47] rounded-2xl p-6 shadow-xl space-y-4 text-xs text-slate-300">
          <h2 className="text-sm sm:text-base font-bold text-white border-b border-[#222E47] pb-3">
            Spécifications Techniques & IA Embarquée
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#0B1020] p-4 rounded-xl border border-[#222E47] space-y-2">
              <h3 className="font-bold text-[#38D9E6]">Architecture Moteur IA</h3>
              <ul className="space-y-1 text-slate-400">
                <li><strong>Framework :</strong> TensorFlow.js 4.22</li>
                <li><strong>Modèle pré-entraîné :</strong> COCO-SSD (MobileNet v2)</li>
                <li><strong>Classes COCO :</strong> 80 catégories d'objets généraux</li>
                <li><strong>Backend d'accélération :</strong> WebGL GPU (fallback CPU)</li>
                <li><strong>Méthode d'inférence :</strong> Client-side browser only</li>
              </ul>
            </div>

            <div className="bg-[#0B1020] p-4 rounded-xl border border-[#222E47] space-y-2">
              <h3 className="font-bold text-[#34D399]">Garantie Éthique & RGPD</h3>
              <ul className="space-y-1 text-slate-400">
                <li><strong>Exclusion des personnes :</strong> Classe "person" filtrée et éliminée à la volée.</li>
                <li><strong>Zéro stockage serveur :</strong> Aucune vidéo ni photo transmise à un tiers.</li>
                <li><strong>Transparence :</strong> Seules les détections effectives sont affichées (aucune simulation factice).</li>
              </ul>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
