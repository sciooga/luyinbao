import React from 'react';
import { NavLink } from 'react-router-dom';
import { Library, User, Radio } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { t } from '../services/i18n';

export const BottomNav: React.FC = () => {
  const { language } = useLanguage();

  const getLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex flex-col items-center justify-center w-full h-full space-y-1 text-[10px] font-bold transition-all ${
      isActive ? 'text-indigo-600 scale-110' : 'text-slate-400 hover:text-slate-600'
    }`;

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-lg border-t border-slate-100 flex justify-around items-center px-4 z-50 shadow-[0_-8px_20px_-6px_rgba(0,0,0,0.05)]">
      <NavLink to="/device" className={getLinkClass}>
        <Radio size={20} />
        <span className="tracking-tight">{t('tab.device', language)}</span>
      </NavLink>
      <NavLink to="/recordings" className={getLinkClass}>
        <Library size={20} />
        <span className="tracking-tight">{t('tab.recordings', language)}</span>
      </NavLink>
      <NavLink to="/profile" className={getLinkClass}>
        <User size={20} />
        <span className="tracking-tight">{t('tab.profile', language)}</span>
      </NavLink>
    </nav>
  );
};