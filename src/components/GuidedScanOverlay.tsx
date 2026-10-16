import React, { useState } from 'react';
import { 
  Lightbulb, 
  Eye, 
  Maximize2, 
  Sun, 
  ShieldCheck, 
  ChevronRight, 
  X,
  Compass
} from 'lucide-react';

export const GuidedScanOverlay: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const tips = [
    {
      icon: Maximize2,
      title: 'Cadrage panoramique',
      desc: 'Positionnez-vous au fond de la salle pour englober un maximum de rangées de tables et chaises.'
    },
    {
      icon: Eye,
      title: 'Gestion des occultations',
      desc: 'Les dossiers de chaises peuvent masquer les assises arrière. Un angle légèrement surélevé améliore la visibilité.'
    },
    {
      icon: Sun,
      title: 'Éclairage & Reflets',
      desc: 'Allumez les éclairages de la classe et évitez d\'orienter la caméra face aux fenêtres en contre-jour.'
    },
    {
      icon: ShieldCheck,
      title: 'Protection de la vie privée',
      desc: 'Aucune personne ne doit être cadrée. Le système filtre et ignore automatiquement toute silhouette humaine.'
    }
  ];

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-[#151D30]/90 border border-[#38D9E6]/40 text-[#38D9E6] text-xs font-medium hover:bg-[#151D30] transition-all shadow-sm"
      >
        <Compass className="w-3.5 h-3.5 text-[#38D9E6] animate-spin-slow" />
        <span>Conseils de cadrage (Guided Scan)</span>
      </button>
    );
  }

  return (
    <div className="relative bg-[#151D30] border border-[#38D9E6]/30 rounded-xl p-3 sm:p-4 text-xs shadow-lg animate-fadeIn">
      <div className="flex items-center justify-between border-b border-[#222E47] pb-2 mb-3">
        <div className="flex items-center space-x-2 text-[#38D9E6] font-semibold text-sm">
          <Lightbulb className="w-4 h-4" />
          <span>Guide d'audit visuel — Bonnes pratiques</span>
        </div>
        <button 
          onClick={() => setIsOpen(false)}
          className="text-slate-400 hover:text-white p-1 rounded-lg"
          aria-label="Fermer le guide"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {tips.map((tip, idx) => {
          const Icon = tip.icon;
          return (
            <div key={idx} className="flex items-start space-x-2.5 bg-[#0B1020]/60 p-2 rounded-lg border border-[#222E47]/70">
              <div className="p-1.5 rounded bg-[#151D30] text-[#38D9E6] shrink-0 mt-0.5">
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="font-semibold text-slate-200">{tip.title}</p>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{tip.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 pt-2 border-t border-[#222E47] flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center space-x-1">
          <ShieldCheck className="w-3 h-3 text-[#34D399]" />
          <span>Conforme RGPD & Détection éthique</span>
        </span>
        <button 
          onClick={() => setIsOpen(false)}
          className="text-[#38D9E6] hover:underline font-medium"
        >
          Compris
        </button>
      </div>
    </div>
  );
};
