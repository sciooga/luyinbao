
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useDevice } from '../contexts/DeviceContext';
import { useLanguage } from '../contexts/LanguageContext';
import { t } from '../services/i18n';
import { 
  Play, Pause, Share2, Trash2, Heart, Search, 
  Music, X, ChevronLeft, LayoutList, LayoutGrid, 
  HardDrive, Clock, Calendar, CheckSquare, Square, 
  Settings2, FastForward, Rewind, 
  Info, Zap, ShieldCheck, Database, PencilLine,
  ArrowUpDown, Check, Folder, FolderPlus, FolderOpen,
  ArrowLeft, MoveRight, ChevronRight, Pin, PinOff
} from 'lucide-react';
import { Recording, Folder as FolderType } from '../types';

type SortOption = 'date' | 'size' | 'duration';

export const RecordingsPage: React.FC = () => {
  const { 
    localRecordings, 
    folders,
    deleteLocalRecording, 
    renameLocalRecording,
    togglePinRecording,
    createFolder,
    deleteFolder,
    moveRecordingsToFolder 
  } = useDevice();
  const { language } = useLanguage();
  
  // Navigation State
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

  // Playback State
  const [activeRecording, setActiveRecording] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [playbackProgress, setPlaybackProgress] = useState(35);
  
  // View State
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  const [layout, setLayout] = useState<'list' | 'grid'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(null);
  
  // Modals
  const [showShare, setShowShare] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [tempName, setTempName] = useState('');
  
  // New Modals for Folder
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const sortMenuRef = useRef<HTMLDivElement>(null);

  // Batch Selection State
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const currentFolder = useMemo(() => 
    folders.find(f => f.id === currentFolderId), 
  [folders, currentFolderId]);

  // Update selectedRecording whenever localRecordings change
  useEffect(() => {
    if (selectedRecording) {
      const updated = localRecordings.find(r => r.id === selectedRecording.id);
      if (updated) setSelectedRecording(updated);
    }
  }, [localRecordings, selectedRecording]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target as Node)) {
        setIsSortMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredItems = useMemo(() => {
    // 1. Filter Recordings
    let recordings = localRecordings.filter(rec => {
      // If searching, show all matching files regardless of folder
      if (searchQuery) {
        return rec.filename.toLowerCase().includes(searchQuery.toLowerCase());
      }
      // Otherwise show files in current folder
      if (currentFolderId) {
        return rec.folderId === currentFolderId;
      }
      return !rec.folderId; // Root
    });

    recordings.sort((a, b) => {
      // Prioritize pinned items
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      
      if (sortBy === 'date') return b.timestamp - a.timestamp;
      if (sortBy === 'size') return b.sizeBytes - a.sizeBytes;
      if (sortBy === 'duration') return b.durationSec - a.durationSec;
      return 0;
    });

    // 2. Filter Folders (Only show if not searching and in root or allow subfolders later)
    // For this version: Folders only exist at root.
    let displayedFolders: FolderType[] = [];
    if (!searchQuery && !currentFolderId) {
      displayedFolders = folders;
    }

    return { recordings, displayedFolders };
  }, [localRecordings, folders, searchQuery, sortBy, currentFolderId]);

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleString(language, { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatSize = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(1) + 'MB';
  };

  const handlePlay = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (activeRecording === id) {
      setIsPlaying(!isPlaying);
    } else {
      setActiveRecording(id);
      setIsPlaying(true);
      setPlaybackProgress(Math.floor(Math.random() * 80));
    }
  };

  const togglePlaybackSpeed = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const speeds = [1, 1.25, 1.5, 2];
    const currentIndex = speeds.indexOf(playbackSpeed);
    setPlaybackSpeed(speeds[(currentIndex + 1) % speeds.length]);
  };

  const openDetail = (rec: Recording) => {
    if (isSelectMode) {
      toggleSelect(rec.id);
      return;
    }
    setSelectedRecording(rec);
    setViewMode('detail');
    if (activeRecording !== rec.id) {
        setIsPlaying(false);
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleBatchDelete = () => {
    if (selectedIds.size === 0) return;
    if (confirm(t('btn.delete', language) + ` ${selectedIds.size} items?`)) {
      selectedIds.forEach(id => deleteLocalRecording(id));
      setSelectedIds(new Set());
      setIsSelectMode(false);
    }
  };

  const handleDelete = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if(confirm(t('btn.delete', language) + '?')) {
        deleteLocalRecording(id);
        if (selectedRecording?.id === id) {
            setViewMode('list');
            setSelectedRecording(null);
        }
    }
  };

  const handleRename = () => {
    if (selectedRecording && tempName.trim()) {
      renameLocalRecording(selectedRecording.id, tempName.trim());
      setIsRenameModalOpen(false);
    }
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      createFolder(newFolderName.trim());
      setNewFolderName('');
      setIsCreateFolderOpen(false);
    }
  };

  const handleMoveToFolder = (targetFolderId: string | undefined) => {
    moveRecordingsToFolder(Array.from(selectedIds), targetFolderId);
    setSelectedIds(new Set());
    setIsSelectMode(false);
    setIsMoveModalOpen(false);
  };

  const handleDeleteFolder = (folderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const itemCount = localRecordings.filter(r => r.folderId === folderId).length;
    if (itemCount > 0) {
        alert(t('folder.err_not_empty', language));
        return;
    }
    if (confirm(t('folder.delete_confirm', language))) {
      deleteFolder(folderId);
    }
  };

  const RenameModal = () => (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/60 backdrop-blur-md p-6 animate-in fade-in duration-300">
        <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <h3 className="text-lg font-black text-slate-900 mb-2 tracking-tight">
                {t('rec.rename.title', language)}
            </h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-6">
                {t('rec.rename.desc', language)}
            </p>
            
            <input 
                autoFocus
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all text-sm font-bold text-slate-800 mb-8"
                placeholder={t('rec.rename.placeholder', language)}
            />

            <div className="grid grid-cols-2 gap-4">
                <button 
                    onClick={() => setIsRenameModalOpen(false)}
                    className="py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all"
                >
                    {t('btn.cancel', language)}
                </button>
                <button 
                    onClick={handleRename}
                    className="py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-100 active:scale-95 transition-all"
                >
                    {t('btn.save', language)}
                </button>
            </div>
        </div>
    </div>
  );

  const CreateFolderModal = () => (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/60 backdrop-blur-md p-6 animate-in fade-in duration-300">
        <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <h3 className="text-lg font-black text-slate-900 mb-2 tracking-tight">
                {t('folder.create', language)}
            </h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-6">
                {t('folder.name', language)}
            </p>
            
            <input 
                autoFocus
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all text-sm font-bold text-slate-800 mb-8"
                placeholder={t('folder.new_placeholder', language)}
            />

            <div className="grid grid-cols-2 gap-4">
                <button 
                    onClick={() => setIsCreateFolderOpen(false)}
                    className="py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all"
                >
                    {t('btn.cancel', language)}
                </button>
                <button 
                    onClick={handleCreateFolder}
                    className="py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-100 active:scale-95 transition-all"
                >
                    {t('btn.confirm', language)}
                </button>
            </div>
        </div>
    </div>
  );

  const MoveToFolderModal = () => (
    <div className="fixed inset-0 z-[1200] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-md p-4 pb-20 sm:pb-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl animate-in slide-in-from-bottom duration-500">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-black text-slate-900 tracking-tight">{t('folder.move_to', language)}</h3>
          <button onClick={() => setIsMoveModalOpen(false)} className="p-2.5 bg-slate-100 rounded-full text-slate-400 active:scale-90 transition-transform">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3 max-h-[300px] overflow-y-auto no-scrollbar">
           {/* Root Option */}
           <button
             onClick={() => handleMoveToFolder(undefined)}
             className="w-full flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 active:scale-[0.98] transition-all hover:bg-indigo-50 hover:border-indigo-100 group"
           >
              <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover:text-indigo-600">
                 <HardDrive size={20} />
              </div>
              <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-700">{t('folder.root', language)}</span>
           </button>

           {/* Folder Options */}
           {folders.map(folder => (
              <button
                key={folder.id}
                onClick={() => handleMoveToFolder(folder.id)}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 active:scale-[0.98] transition-all hover:bg-amber-50 hover:border-amber-100 group shadow-sm"
              >
                 <div className="w-10 h-10 rounded-xl bg-amber-50 shadow-sm flex items-center justify-center text-amber-500 border border-amber-100">
                    <Folder size={20} />
                 </div>
                 <span className="text-sm font-bold text-slate-700 group-hover:text-amber-700">{folder.name}</span>
              </button>
           ))}
        </div>
      </div>
    </div>
  );

  const ShareModal = () => (
    <div className="fixed inset-0 z-[1100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-md p-4 pb-20 sm:pb-4 animate-in fade-in duration-300">
        <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl animate-in slide-in-from-bottom duration-500">
            <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">{t('share.title', language)}</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Select Platform</p>
                </div>
                <button onClick={() => setShowShare(false)} className="p-2.5 bg-slate-100 rounded-full text-slate-400 active:scale-90 transition-transform">
                    <X size={18} />
                </button>
            </div>
            
            <div className="grid grid-cols-4 gap-6 mb-10">
                {[
                  { name: 'Facebook', color: 'bg-blue-50 text-blue-600' },
                  { name: 'WhatsApp', color: 'bg-green-50 text-green-600' },
                  { name: 'Instagram', color: 'bg-pink-50 text-pink-600' },
                  { name: 'X', color: 'bg-slate-900 text-white' }
                ].map(platform => (
                    <div key={platform.name} className="flex flex-col items-center gap-2">
                        <div className={`${platform.color} w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm active:scale-90 transition-transform cursor-pointer`}>
                            <Share2 size={20} />
                        </div>
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-tight">{platform.name}</span>
                    </div>
                ))}
            </div>
            
            <div className="bg-slate-50 p-5 rounded-3xl mb-8 flex items-center gap-4 border border-slate-100">
                <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-indigo-500 border border-slate-50">
                    <Music size={24} />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-800 truncate">{selectedRecording?.filename}</p>
                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                      {formatDuration(selectedRecording?.durationSec || 0)} • {formatSize(selectedRecording?.sizeBytes || 0)}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <button className="py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.15em] shadow-xl shadow-indigo-100 active:scale-95 transition-all">
                    Original
                </button>
                <button className="py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-[0.15em] active:scale-95 transition-all border border-slate-200/50">
                    Compressed
                </button>
            </div>
        </div>
    </div>
  );

  const FolderItem: React.FC<{ folder: FolderType }> = ({ folder }) => {
    const itemCount = localRecordings.filter(r => r.folderId === folder.id).length;
    
    if (layout === 'list') {
      return (
        <div 
          onClick={() => setCurrentFolderId(folder.id)}
          className="p-4 rounded-3xl bg-white shadow-sm border border-slate-100 flex items-center gap-4 active:scale-[0.98] transition-all hover:bg-amber-50/50 group"
        >
           <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center flex-shrink-0 border border-amber-100 text-amber-500 shadow-sm">
              <Folder size={24} className="fill-current" />
           </div>
           <div className="flex-1 min-w-0">
             <h3 className="text-sm font-bold text-slate-700 truncate mb-1">{folder.name}</h3>
             <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5">
                {itemCount} {t('folder.items_count', language)}
             </span>
           </div>
           
           {!isSelectMode && (
              <button 
                  onClick={(e) => handleDeleteFolder(folder.id, e)}
                  className={`p-2 transition-colors active:scale-90 opacity-0 group-hover:opacity-100 ${itemCount > 0 ? 'text-slate-200 cursor-not-allowed' : 'text-slate-300 hover:text-red-500'}`}
              >
                  <Trash2 size={18} />
              </button>
            )}
            <ChevronLeft className="rotate-180 text-slate-300 mr-2" size={20} />
        </div>
      );
    }
    
    return (
      <div 
        onClick={() => setCurrentFolderId(folder.id)}
        className="rounded-[2rem] bg-white shadow-sm border border-slate-100 p-5 active:scale-[0.97] transition-all flex flex-col justify-between h-32 hover:bg-amber-50/30 group relative"
      >
        <div className="flex justify-between items-start">
           <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500 border border-amber-100">
               <Folder size={20} className="fill-current" />
           </div>
           {!isSelectMode && (
             <button 
                onClick={(e) => handleDeleteFolder(folder.id, e)}
                className={`transition-colors active:scale-90 ${itemCount > 0 ? 'text-slate-200 cursor-not-allowed' : 'text-slate-300 hover:text-red-500'}`}
             >
                <Trash2 size={16} />
             </button>
           )}
        </div>
        <div>
           <h3 className="text-xs font-bold text-slate-700 truncate mb-1">{folder.name}</h3>
           <span className="text-[10px] font-bold text-slate-400">{itemCount} items</span>
        </div>
      </div>
    );
  };

  const ListItem: React.FC<{ rec: Recording }> = ({ rec }) => (
    <div 
        onClick={() => openDetail(rec)}
        className={`p-4 rounded-3xl shadow-sm border flex items-center gap-4 active:scale-[0.98] transition-all group ${
          isSelectMode && selectedIds.has(rec.id) 
            ? 'bg-indigo-50 border-indigo-200' 
            : rec.isPinned 
                ? 'bg-indigo-50/30 border-indigo-100/50'
                : 'bg-white border-slate-100'
        }`}
    >
        {isSelectMode && (
          <div className="mr-1">
            {selectedIds.has(rec.id) ? (
              <CheckSquare className="text-indigo-600" size={20} />
            ) : (
              <Square className="text-slate-300" size={20} />
            )}
          </div>
        )}
        
        <div className="w-14 h-14 bg-slate-50 rounded-2xl overflow-hidden flex-shrink-0 relative shadow-sm border border-slate-100">
            {rec.thumbnailUrl ? (
                <img src={rec.thumbnailUrl} className="w-full h-full object-cover" />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-indigo-300">
                    <Music size={24} />
                </div>
            )}
            {!isSelectMode && (
              <button 
                  onClick={(e) => handlePlay(rec.id, e)}
                  className={`absolute inset-0 flex items-center justify-center transition-all ${activeRecording === rec.id && isPlaying ? 'bg-indigo-600/60 text-white' : 'bg-black/0 text-transparent hover:bg-black/5'}`}
              >
                  {activeRecording === rec.id && isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-1 text-white opacity-0 group-hover:opacity-100" />}
              </button>
            )}
        </div>
        
        <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className={`text-sm font-bold truncate ${rec.isPinned ? 'text-indigo-900' : 'text-slate-700'}`}>{rec.filename}</h3>
              {rec.isPinned && <Pin size={12} className="text-indigo-500 fill-indigo-500 flex-shrink-0" />}
            </div>
            <div className="flex flex-wrap items-center text-[10px] font-bold text-slate-400 gap-x-3 gap-y-1">
                <span className="text-indigo-500 flex items-center gap-1"><Clock size={10}/> {formatDuration(rec.durationSec)}</span>
                <span className="flex items-center gap-1"><Calendar size={10}/> {formatDate(rec.timestamp).split(',')[0]}</span>
                <span className="flex items-center gap-1"><Database size={10}/> {formatSize(rec.sizeBytes)}</span>
            </div>
        </div>

        {!isSelectMode && (
          <div className="flex items-center gap-2">
             <button 
                onClick={(e) => { e.stopPropagation(); togglePinRecording(rec.id); }}
                className={`p-2 transition-colors active:scale-90 ${rec.isPinned ? 'text-indigo-500' : 'text-slate-300 hover:text-indigo-500 opacity-0 group-hover:opacity-100'}`}
             >
                <Pin size={18} className={rec.isPinned ? "fill-current" : ""} />
             </button>
             <button 
                  onClick={(e) => { e.stopPropagation(); setSelectedRecording(rec); setShowShare(true); }} 
                  className="text-slate-300 hover:text-indigo-500 p-2 transition-colors active:scale-90"
              >
                  <Share2 size={18} />
              </button>
          </div>
        )}
    </div>
  );

  const GridItem: React.FC<{ rec: Recording }> = ({ rec }) => (
    <div 
        onClick={() => openDetail(rec)}
        className={`rounded-[2rem] shadow-sm border overflow-hidden active:scale-[0.97] transition-all group flex flex-col ${
           isSelectMode && selectedIds.has(rec.id) 
           ? 'bg-indigo-50 border-indigo-200' 
           : rec.isPinned 
              ? 'bg-indigo-50/30 border-indigo-100/50'
              : 'bg-white border-slate-100'
        }`}
    >
        <div className="aspect-square bg-slate-50 relative group">
            {rec.thumbnailUrl ? (
                <img src={rec.thumbnailUrl} className="w-full h-full object-cover" />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-indigo-200">
                    <Music size={32} />
                </div>
            )}
            
            {isSelectMode && (
              <div className="absolute top-3 right-3 z-10">
                <CheckSquare className="text-indigo-600 fill-white" size={24} />
              </div>
            )}

            {!isSelectMode && (
              <>
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <button 
                    onClick={(e) => handlePlay(rec.id, e)}
                    className={`absolute right-3 bottom-3 w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${activeRecording === rec.id && isPlaying ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white/90 text-indigo-600 backdrop-blur-md opacity-0 group-hover:opacity-100 active:scale-90'}`}
                >
                    {activeRecording === rec.id && isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); togglePinRecording(rec.id); }}
                    className={`absolute right-3 top-3 w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                        rec.isPinned ? 'bg-indigo-600 text-white shadow-md' : 'bg-white/90 text-slate-400 opacity-0 group-hover:opacity-100'
                    }`}
                >
                    <Pin size={14} className={rec.isPinned ? "fill-white" : ""} />
                </button>
              </>
            )}

            <div className="absolute top-3 left-3 px-2 py-1 rounded-lg bg-black/30 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-wider">
                {formatDuration(rec.durationSec)}
            </div>
        </div>
        
        <div className="p-4">
            <h3 className={`text-xs font-bold truncate mb-1 flex items-center gap-1 ${rec.isPinned ? 'text-indigo-900' : 'text-slate-700'}`}>
                {rec.filename}
            </h3>
            <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase tracking-tight">
                <span>{formatDate(rec.timestamp).split(',')[0]}</span>
                <span>{formatSize(rec.sizeBytes)}</span>
            </div>
        </div>
    </div>
  );

  if (viewMode === 'detail' && selectedRecording) {
    const isThisActive = activeRecording === selectedRecording.id;
    const progressPercent = isThisActive ? playbackProgress : 0;
    
    return (
        <div className="bg-white min-h-screen pb-32 relative animate-in slide-in-from-right duration-300 flex flex-col z-[40]">
            <div className="p-6 flex-1 overflow-y-auto no-scrollbar">
                 <button onClick={() => setViewMode('list')} className="mb-6 flex items-center text-[10px] font-bold text-slate-400 hover:text-slate-800 transition-colors uppercase tracking-widest">
                    <ChevronLeft className="mr-1" size={16} /> {t('rec.back_to_list', language)}
                 </button>
                 
                 <div className="flex flex-col items-center mt-6 mb-10">
                     <div className="w-60 h-60 bg-gradient-to-tr from-slate-50 to-white border border-slate-100 rounded-[3.5rem] shadow-2xl flex items-center justify-center mb-10 relative overflow-hidden group">
                        {selectedRecording.thumbnailUrl ? (
                            <img src={selectedRecording.thumbnailUrl} className="w-full h-full object-cover" />
                        ) : (
                            <Music size={80} className="text-indigo-400" />
                        )}
                     </div>
                     
                     <div className="flex items-center justify-center gap-3 group/title px-6 mb-4">
                        <h2 className="text-2xl font-black text-center text-slate-900 leading-tight tracking-tight">
                            {selectedRecording.filename}
                        </h2>
                        <button 
                            onClick={() => {
                                setTempName(selectedRecording.filename);
                                setIsRenameModalOpen(true);
                            }}
                            className="p-2 text-indigo-400 hover:text-indigo-600 active:scale-90 transition-all"
                        >
                            <PencilLine size={20} />
                        </button>
                     </div>

                     <div className="flex flex-wrap justify-center gap-2">
                        <p className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-4 py-1.5 rounded-full uppercase tracking-[0.1em] border border-indigo-100/50">{selectedRecording.source}</p>
                        <p className="text-[10px] font-black text-slate-400 bg-slate-50 px-4 py-1.5 rounded-full uppercase tracking-[0.1em] border border-slate-100 flex items-center gap-2">
                            <ShieldCheck size={12} className="text-slate-300" />
                            {selectedRecording.version || '1.0.0'}
                        </p>
                     </div>
                 </div>

                 <div className="bg-slate-50/50 rounded-[3rem] p-8 mb-10 border border-slate-100">
                    <div className="relative h-12 mb-2 flex items-center">
                        <input 
                            type="range"
                            min="0"
                            max="100"
                            value={progressPercent}
                            onChange={(e) => isThisActive && setPlaybackProgress(parseInt(e.target.value))}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="h-2.5 w-full bg-slate-200 rounded-full relative overflow-hidden shadow-inner">
                            <div 
                                className="h-full bg-indigo-600 rounded-r-full transition-all duration-300" 
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                        <div 
                           className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white border-2 border-indigo-600 rounded-full shadow-[0_4px_12px_rgba(79,70,229,0.3)] transition-all pointer-events-none z-0"
                           style={{ 
                             left: `${progressPercent}%`,
                             transform: 'translate(-50%, -50%)' 
                           }}
                        />
                    </div>
                    
                    <div className="flex justify-between mb-8 px-1">
                        <span className="text-[10px] font-black text-indigo-600 tabular-nums">
                            {isThisActive ? formatDuration(Math.floor(selectedRecording.durationSec * (playbackProgress/100))) : '0:00'}
                        </span>
                        <span className="text-[10px] font-black text-slate-400 tabular-nums">
                            {formatDuration(selectedRecording.durationSec)}
                        </span>
                    </div>

                    <div className="flex items-center justify-between">
                        <button 
                           onClick={() => {}}
                           className={`w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-90 ${selectedRecording.isFavorite ? 'text-indigo-600 bg-indigo-50 border border-indigo-100/50' : 'text-slate-400 hover:bg-white border border-transparent'}`}
                        >
                            <Heart size={24} className={selectedRecording.isFavorite ? 'fill-indigo-600' : ''} />
                        </button>

                        <div className="flex items-center gap-6">
                            <button className="text-slate-300 hover:text-indigo-600 active:scale-90 transition-all">
                                <Rewind size={26} fill="currentColor" />
                            </button>
                            
                            <button 
                                onClick={() => handlePlay(selectedRecording.id)}
                                className="w-20 h-20 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-2xl shadow-indigo-200/50 hover:scale-105 active:scale-95 transition-all"
                            >
                                {isThisActive && isPlaying ? <Pause size={36} fill="white" /> : <Play size={36} className="ml-1" fill="white" />}
                            </button>

                            <button className="text-slate-300 hover:text-indigo-600 active:scale-90 transition-all">
                                <FastForward size={26} fill="currentColor" />
                            </button>
                        </div>

                        <button 
                           onClick={() => setShowShare(true)}
                           className="w-14 h-14 rounded-full flex items-center justify-center text-slate-400 hover:bg-white border border-transparent transition-all active:scale-90"
                        >
                            <Share2 size={24} />
                        </button>
                    </div>

                    <div className="flex justify-center mt-6">
                        <button 
                            onClick={togglePlaybackSpeed}
                            className="bg-white px-5 py-2 rounded-2xl text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2 border border-slate-100 shadow-sm active:scale-95 transition-all"
                        >
                            <Zap size={14} className="fill-indigo-600" />
                            {playbackSpeed}x {t('rec.speed', language)}
                        </button>
                    </div>
                 </div>

                 <div className="px-4 space-y-6 mb-12">
                    <div className="bg-slate-50/50 p-8 rounded-[3rem] space-y-6 border border-slate-100 shadow-inner">
                        <div className="flex items-center gap-3 pb-3 border-b border-slate-200/50">
                            <Info size={16} className="text-slate-400" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('rec.file_details', language)}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-y-8">
                            <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">{t('rec.metadata.timestamp', language)}</p>
                                <p className="text-[11px] font-bold text-slate-700">{formatDate(selectedRecording.timestamp)}</p>
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">{t('rec.metadata.storage', language)}</p>
                                <p className="text-[11px] font-bold text-slate-700">{formatSize(selectedRecording.sizeBytes)}</p>
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">{t('rec.metadata.length', language)}</p>
                                <p className="text-[11px] font-bold text-slate-700">{formatDuration(selectedRecording.durationSec)}</p>
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">{t('rec.metadata.device', language)}</p>
                                <p className="text-[11px] font-bold text-slate-700">{selectedRecording.source}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center gap-4 pt-4">
                        <button 
                            onClick={() => togglePinRecording(selectedRecording.id)}
                            className={`flex items-center gap-2 text-[10px] font-black transition-colors uppercase tracking-[0.2em] px-4 py-2 rounded-full border ${selectedRecording.isPinned ? 'text-indigo-600 bg-indigo-50 border-indigo-100' : 'text-slate-400 border-slate-200'}`}
                        >
                            {selectedRecording.isPinned ? <PinOff size={14} /> : <Pin size={14} />}
                            {selectedRecording.isPinned ? t('rec.unpin', language) : t('rec.pin', language)}
                        </button>
                        <button 
                            onClick={() => handleDelete(selectedRecording.id)}
                            className="flex items-center gap-2 text-[10px] font-black text-slate-300 hover:text-red-400 transition-colors uppercase tracking-[0.2em] px-4 py-2"
                        >
                            <Trash2 size={14} />
                            {t('btn.delete', language)}
                        </button>
                    </div>
                 </div>
            </div>
            {showShare && <ShareModal />}
            {isRenameModalOpen && <RenameModal />}
        </div>
    );
  }

  return (
    <div className="pb-32 min-h-screen bg-slate-50/50">
      <div className="bg-white sticky top-0 z-[60] px-6 pt-5 pb-3 border-b border-slate-100 shadow-sm flex flex-col gap-4 transition-all">
        {/* Header Row */}
        <div className="flex items-center justify-between">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">{t('rec.list', language)}</h1>

            <div className="flex items-center gap-1.5 relative" ref={sortMenuRef}>
                 <button 
                    onClick={() => setIsSearchOpen(!isSearchOpen)}
                    className={`p-2 rounded-xl transition-all ${isSearchOpen ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:bg-slate-50'}`}
                 >
                    <Search size={18}/>
                </button>
                
                 <button 
                    onClick={() => setIsSortMenuOpen(!isSortMenuOpen)}
                    className={`p-2 rounded-xl transition-all ${isSortMenuOpen ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:bg-slate-50'}`}
                 >
                    <ArrowUpDown size={18}/>
                </button>

                {isSortMenuOpen && (
                  <div className="absolute top-12 right-0 w-44 bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-[70] p-2">
                    {[
                      { key: 'date', label: t('rec.sort.date', language) },
                      { key: 'size', label: t('rec.sort.size', language) },
                      { key: 'duration', label: t('rec.sort.duration', language) },
                    ].map(opt => (
                      <button
                        key={opt.key}
                        onClick={() => {
                          setSortBy(opt.key as SortOption);
                          setIsSortMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-[1.25rem] transition-all ${
                          sortBy === opt.key ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span className="text-[10px] font-black uppercase tracking-widest">{opt.label}</span>
                        {sortBy === opt.key && <Check size={14} />}
                      </button>
                    ))}
                  </div>
                )}
                 
                 {/* Create Folder Button (Only visible in root and not search mode) */}
                 {!currentFolderId && !searchQuery && (
                   <button 
                      onClick={() => setIsCreateFolderOpen(true)}
                      className="p-2 rounded-xl text-slate-400 hover:bg-amber-50 hover:text-amber-500 transition-all"
                   >
                      <FolderPlus size={18} />
                   </button>
                 )}

                 <button 
                    onClick={() => {
                      setIsSelectMode(!isSelectMode);
                      setSelectedIds(new Set());
                    }}
                    className={`p-2 rounded-xl transition-all ${isSelectMode ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:bg-slate-50'}`}
                 >
                    <Settings2 size={18}/>
                </button>
                 <div className="flex bg-slate-50 p-1 rounded-xl ml-1">
                    <button 
                        onClick={() => setLayout('list')}
                        className={`p-1.5 rounded-lg transition-all ${layout === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}
                    >
                        <LayoutList size={16}/>
                    </button>
                    <button 
                        onClick={() => setLayout('grid')}
                        className={`p-1.5 rounded-lg transition-all ${layout === 'grid' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}
                    >
                        <LayoutGrid size={16}/>
                    </button>
                 </div>
            </div>
        </div>

        {isSearchOpen && (
            <div className="animate-in slide-in-from-top duration-200">
                <input 
                    autoFocus
                    type="text" 
                    placeholder={t('rec.search', language)}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all text-sm font-bold text-slate-800 shadow-inner"
                />
            </div>
        )}

        {/* Path Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <button 
                onClick={() => setCurrentFolderId(null)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all border flex-shrink-0 ${
                    !currentFolderId 
                    ? 'bg-slate-800 text-white font-bold border-slate-800 shadow-lg shadow-slate-200' 
                    : 'bg-white text-slate-500 font-bold border-slate-200 hover:bg-slate-50'
                }`}
            >
               <HardDrive size={14} />
               <span className="text-[10px] uppercase tracking-wider">{t('folder.root', language)}</span>
            </button>

            {currentFolder && (
                <>
                    <ChevronRight size={14} className="text-slate-300 flex-shrink-0" />
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500 text-white font-bold border border-amber-500 shadow-lg shadow-amber-100 flex-shrink-0 animate-in fade-in slide-in-from-left-2 duration-300">
                        <FolderOpen size={14} />
                        <span className="text-[10px] uppercase tracking-wider max-w-[150px] truncate">{currentFolder.name}</span>
                    </div>
                </>
            )}
        </div>
      </div>

      <div className={`p-5 pb-32 ${layout === 'grid' ? 'grid grid-cols-2 gap-4' : 'space-y-3'}`}>
        {/* Render Folders first (only if not searching, or allow search for folders later) */}
        {filteredItems.displayedFolders.map(folder => (
            <FolderItem key={folder.id} folder={folder} />
        ))}

        {/* Render Recordings */}
        {filteredItems.recordings.map(rec => (
            layout === 'list' ? <ListItem key={rec.id} rec={rec} /> : <GridItem key={rec.id} rec={rec} />
        ))}

        {filteredItems.recordings.length === 0 && filteredItems.displayedFolders.length === 0 && (
            <div className="text-center py-24 text-slate-300 col-span-2">
                <Music size={56} className="mx-auto mb-4 opacity-10" />
                <p className="text-[10px] font-black tracking-widest uppercase">{t('device.no_files', language)}</p>
            </div>
        )}
      </div>

      {isSelectMode && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[92%] max-w-sm bg-white border border-slate-100 shadow-2xl rounded-[2.5rem] p-5 flex items-center justify-between z-[1000] animate-in slide-in-from-bottom duration-500">
          <div className="flex items-center gap-2 px-2">
            <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full uppercase tracking-widest">
              {selectedIds.size}
            </span>
          </div>
          <div className="flex gap-3">
             <button 
              onClick={() => setIsMoveModalOpen(true)}
              disabled={selectedIds.size === 0}
              className="px-4 py-2 text-[10px] font-black text-amber-600 bg-amber-50 rounded-2xl uppercase tracking-widest active:scale-95 transition-transform disabled:opacity-50 flex items-center gap-1.5"
            >
              <MoveRight size={14} />
              {t('btn.move', language)}
            </button>
            <button 
              onClick={handleBatchDelete}
              disabled={selectedIds.size === 0}
              className="bg-red-500 text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest disabled:opacity-50 shadow-xl shadow-red-100 active:scale-95 transition-transform"
            >
              {t('btn.delete', language)}
            </button>
          </div>
        </div>
      )}

      {showShare && <ShareModal />}
      {isCreateFolderOpen && <CreateFolderModal />}
      {isMoveModalOpen && <MoveToFolderModal />}
    </div>
  );
};
