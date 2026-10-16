import React from 'react';
import { 
  Building2, 
  Settings, 
  Camera, 
  Sparkles, 
  SlidersHorizontal, 
  FileCheck2, 
  Check, 
  ChevronRight,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { AuditWorkflowStep } from '../types';

interface GuidedAuditStepperProps {
  currentStep: AuditWorkflowStep;
  onGoToStep: (step: AuditWorkflowStep) => void;
  canProceedToStep5: boolean; // Needs image analyzed
  canProceedToStep6: boolean; // Needs review done
}

export const GuidedAuditStepper: React.FC<GuidedAuditStepperProps> = ({
  currentStep,
  onGoToStep,
  canProceedToStep5,
  canProceedToStep6
}) => {
  const steps = [
    { step: 1 as AuditWorkflowStep, label: 'Salle', desc: 'Sélection', icon: Building2 },
    { step: 2 as AuditWorkflowStep, label: 'Dotation', desc: 'Config cible', icon: Settings },
    { step: 3 as AuditWorkflowStep, label: 'Capture', desc: 'Photo / Démo', icon: Camera },
    { step: 4 as AuditWorkflowStep, label: 'Analyse', desc: 'Inférence IA', icon: Sparkles },
    { step: 5 as AuditWorkflowStep, label: 'Révision', desc: 'Contrôle humain', icon: SlidersHorizontal, disabled: !canProceedToStep5 },
    { step: 6 as AuditWorkflowStep, label: 'Rapport', desc: 'Validation PDF', icon: FileCheck2, disabled: !canProceedToStep6 }
  ];

  return (
    <div className="no-print bg-[#151D30] border border-[#222E47] rounded-2xl p-3 sm:p-4 shadow-xl">
      
      {/* Top Header Label */}
      <div className="flex items-center justify-between mb-3 px-1 text-xs">
        <span className="font-bold text-white flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-[#38D9E6] animate-pulse"></span>
          <span>Parcours d'Audit Guidé (Workflow en 6 Étapes)</span>
        </span>
        <span className="text-[#38D9E6] font-semibold text-[11px]">
          Étape {currentStep} sur 6 : {steps[currentStep - 1].desc}
        </span>
      </div>

      {/* Steps Breadcrumb / Stepper Row */}
      <div className="grid grid-cols-6 gap-1 sm:gap-2">
        {steps.map((s) => {
          const Icon = s.icon;
          const isActive = currentStep === s.step;
          const isDone = currentStep > s.step;

          return (
            <button
              key={s.step}
              onClick={() => !s.disabled && onGoToStep(s.step)}
              disabled={s.disabled}
              className={`flex flex-col items-center justify-center p-2 rounded-xl text-center transition-all ${
                isActive 
                  ? 'bg-[#1B253D] border border-[#38D9E6] text-[#38D9E6] shadow-md shadow-[#38D9E6]/10' 
                  : isDone
                    ? 'bg-[#0B1020]/80 border border-[#34D399]/40 text-[#34D399] hover:bg-[#151D30]'
                    : s.disabled
                      ? 'bg-[#0B1020]/30 border border-[#222E47]/50 text-slate-600 cursor-not-allowed'
                      : 'bg-[#0B1020] border border-[#222E47] text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                {isDone ? (
                  <div className="w-5 h-5 rounded-full bg-[#34D399] text-[#0B1020] flex items-center justify-center font-bold">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                ) : (
                  <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive ? 'text-[#38D9E6]' : ''}`} />
                )}
              </div>

              <span className="text-[10px] sm:text-xs font-bold mt-1 tracking-tight truncate w-full">
                {s.label}
              </span>
              <span className="hidden md:block text-[9px] text-slate-400 truncate w-full">
                {s.desc}
              </span>
            </button>
          );
        })}
      </div>

      {/* Quick Step Next / Prev Actions for Smartphone */}
      <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#222E47]/70 text-xs">
        <button
          onClick={() => onGoToStep((Math.max(1, currentStep - 1) as AuditWorkflowStep))}
          disabled={currentStep === 1}
          className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-[#0B1020] border border-[#222E47] text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Précédent</span>
        </button>

        <div className="text-[11px] text-slate-400 font-medium">
          {currentStep === 1 && 'Choisissez la salle à contrôler'}
          {currentStep === 2 && 'Vérifiez les quotas cibles'}
          {currentStep === 3 && 'Cadrez le mobilier ou chargez un cliché étalon'}
          {currentStep === 4 && 'Lancez la détection TensorFlow.js'}
          {currentStep === 5 && 'Validez ou rectifiez les boîtes englobantes'}
          {currentStep === 6 && 'Téléchargez ou imprimez le livrable officiel'}
        </div>

        <button
          onClick={() => onGoToStep((Math.min(6, currentStep + 1) as AuditWorkflowStep))}
          disabled={currentStep === 6 || (currentStep === 4 && !canProceedToStep5) || (currentStep === 5 && !canProceedToStep6)}
          className="flex items-center space-x-1 px-3.5 py-1.5 rounded-lg bg-[#38D9E6] text-[#0B1020] font-bold disabled:opacity-30 disabled:cursor-not-allowed shadow-md shadow-[#38D9E6]/10"
        >
          <span>Suivant</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
};
