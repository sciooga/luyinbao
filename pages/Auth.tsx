
import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { t } from '../services/i18n';
import { Button } from '../components/Button';
import { Mail, Lock, Globe, Check, X, ShieldCheck, Image as ImageIcon, RefreshCw, KeyRound, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Language } from '../types';

export const AuthPage: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  // Fixed: Added const to declare navigate
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [loginSubMode, setLoginSubMode] = useState<'password' | 'code'>('password');
  const [isLoading, setIsLoading] = useState(false);
  const [showLangModal, setShowLangModal] = useState(false);
  
  // Form states - Pre-filled for testing
  const [email, setEmail] = useState('test@test.com');
  const [password, setPassword] = useState('123456');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [code, setCode] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaValue, setCaptchaValue] = useState('');
  const [agreed, setAgreed] = useState(true);
  
  // Timer for verification code
  const [timer, setTimer] = useState(0);

  const generateCaptcha = useCallback(() => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 4; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaValue(result);
  }, []);

  useEffect(() => {
    generateCaptcha();
  }, [generateCaptcha, mode]);
  
  useEffect(() => {
    let interval: any;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleSendCode = () => {
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      alert(t(mode === 'login' ? 'login.err_invalid_email' : 'register.err_email', language));
      return;
    }
    
    // Captcha is required for both registration and password recovery
    if ((mode === 'register' || mode === 'forgot') && captchaInput.toUpperCase() !== captchaValue) {
      alert(t('register.err_captcha', language));
      generateCaptcha();
      return;
    }

    setTimer(60);
    // Mock sending code
    console.log('Verification code sent to:', email);
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Agreement is required for login and register
    if (mode !== 'forgot' && !agreed) {
      alert(t('auth.err_agreement', language));
      return;
    }

    // Login mode logic
    if (mode === 'login') {
      if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        alert(t('login.err_invalid_email', language));
        return;
      }
      if (loginSubMode === 'password' && !password) {
        alert(t('login.err_failed', language));
        return;
      }
      if (loginSubMode === 'code' && code.length < 4) {
        alert(t('login.err_failed', language));
        return;
      }
    }

    // Registration and Forgot password logic
    if (mode === 'register' || mode === 'forgot') {
      if (captchaInput.toUpperCase() !== captchaValue) {
        alert(t('register.err_captcha', language));
        generateCaptcha();
        return;
      }
      if (code.length < 4) {
        alert('请输入正确的验证码');
        return;
      }
      if (password.length < 6) {
        alert('密码长度至少为6位');
        return;
      }
      if (password !== confirmPassword) {
        alert(t('register.err_password_match', language));
        return;
      }
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      
      if (mode === 'forgot') {
        alert(t('forgot.success', language));
        setMode('login');
        return;
      }

      // Mock failure simulation for "error@example.com"
      if (email === 'error@example.com') {
        alert(t('login.err_failed', language));
        return;
      }
      navigate('/device');
    }, 1500);
  };

  const resetForm = () => {
    setTimer(0);
    setCode('');
    setCaptchaInput('');
    setPassword(mode === 'login' ? '123456' : '');
    setConfirmPassword('');
    setAgreed(true);
    generateCaptcha();
  };

  const langNames = {
    [Language.ZH_CN]: '简体中文',
    [Language.EN_US]: 'English',
    [Language.DE_DE]: 'Deutsch',
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative">
      {/* Language Toggle */}
      <div className="absolute top-6 right-6">
        <button 
          onClick={() => setShowLangModal(true)}
          className="flex items-center gap-2 p-2 px-3 rounded-full bg-white shadow-sm hover:bg-slate-50 text-slate-600 transition-all border border-slate-100"
        >
          <Globe size={18} />
          <span className="text-[10px] font-bold uppercase tracking-widest">{language.split('-')[0]}</span>
        </button>
      </div>

      <div className="w-full max-w-sm py-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-[1.5rem] mx-auto mb-4 flex items-center justify-center shadow-xl shadow-indigo-100">
            <div className="w-6 h-6 border-4 border-white rounded-full opacity-80" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t('app.name', language)}</h1>
          <p className="text-slate-400 font-medium text-sm mt-1">
            {mode === 'login' ? t('login.title', language) : (mode === 'register' ? t('register.title', language) : t('forgot.title', language))}
          </p>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-[2rem] shadow-sm border border-slate-100">
          {mode === 'forgot' && (
            <button 
                onClick={() => { setMode('login'); resetForm(); }}
                className="mb-6 flex items-center text-[10px] font-bold text-slate-400 hover:text-indigo-600 uppercase tracking-widest transition-colors"
            >
                <ChevronLeft size={14} />
                {t('forgot.back_to_login', language)}
            </button>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-widest px-1">
                {t('login.email', language)}
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all text-sm font-medium text-slate-700"
                  placeholder="name@example.com"
                  required 
                />
              </div>
            </div>

            {mode !== 'login' && (
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-widest px-1">
                  {t('register.captcha', language)}
                </label>
                <div className="relative flex gap-2">
                  <div className="relative flex-1">
                    <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input 
                      type="text" 
                      value={captchaInput}
                      onChange={(e) => setCaptchaInput(e.target.value)}
                      className="w-full pl-11 pr-2 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all text-sm font-medium text-slate-700 uppercase"
                      placeholder="ABCD"
                      required
                    />
                  </div>
                  <div 
                    onClick={generateCaptcha}
                    className="w-24 bg-slate-100 rounded-2xl flex items-center justify-center relative cursor-pointer overflow-hidden border border-slate-200 group"
                  >
                    <span className="text-indigo-600 font-black italic tracking-widest select-none pointer-events-none transform -skew-x-12 opacity-80">
                      {captchaValue}
                    </span>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 flex items-center justify-center transition-colors">
                      <RefreshCw size={12} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {(mode !== 'login' || (mode === 'login' && loginSubMode === 'code')) && (
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-widest px-1">
                  {t('register.code', language)}
                </label>
                <div className="relative flex gap-2">
                  <div className="relative flex-1">
                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input 
                      type="text" 
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all text-sm font-medium text-slate-700"
                      placeholder="123456"
                      required
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSendCode}
                    disabled={timer > 0}
                    className="whitespace-nowrap px-4 py-3 bg-indigo-50 text-indigo-600 rounded-2xl text-[10px] font-bold uppercase tracking-wider disabled:opacity-50 transition-all active:scale-95"
                  >
                    {timer > 0 ? `${timer}s` : t('register.get_code', language)}
                  </button>
                </div>
              </div>
            )}

            {(mode !== 'login' || (mode === 'login' && loginSubMode === 'password')) && (
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-widest px-1">
                  {mode === 'forgot' ? t('forgot.new_password', language) : t('login.password', language)}
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all text-sm font-medium text-slate-700"
                    placeholder="••••••••"
                    required 
                  />
                </div>
              </div>
            )}

            {mode !== 'login' && (
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-widest px-1">
                  {mode === 'forgot' ? t('forgot.confirm_new_password', language) : t('register.confirm_password', language)}
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all text-sm font-medium text-slate-700"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
            )}

            {mode !== 'forgot' && (
              <div className="flex items-start gap-2 pt-1 px-1">
                <div className="relative flex items-center mt-0.5">
                  <input
                    type="checkbox"
                    id="agreement"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="peer h-4 w-4 appearance-none rounded border border-slate-300 bg-white transition-all checked:bg-indigo-600 checked:border-indigo-600 focus:outline-none"
                  />
                  <Check className="absolute left-0 top-0 h-4 w-4 text-white opacity-0 transition-opacity peer-checked:opacity-100 pointer-events-none p-0.5" />
                </div>
                <label htmlFor="agreement" className="text-[10px] text-slate-500 leading-normal">
                  {t('auth.agreement_prefix', language)}
                  <span className="text-indigo-600 font-bold ml-0.5 cursor-pointer hover:underline">{t('auth.user_agreement', language)}</span>
                  <span className="mx-0.5">{language === Language.ZH_CN ? '及' : '&'}</span>
                  <span className="text-indigo-600 font-bold cursor-pointer hover:underline">{t('auth.privacy_policy', language)}</span>
                </label>
              </div>
            )}

            <Button type="submit" fullWidth isLoading={isLoading} className="rounded-2xl h-12 mt-2">
              {mode === 'login' ? t('login.btn', language) : (mode === 'register' ? t('register.btn', language) : t('forgot.reset_btn', language))}
            </Button>
          </form>

          {mode === 'login' && (
            <div className="mt-4 flex justify-between items-center px-1">
              <button 
                onClick={() => { setMode('forgot'); resetForm(); }}
                className="text-[10px] font-bold text-slate-400 hover:text-indigo-600 transition-colors"
              >
                {t('login.forgot_password', language)}
              </button>
              
              <button 
                onClick={() => {
                  setLoginSubMode(loginSubMode === 'password' ? 'code' : 'password');
                  resetForm();
                }}
                className="text-[10px] font-bold text-slate-400 hover:text-indigo-600 uppercase tracking-widest flex items-center gap-1.5 transition-colors"
              >
                <KeyRound size={12} />
                {loginSubMode === 'password' ? t('login.quick_login', language) : t('login.password_login', language)}
              </button>
            </div>
          )}

          {mode !== 'forgot' && (
            <div className="mt-8 flex justify-center pt-4 border-t border-slate-50">
               <button 
                  onClick={() => {
                    setMode(mode === 'login' ? 'register' : 'login');
                    resetForm();
                  }}
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-bold tracking-tight"
               >
                  {mode === 'login' ? t('register.switch_reg', language) : t('register.switch_login', language)}
               </button>
            </div>
          )}
        </div>
      </div>

      {showLangModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-bold text-slate-900">{t('profile.lang', language)}</h3>
              <button onClick={() => setShowLangModal(false)} className="p-2 bg-slate-100 rounded-full text-slate-400">
                <X size={16} />
              </button>
            </div>
            <div className="space-y-2">
              {Object.values(Language).map((lang) => (
                <button
                  key={lang}
                  onClick={() => {
                    setLanguage(lang);
                    setShowLangModal(false);
                  }}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${
                    language === lang ? 'bg-indigo-50 border border-indigo-100' : 'bg-slate-50 border border-transparent'
                  }`}
                >
                  <span className={`text-sm font-bold ${language === lang ? 'text-indigo-600' : 'text-slate-600'}`}>
                    {langNames[lang]}
                  </span>
                  {language === lang && <Check size={18} className="text-indigo-600" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
