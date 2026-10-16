import React from 'react';
import { 
  LayoutDashboard, 
  Scan, 
  ClipboardCheck, 
  FileText, 
  Settings2,
  AlertCircle
} from 'lucide-react';

export type TabId = 'overview' | 'scanner' | 'audit' | 'report' | 'settings';

interface NavigationProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  hasAuditReady: boolean;
  discrepanciesCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  hasAuditReady,
  discrepanciesCount = 0
}) => {
  const tabs = [
    { id: 'overview' as TabId, label: 'Accueil', icon: LayoutDashboard },
    { id: 'scanner' as TabId, label: 'Scanner IA', icon: Scan, pulse: true },
    { 
      id: 'audit' as TabId, 
      label: 'Audit & Écarts', 
      icon: ClipboardCheck,
      badge: discrepanciesCount > 0 ? discrepanciesCount : undefined,
      badgeColor: 'bg-rose-500'
    },
    { id: 'report' as TabId, label: 'Rapport', icon: FileText, disabled: !hasAuditReady },
    { id: 'settings' as TabId, label: 'Salles & Config', icon: Settings2 }
  ];

  return (
    <>
      {/* Desktop Navigation Tabs */}
      <nav className="no-print hidden md:block bg-[#0B1020] border-b border-[#222E47]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 py-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  disabled={tab.disabled}
                  className={`
                    relative flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all
                    ${isActive 
                      ? 'bg-[#151D30] text-[#38D9E6] border border-[#38D9E6]/30 shadow-md shadow-[#38D9E6]/5' 
                      : tab.disabled 
                        ? 'text-slate-600 cursor-not-allowed'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-[#151D30]/60'
                    }
                  `}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#38D9E6]' : ''}`} />
                  <span>{tab.label}</span>

                  {tab.badge !== undefined && (
                    <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white animate-pulse">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="no-print md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0B1020]/95 backdrop-blur-lg border-t border-[#222E47] px-2 py-1.5 safe-area-bottom">
        <div className="grid grid-cols-5 gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                disabled={tab.disabled}
                className={`
                  relative flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all
                  ${isActive 
                    ? 'text-[#38D9E6]' 
                    : tab.disabled 
                      ? 'text-slate-600 opacity-40' 
                      : 'text-slate-400 hover:text-slate-200'
                  }
                `}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-[#38D9E6]' : ''}`} />
                  {tab.badge !== undefined && (
                    <span className="absolute -top-1.5 -right-2 px-1 rounded-full text-[9px] font-bold bg-rose-500 text-white">
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-medium tracking-tight mt-1 line-clamp-1">
                  {tab.label}
                </span>

                {isActive && (
                  <span className="absolute bottom-0 w-8 h-0.5 bg-[#38D9E6] rounded-full"></span>
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
