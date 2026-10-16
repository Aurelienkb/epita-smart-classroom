import React from 'react';
import { X, Sparkles, ShieldCheck, CheckCircle2, AlertTriangle, HelpCircle } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#151D30] border border-[#222E47] rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative text-slate-300 text-xs sm:text-sm max-h-[90vh] overflow-y-auto">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-xl bg-[#0B1020] border border-[#222E47]"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2.5 rounded-2xl bg-[#0B1020] border border-[#38D9E6]/40 text-[#38D9E6]">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white">
              Guide d'Utilisation EPITA SmartScan
            </h2>
            <p className="text-xs text-slate-400">
              Audit automatisé des salles de cours par Vision IA embarquée
            </p>
          </div>
        </div>

        {/* Workflow steps */}
        <div className="space-y-4 mb-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#38D9E6]">
            Protocole d'Audit en 4 Étapes
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-[#0B1020] p-3.5 rounded-xl border border-[#222E47]">
              <div className="flex items-center space-x-2 text-white font-bold text-xs mb-1">
                <span className="w-5 h-5 rounded-full bg-[#38D9E6] text-[#0B1020] flex items-center justify-center text-[10px]">1</span>
                <span>Sélection & Cadrage</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Sélectionnez la salle cible (ex. Salle 104) et cadrez le mobilier depuis le fond de la classe.
              </p>
            </div>

            <div className="bg-[#0B1020] p-3.5 rounded-xl border border-[#222E47]">
              <div className="flex items-center space-x-2 text-white font-bold text-xs mb-1">
                <span className="w-5 h-5 rounded-full bg-[#38D9E6] text-[#0B1020] flex items-center justify-center text-[10px]">2</span>
                <span>Capture & Inférence IA</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Déclenchez l'analyse sur image figée. Le modèle COCO-SSD détecte les chaises, tables et laptops.
              </p>
            </div>

            <div className="bg-[#0B1020] p-3.5 rounded-xl border border-[#222E47]">
              <div className="flex items-center space-x-2 text-white font-bold text-xs mb-1">
                <span className="w-5 h-5 rounded-full bg-[#38D9E6] text-[#0B1020] flex items-center justify-center text-[10px]">3</span>
                <span>Contrôle & Human-in-the-Loop</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Consultez les écarts observés. Validez in-situ les équipements non reconnus par l'IA (tableaux, fenêtres).
              </p>
            </div>

            <div className="bg-[#0B1020] p-3.5 rounded-xl border border-[#222E47]">
              <div className="flex items-center space-x-2 text-white font-bold text-xs mb-1">
                <span className="w-5 h-5 rounded-full bg-[#38D9E6] text-[#0B1020] flex items-center justify-center text-[10px]">4</span>
                <span>Exportation du Rapport</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Générez le compte-rendu officiel avec horodatage, visa de contrôle et export PDF d'impression.
              </p>
            </div>
          </div>
        </div>

        {/* Ethical commitment banner */}
        <div className="bg-[#0B1020] p-4 rounded-2xl border border-[#34D399]/40 flex items-start space-x-3 text-xs mb-6">
          <ShieldCheck className="w-5 h-5 text-[#34D399] shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-[#34D399]">Engagement Éthique & Respect du Sujet d'Examen</p>
            <p className="text-slate-400 text-[11px] mt-1 leading-relaxed">
              Conformément aux directives de l'examen GITM, aucune personne n'est analysée ou identifiée. Tout individu apparaissant dans le champ visuel est automatiquement ignoré par les algorithmes de filtrage. Les images restent à 100% sur votre appareil.
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-[#38D9E6] text-[#0B1020] font-bold text-xs text-center shadow-lg shadow-[#38D9E6]/20 hover:opacity-95 transition-all"
        >
          Fermer et continuer
        </button>

      </div>
    </div>
  );
};
