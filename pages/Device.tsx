
import React, { useState } from 'react';
import { useDevice } from '../contexts/DeviceContext';
import { useLanguage } from '../contexts/LanguageContext';
import { t } from '../services/i18n';
import { ConnectionStatus } from '../types';
import { 
  Bluetooth, 
  Battery, 
  Disc3, 
  Power, 
  RefreshCw, 
  FileAudio, 
  CheckCircle, 
  Download, 
  Trash2, 
  History, 
  Calendar, 
  Clock,
  X,
  AlertCircle,
  Mic,
  Square,
  Activity,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Music,
  Settings,
  ListChecks,
  Check
} from 'lucide-react';
import { Button } from '../components/Button';

export const DevicePage: React.FC = () => {
  const { 
    status, 
    deviceName, 
    batteryLevel, 
    scanForDevices, 
    disconnect, 
    deviceFiles, 
    connectionHistory,
    syncFile, 
    syncAll, 
    deleteDeviceFile,
    checkIsSynced,
    isRecording,
    recordingSeconds,
    toggleRecording,
    isMusicPlaying,
    toggleMusicPlay,
    playNextTrack,
    playPrevTrack,
    musicVolume,
    setMusicVolume,
    buttonPressDuration,
    setButtonPressDuration
  } = useDevice();
  const { language } = useLanguage();
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showSyncPrompt, setShowSyncPrompt] = useState(false);
  const [isCustomDuration, setIsCustomDuration] = useState(![30, 45, 60].includes(buttonPressDuration));

  // Multi-select State
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);

  const handleSyncOne = async (file: any) => {
    setSyncingId(file.id);
    await syncFile(file);
    setSyncingId(null);
  };

  const handleSyncAll = async () => {
    setIsSyncingAll(true);
    await syncAll();
    setIsSyncingAll(false);
  };

  const handleDeleteDeviceFile = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if(confirm(t('btn.delete', language) + '?')) {
        deleteDeviceFile(id);
    }
  };

  const handleFileClick = (file: any) => {
    if (!checkIsSynced(file.id)) {
        setShowSyncPrompt(true);
        setTimeout(() => setShowSyncPrompt(false), 2500);
    }
  };

  const handleDurationSelect = (val: number | 'custom') => {
    if (val === 'custom') {
      setIsCustomDuration(true);
    } else {
      setIsCustomDuration(false);
      setButtonPressDuration(val);
      console.log(`Command: Set hardware rec duration to ${val}s`);
    }
  };

  const toggleSelectMode = () => {
    if (isSelectMode) {
        setIsSelectMode(false);
        setSelectedIds(new Set());
    } else {
        setIsSelectMode(true);
    }
  };

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === deviceFiles.length) {
        setSelectedIds(new Set());
    } else {
        setSelectedIds(new Set(deviceFiles.map(f => f.id)));
    }
  };

  const handleBatchSync = async () => {
    setIsBatchProcessing(true);
    const files = deviceFiles.filter(f => selectedIds.has(f.id));
    for (const f of files) {
        await syncFile(f);
    }
    setIsBatchProcessing(false);
    setIsSelectMode(false);
    setSelectedIds(new Set());
  };

  const handleBatchDelete = () => {
    if (confirm(t('btn.delete', language) + ` (${selectedIds.size})?`)) {
        setIsBatchProcessing(true);
        selectedIds.forEach(id => deleteDeviceFile(id));
        setIsBatchProcessing(false);
        // If all deleted, exit select mode
        if (deviceFiles.filter(f => !selectedIds.has(f.id)).length === 0) {
             setIsSelectMode(false);
        }
        setSelectedIds(new Set());
    }
  };

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleString(language, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const HistoryModal = () => (
    <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-md p-4 pb-20 sm:pb-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl animate-in slide-in-from-bottom duration-500 max-h-[75vh] flex flex-col">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
              <History size={20} />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">{t('device.history', language)}</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Device Logs</p>
            </div>
          </div>
          <button onClick={() => setShowHistory(false)} className="p-2.5 bg-slate-100 rounded-full text-slate-400 active:scale-90 transition-transform">
            <X size={18} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 pb-4 px-1">
          {connectionHistory.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
               <History size={40} className="mx-auto mb-4 opacity-10" />
               <p className="text-[10px] font-black uppercase tracking-widest">No logs available</p>
            </div>
          ) : (
            connectionHistory.map(record => (
              <div key={record.id} className="bg-slate-50 p-5 rounded-3xl border border-slate-100 flex items-center gap-5 hover:bg-slate-100 transition-colors">
                <div className="w-11 h-11 rounded-2xl bg-white shadow-sm flex items-center justify-center text-indigo-500 border border-slate-100 flex-shrink-0">
                   <Bluetooth size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-slate-800 truncate mb-1">{record.deviceName}</div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                      <Calendar size={12} className="text-slate-300" />
                      {formatDate(record.timestamp).split(',')[0]}
                    </div>
                    {record.durationMinutes && (
                      <div className="flex items-center gap-1.5 text-[10px] text-indigo-500 font-black uppercase tracking-widest">
                        <Clock size={12} className="text-indigo-300" />
                        {record.durationMinutes}m
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  if (status === ConnectionStatus.DISCONNECTED || status === ConnectionStatus.ERROR) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 text-center">
        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-8 relative">
            <Bluetooth size={40} className="text-slate-400" />
            <div className="absolute inset-0 border-4 border-indigo-100 rounded-full animate-ping opacity-20" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">
            {t('status.disconnected', language)}
        </h2>
        <p className="text-slate-500 mb-8 max-w-[240px] text-xs leading-relaxed">
            {t('status.disconnected_desc', language)}
        </h2>
        <div className="space-y-4 w-full max-w-[200px]">
          <Button onClick={scanForDevices} fullWidth className="shadow-indigo-300 h-12">
              {t('btn.scan', language)}
          </Button>
        </div>
      </div>
    );
  }

  if (status === ConnectionStatus.SCANNING || status === ConnectionStatus.CONNECTING) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-6">
        <div className="w-16 h-16 border-[3px] border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-6" />
        <h2 className="text-sm font-semibold text-slate-700 animate-pulse tracking-wide">
            {status === ConnectionStatus.SCANNING ? t('status.scanning', language) : t('status.connecting', language)}
        </h2>
      </div>
    );
  }

  return (
    <div className="p-5 space-y-6 pb-32 animate-in fade-in duration-500 slide-in-from-bottom-2">
        {showSyncPrompt && (
            <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[1000] animate-in slide-in-from-top duration-300">
                <div className="bg-indigo-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 font-black text-[10px] uppercase tracking-widest whitespace-nowrap border border-white/20">
                    <AlertCircle size={16} />
                    {t('rec.sync_required', language)}
                </div>
            </div>
        )}

        {/* Device Status Card */}
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-indigo-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6">
               <button 
                  onClick={disconnect}
                  className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all flex items-center justify-center active:scale-90 border border-white/10 backdrop-blur-md"
               >
                  <Power size={18} />
               </button>
            </div>

            <div className="flex justify-between items-start mb-10 pr-12">
                <div>
                    <h2 className="text-2xl font-black tracking-tight leading-none mb-3">{deviceName}</h2>
                    <span className="bg-green-400/20 text-green-300 text-[9px] font-black px-4 py-1.5 rounded-full flex items-center gap-2 w-fit uppercase tracking-[0.15em] border border-green-400/20">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(74,222,128,0.8)]" />
                        {t('status.connected', language)}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 rounded-[2rem] p-5 backdrop-blur-md border border-white/10 flex flex-col">
                    <Battery className="w-5 h-5 mb-3 text-green-300" />
                    <span className="text-[10px] text-indigo-200 font-black uppercase tracking-widest mb-1 opacity-70">{t('device.battery', language)}</span>
                    <span className="text-xl font-black">{batteryLevel}%</span>
                </div>
                <div className="bg-white/10 rounded-[2rem] p-5 backdrop-blur-md border border-white/10 group cursor-pointer active:scale-95 transition-all flex flex-col" onClick={() => setShowHistory(true)}>
                    <History className="w-5 h-5 mb-3 text-indigo-200 group-hover:rotate-12 transition-transform" />
                    <span className="text-[10px] text-indigo-200 font-black uppercase tracking-widest mb-1 opacity-70">{t('device.history', language)}</span>
                    <span className="text-xl font-black">{connectionHistory.length}</span>
                </div>
            </div>
            
            <div className="mt-6 px-1">
               <div className="flex justify-between text-[10px] font-black text-indigo-200 uppercase tracking-[0.2em] mb-2.5 opacity-80">
                  <span>{t('device.storage', language)}</span>
                  <span>12 / 32 GB</span>
               </div>
               <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden backdrop-blur-md">
                  <div className="h-full bg-indigo-300 rounded-full w-[37.5%] shadow-[0_0_8px_rgba(165,180,252,0.4)]" />
               </div>
            </div>
        </div>

        {/* Recording Control */}
        <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-slate-100 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-sm border ${isRecording ? 'bg-red-50 border-red-100 text-red-500' : 'bg-indigo-50 border-indigo-100 text-indigo-600'}`}>
                    {isRecording ? (
                        <div className="relative">
                            <Activity size={24} className="animate-pulse" />
                            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-red-50 animate-bounce" />
                        </div>
                    ) : (
                        <Mic size={24} />
                    )}
                </div>
                <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="text-sm font-black text-slate-800 tracking-tight whitespace-nowrap">
                            {isRecording ? t('device.remote.recording', language) : t('device.remote.title', language)}
                        </h3>
                        {isRecording && <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]" />}
                    </div>
                    <p className="text-[12px] font-black tabular-nums text-slate-400 tracking-wider">
                        {formatDuration(recordingSeconds)}
                    </p>
                </div>
            </div>

            <button 
                onClick={toggleRecording}
                className={`relative h-14 px-6 rounded-2xl flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-[0.15em] transition-all active:scale-95 shadow-lg ${
                    isRecording 
                        ? 'bg-white text-red-500 border-2 border-red-500 shadow-red-50' 
                        : 'bg-indigo-600 text-white shadow-indigo-100'
                }`}
            >
                {isRecording ? (
                    <>
                        <Square size={14} fill="currentColor" />
                        {t('device.remote.stop', language)}
                    </>
                ) : (
                    <>
                        <Mic size={14} />
                        {t('device.remote.start', language)}
                    </>
                )}
            </button>
        </div>

        {/* Device Settings */}
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
             <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                   <Settings size={14} />
                </div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('device.settings.title', language)}</h3>
             </div>

             <div className="space-y-6">
                <div>
                   <label className="block text-xs font-bold text-slate-700 mb-4">{t('device.settings.duration', language)}</label>
                   <div className="flex p-1 bg-slate-100 rounded-2xl">
                      {[30, 45, 60].map((val) => (
                        <button
                          key={val}
                          onClick={() => handleDurationSelect(val)}
                          className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            !isCustomDuration && buttonPressDuration === val 
                              ? 'bg-white text-indigo-600 shadow-sm' 
                              : 'text-slate-400'
                          }`}
                        >
                          {val}s
                        </button>
                      ))}
                      <button
                        onClick={() => handleDurationSelect('custom')}
                        className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          isCustomDuration 
                            ? 'bg-white text-indigo-600 shadow-sm' 
                            : 'text-slate-400'
                        }`}
                      >
                        {t('device.settings.custom', language)}
                      </button>
                   </div>
                </div>

                {isCustomDuration && (
                  <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100/50 animate-in slide-in-from-top-2 duration-300">
                     <div className="flex justify-between items-center mb-4">
                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{t('device.settings.range', language)}</span>
                        <div className="bg-indigo-600 text-white px-3 py-1 rounded-lg text-xs font-black tabular-nums shadow-sm">
                           {buttonPressDuration}{t('device.settings.seconds', language)}
                        </div>
                     </div>
                     <div className="relative h-1.5 bg-indigo-100 rounded-full">
                        <input 
                           type="range"
                           min="10"
                           max="300"
                           step="5"
                           value={buttonPressDuration}
                           onChange={(e) => {
                             const val = parseInt(e.target.value);
                             setButtonPressDuration(val);
                             console.log(`Command: Set hardware rec duration to ${val}s`);
                           }}
                           className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div 
                           className="absolute h-full bg-indigo-600 rounded-full"
                           style={{ width: `${((buttonPressDuration - 10) / (300 - 10)) * 100}%` }}
                        />
                        <div 
                           className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-indigo-600 rounded-full shadow-md pointer-events-none"
                           style={{ left: `${((buttonPressDuration - 10) / (300 - 10)) * 100}%`, transform: 'translate(-50%, -50%)' }}
                        />
                     </div>
                  </div>
                )}
             </div>
        </div>

        {/* Music Control Section */}
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 relative overflow-hidden">
             {/* Background decorative element */}
             <div className="absolute top-0 right-0 p-4 opacity-5">
                <Music size={100} />
             </div>

             <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                   <Music size={14} />
                </div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('device.music.title', language)}</h3>
             </div>

             <div className="flex flex-col gap-6 relative z-10">
                {/* Controls */}
                <div className="flex items-center justify-center gap-8">
                   <button 
                      onClick={playPrevTrack}
                      className="text-slate-300 hover:text-indigo-600 transition-colors active:scale-90"
                   >
                      <SkipBack size={28} fill="currentColor" />
                   </button>
                   
                   <button 
                      onClick={toggleMusicPlay}
                      className={`w-16 h-16 rounded-full flex items-center justify-center shadow-xl transition-all active:scale-95 hover:scale-105 ${
                          isMusicPlaying 
                            ? 'bg-indigo-600 text-white shadow-indigo-200' 
                            : 'bg-white text-indigo-600 border border-indigo-100 shadow-slate-100'
                      }`}
                   >
                      {isMusicPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1"/>}
                   </button>

                   <button 
                      onClick={playNextTrack}
                      className="text-slate-300 hover:text-indigo-600 transition-colors active:scale-90"
                   >
                      <SkipForward size={28} fill="currentColor" />
                   </button>
                </div>

                {/* Volume Slider */}
                <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-4 border border-slate-100">
                    <button onClick={() => setMusicVolume(0)} className="text-slate-400 hover:text-indigo-600 transition-colors">
                        {musicVolume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                    </button>
                    <div className="flex-1 relative h-1.5 bg-slate-200 rounded-full">
                       <input 
                          type="range" 
                          min="0" 
                          max="100" 
                          value={musicVolume} 
                          onChange={(e) => setMusicVolume(parseInt(e.target.value))}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                       />
                       <div 
                          className="absolute top-0 left-0 h-full bg-indigo-600 rounded-full transition-all" 
                          style={{ width: `${musicVolume}%` }} 
                       />
                       <div 
                          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-indigo-600 rounded-full shadow-md pointer-events-none transition-all"
                          style={{ left: `${musicVolume}%`, transform: 'translate(-50%, -50%)' }}
                       />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 tabular-nums w-6 text-right">{musicVolume}</span>
                </div>
             </div>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden relative min-h-[500px]">
             {/* Header */}
             <div className={`flex items-center justify-between px-7 py-6 border-b border-slate-50 transition-colors duration-300 ${isSelectMode ? 'bg-indigo-50/30' : 'bg-white'}`}>
                {isSelectMode ? (
                    <>
                        <div className="flex items-center gap-3 animate-in slide-in-from-left-4 duration-300">
                            <div className="bg-indigo-600 text-white text-lg font-black w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                                {selectedIds.size}
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">{t('device.selected', language)}</p>
                                <button 
                                    onClick={handleSelectAll}
                                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                                >
                                    {selectedIds.size === deviceFiles.length ? t('btn.deselect_all', language) : t('btn.select_all', language)}
                                </button>
                            </div>
                        </div>
                        <button 
                            onClick={() => { setIsSelectMode(false); setSelectedIds(new Set()); }}
                            className="bg-white text-slate-800 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm border border-slate-100 active:scale-95 transition-all hover:bg-slate-50 animate-in slide-in-from-right-4 duration-300"
                        >
                            {t('btn.done', language)}
                        </button>
                    </>
                ) : (
                    <>
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3">
                            <FileAudio size={18} className="text-indigo-500" />
                            {t('device.files', language)}
                        </h3>
                        <div className="flex items-center gap-2">
                             <button 
                                onClick={handleSyncAll}
                                disabled={isSyncingAll || deviceFiles.length === 0}
                                className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-4 py-2 rounded-full hover:bg-indigo-100 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 uppercase tracking-widest border border-indigo-100/50"
                            >
                                <RefreshCw size={14} className={isSyncingAll ? 'animate-spin' : ''} />
                                {t('device.sync_all', language)}
                            </button>
                            <button 
                                onClick={() => setIsSelectMode(true)}
                                disabled={deviceFiles.length === 0}
                                className="p-2 bg-white border border-slate-100 rounded-full text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-50"
                            >
                                <ListChecks size={18} />
                            </button>
                        </div>
                    </>
                )}
             </div>

             <div className="divide-y divide-slate-50 pb-28">
                {deviceFiles.length === 0 ? (
                    <div className="text-center py-20 text-slate-400">
                        <Disc3 size={48} className="mx-auto mb-5 opacity-5 animate-[spin_12s_linear_infinite]" />
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30">{t('device.no_files', language)}</p>
                    </div>
                ) : (
                    deviceFiles.map(file => {
                        const isSynced = checkIsSynced(file.id);
                        return (
                            <div 
                                key={file.id} 
                                onClick={() => isSelectMode ? toggleSelection(file.id) : handleFileClick(file)}
                                className={`flex items-center transition-all duration-200 cursor-pointer group ${
                                    isSelectMode 
                                      ? (selectedIds.has(file.id) ? 'bg-indigo-50/40' : 'hover:bg-slate-50')
                                      : 'hover:bg-slate-50/50'
                                }`}
                            >
                                <div className={`overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] ${isSelectMode ? 'w-16 opacity-100' : 'w-0 opacity-0'}`}>
                                     <div className="w-16 h-full flex items-center justify-center">
                                         <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${
                                             selectedIds.has(file.id) 
                                                ? 'bg-indigo-600 border-indigo-600' 
                                                : 'border-slate-300 bg-white'
                                         }`}>
                                             <Check size={12} className="text-white" strokeWidth={4} />
                                         </div>
                                     </div>
                                </div>

                                <div className={`flex-1 py-5 pr-7 flex items-center justify-between min-w-0 ${!isSelectMode ? 'pl-7' : ''}`}>
                                    <div className="flex items-center gap-5 overflow-hidden min-w-0 flex-1">
                                        <div className="w-12 h-12 rounded-2xl bg-indigo-50/50 flex items-center justify-center text-indigo-500 flex-shrink-0 group-hover:scale-110 transition-transform border border-indigo-100/50">
                                            <Disc3 size={24} />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-sm font-bold text-slate-800 truncate mb-1">{file.filename}</div>
                                            <div className="text-[10px] text-slate-400 flex items-center gap-3 font-bold uppercase tracking-tight">
                                            <span className="text-indigo-500/80 font-black">{formatDuration(file.durationSec)}</span>
                                            <span className="w-1 h-1 bg-slate-200 rounded-full" />
                                            <span>{(file.sizeBytes / 1024 / 1024).toFixed(1)}MB</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {!isSelectMode && (
                                        <div className="flex items-center gap-2 ml-4">
                                            {isSynced ? (
                                                <div className="p-3 text-green-500 bg-green-50 rounded-2xl border border-green-100 shadow-sm">
                                                    <CheckCircle size={16} />
                                                </div>
                                            ) : (
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); handleSyncOne(file); }}
                                                    disabled={!!syncingId}
                                                    className="p-3 text-indigo-600 bg-white hover:bg-indigo-50 rounded-2xl transition-all active:scale-90 border border-slate-100 shadow-sm"
                                                >
                                                    {syncingId === file.id ? <RefreshCw size={16} className="animate-spin" /> : <Download size={16} />}
                                                </button>
                                            )}
                                            <button 
                                                onClick={(e) => handleDeleteDeviceFile(file.id, e)}
                                                className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 hover:border-red-100 rounded-2xl transition-all active:scale-90 border border-transparent"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
             </div>
        </div>
        
        {isSelectMode && (
            <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-[90%] max-w-[380px] z-[50] animate-in slide-in-from-bottom-10 duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]">
                <div className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-2xl shadow-slate-200/50 rounded-[2rem] p-2 flex gap-2">
                    <button 
                        onClick={handleBatchDelete}
                        disabled={selectedIds.size === 0}
                        className="flex-1 py-4 rounded-[1.5rem] hover:bg-red-50 text-slate-400 hover:text-red-500 font-black text-[10px] uppercase tracking-widest transition-all flex flex-col items-center justify-center gap-1 active:scale-95 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400"
                    >
                        <Trash2 size={20} />
                        {t('btn.delete', language)}
                    </button>
                    <button 
                        onClick={handleBatchSync}
                        disabled={selectedIds.size === 0 || isBatchProcessing}
                        className="flex-[2] bg-indigo-600 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.15em] shadow-lg shadow-indigo-200 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
                    >
                        {isBatchProcessing ? <RefreshCw size={20} className="animate-spin" /> : <Download size={20} />}
                        {t('btn.sync_selected', language)}
                    </button>
                </div>
            </div>
        )}

        {showHistory && <HistoryModal />}
    </div>
  );
};
