import React from 'react';
import { 
  Building2, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Loader2, 
  HelpCircle,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { ClassroomRoom } from '../types';
import { ModelStatus } from '../services/aiVision';

interface HeaderProps {
  rooms: ClassroomRoom[];
  selectedRoom: ClassroomRoom;
  onSelectRoom: (room: ClassroomRoom) => void;
  modelStatus: ModelStatus;
  modelError?: string;
  onOpenHelp: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  rooms,
  selectedRoom,
  onSelectRoom,
  modelStatus,
  modelError,
  onOpenHelp,
}) => {
  return (
    <header className="no-print sticky top-0 z-40 bg-[#0B1020]/90 backdrop-blur-md border-b border-[#222E47]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <div className="flex items-center space-x-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-[#151D30] border border-[#38D9E6]/40 shadow-lg shadow-[#38D9E6]/10">
            <Sparkles className="w-5 h-5 text-[#38D9E6]" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#34D399] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#34D399]"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold tracking-tight text-white text-lg">
                EPITA <span className="text-[#38D9E6]">SmartScan</span>
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-[#151D30] text-[#38D9E6] border border-[#222E47]">
                GITM AI v1.0
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden md:block">
              Intelligent Classroom Auditing & Vision IA
            </p>
          </div>
        </div>

        {/* Room Switcher Dropdown */}
        <div className="flex items-center space-x-2 md:space-x-4">
          <div className="relative">
            <div className="flex items-center space-x-2 bg-[#151D30] border border-[#222E47] hover:border-[#38D9E6]/50 rounded-lg px-3 py-1.5 transition-all text-xs sm:text-sm">
              <Building2 className="w-4 h-4 text-[#38D9E6] shrink-0" />
              <select 
                value={selectedRoom.id}
                onChange={(e) => {
                  const found = rooms.find(r => r.id === e.target.value);
                  if (found) onSelectRoom(found);
                }}
                className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer pr-4 appearance-none"
                aria-label="Sélectionner la salle à auditer"
              >
                {rooms.map((r) => (
                  <option key={r.id} value={r.id} className="bg-[#151D30] text-slate-100">
                    {r.name} ({r.code})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 pointer-events-none -ml-2" />
            </div>
          </div>

          {/* Model Status Badge */}
          <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-[#151D30]">
            {modelStatus === 'ready' && (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-[#34D399]" />
                <span className="text-slate-300">Modèle IA Prêt</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] ml-1"></span>
              </>
            )}
            {modelStatus === 'loading' && (
              <>
                <Loader2 className="w-3.5 h-3.5 text-[#38D9E6] animate-spin" />
                <span className="text-slate-300">Chargement IA...</span>
              </>
            )}
            {modelStatus === 'error' && (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span className="text-rose-300">Erreur Modèle</span>
              </>
            )}
            {modelStatus === 'unloaded' && (
              <>
                <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                <span className="text-slate-400">En attente</span>
              </>
            )}
          </div>

          {/* Privacy Indicator */}
          <div 
            title="Traitement 100% navigateur — Aucune image transmise sur serveur"
            className="hidden lg:flex items-center space-x-1 px-2 py-1 rounded-lg bg-[#151D30]/60 border border-[#222E47] text-[11px] text-slate-400"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#34D399]" />
            <span>RGPD & No-Server</span>
          </div>

          {/* Help Button */}
          <button
            onClick={onOpenHelp}
            className="p-2 text-slate-400 hover:text-[#38D9E6] rounded-lg hover:bg-[#151D30] transition-colors"
            title="Consulter le guide et les règles d'audit"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>

      </div>
    </header>
  );
};
