
import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Language } from '../types';
import { t } from '../services/i18n';
import { 
  User as UserIcon, 
  Globe, 
  Bell, 
  Lock, 
  HelpCircle, 
  LogOut, 
  ChevronRight, 
  X, 
  Check, 
  Camera, 
  Mail
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';

export const ProfilePage: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const [showLangModal, setShowLangModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // User Info state (mock)
  const [user, setUser] = useState({
    nickname: 'Alex Johnson',
    email: 'alex.j@example.com',
    avatar: 'https://picsum.photos/200/200'
  });

  // Edit Buffer
  const [editNickname, setEditNickname] = useState(user.nickname);

  const langNames = {
    [Language.ZH_CN]: t('lang.zh', language),
    [Language.EN_US]: t('lang.en', language),
    [Language.DE_DE]: t('lang.de', language),
  };

  const handleSaveProfile = () => {
    setUser(prev => ({ ...prev, nickname: editNickname }));
    setShowEditModal(false);
  };

  const menuItems = [
    { 
      icon: Globe, 
      label: t('profile.lang', language), 
      value: langNames[language], 
      action: () => setShowLangModal(true) 
    },
    { icon: Bell, label: t('profile.notifications', language) },
    { icon: Lock, label: t('profile.privacy', language) },
    { icon: HelpCircle, label: t('profile.help', language) },
  ];

  const LanguageModal = () => (
    <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-md p-4 pb-20 sm:pb-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl animate-in slide-in-from-bottom duration-500">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">{t('profile.lang', language)}</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">App Preference</p>
          </div>
          <button onClick={() => setShowLangModal(false)} className="p-2.5 bg-slate-100 rounded-full text-slate-400 active:scale-90 transition-transform">
            <X size={18} />
          </button>
        </div>
        <div className="space-y-3">
          {Object.values(Language).map((lang) => (
            <button
              key={lang}
              onClick={() => {
                setLanguage(lang);
                setShowLangModal(false);
              }}
              className={`w-full flex items-center justify-between p-5 rounded-3xl transition-all border ${
                language === lang 
                  ? 'bg-indigo-50 border-indigo-200 shadow-sm' 
                  : 'bg-slate-50 border-transparent hover:bg-slate-100'
              }`}
            >
              <span className={`text-sm font-bold ${language === lang ? 'text-indigo-600' : 'text-slate-600'}`}>
                {langNames[lang]}
              </span>
              {language === lang && (
                <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                  <Check size={14} className="text-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const EditProfileModal = () => (
    <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-md p-4 pb-20 sm:pb-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl animate-in slide-in-from-bottom duration-500">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">{t('profile.edit_title', language)}</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Update Info</p>
          </div>
          <button onClick={() => setShowEditModal(false)} className="p-2.5 bg-slate-100 rounded-full text-slate-400 active:scale-90 transition-transform">
            <X size={18} />
          </button>
        </div>
        
        <div className="flex flex-col items-center mb-10">
            <div className="relative group cursor-pointer">
                <div className="w-28 h-28 bg-slate-50 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-xl shadow-slate-200 transition-all group-hover:scale-105">
                    <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                </div>
                <button 
                  onClick={() => setUser(prev => ({ ...prev, avatar: `https://picsum.photos/200/200?sig=${Math.random()}` }))}
                  className="absolute -bottom-2 -right-2 p-3 bg-indigo-600 text-white rounded-2xl border-4 border-white shadow-xl active:scale-90 transition-transform"
                >
                    <Camera size={16} />
                </button>
            </div>
            <span className="text-[10px] font-black text-slate-400 mt-4 uppercase tracking-[0.2em]">{t('profile.avatar', language)}</span>
        </div>

        <div className="space-y-5 mb-10">
            <div>
                <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest px-2">
                    {t('profile.nickname', language)}
                </label>
                <div className="relative">
                    <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input 
                        type="text" 
                        value={editNickname}
                        onChange={(e) => setEditNickname(e.target.value)}
                        className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all text-sm font-bold text-slate-800"
                        placeholder="Your nickname"
                    />
                </div>
            </div>
            <div>
                <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest px-2 opacity-50">
                    {t('login.email', language)}
                </label>
                <div className="relative">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-200" size={18} />
                    <input 
                        type="email" 
                        value={user.email}
                        readOnly
                        className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-50 rounded-2xl text-sm font-bold text-slate-300 cursor-not-allowed"
                    />
                </div>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <Button variant="secondary" fullWidth onClick={() => setShowEditModal(false)} className="rounded-2xl">
                {t('btn.cancel', language)}
            </Button>
            <Button variant="primary" fullWidth onClick={handleSaveProfile} className="rounded-2xl">
                {t('btn.save', language)}
            </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="pb-32 bg-slate-50 min-h-screen">
        <div className="bg-white p-6 pb-12 rounded-b-[3rem] shadow-sm mb-8 border-b border-slate-100">
            <h1 className="text-lg font-black mb-10 tracking-tight">{t('profile.title', language)}</h1>
            <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-indigo-50 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl shadow-indigo-100">
                    <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                </div>
                <div>
                    <h2 className="text-xl font-black text-slate-900 mb-1">{user.nickname}</h2>
                    <p className="text-xs font-bold text-slate-400 mb-3">{user.email}</p>
                    <button 
                        onClick={() => {
                            setEditNickname(user.nickname);
                            setShowEditModal(true);
                        }}
                        className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-5 py-2 rounded-full hover:bg-indigo-100 transition-colors uppercase tracking-widest border border-indigo-100/50"
                    >
                        {t('profile.edit', language)}
                    </button>
                </div>
            </div>
        </div>

        <div className="px-5 space-y-6">
            {/* General Settings */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                {menuItems.map((item, idx) => (
                    <div 
                        key={item.label} 
                        onClick={item.action}
                        className={`flex items-center p-5 hover:bg-slate-50 cursor-pointer active:bg-slate-100 transition-colors ${idx !== menuItems.length -1 ? 'border-b border-slate-50' : ''}`}
                    >
                        <div className="w-10 h-10 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mr-5">
                            <item.icon size={20} />
                        </div>
                        <span className="flex-1 text-xs font-black text-slate-700 tracking-tight">{item.label}</span>
                        {item.value && <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-4 py-1.5 rounded-xl mr-3 uppercase tracking-tight border border-indigo-100/50">{item.value}</span>}
                        <ChevronRight size={18} className="text-slate-300" />
                    </div>
                ))}
            </div>

            <button 
                onClick={() => navigate('/')}
                className="w-full bg-white text-red-500 font-black text-[10px] p-5 rounded-[2rem] shadow-sm border border-slate-100 flex items-center justify-center gap-3 hover:bg-red-50 transition-colors active:scale-95 uppercase tracking-widest"
            >
                <LogOut size={18} />
                {t('profile.signout', language)}
            </button>
            
            <div className="text-center text-[10px] font-black text-slate-300 mt-12 tracking-[0.2em] uppercase pb-10">
                Version 2.4.0 (Build 182)
            </div>
        </div>

        {showLangModal && <LanguageModal />}
        {showEditModal && <EditProfileModal />}
    </div>
  );
};
