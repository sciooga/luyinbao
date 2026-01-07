
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { ConnectionStatus, Recording, ConnectionRecord } from '../types';
import { MOCK_LOCAL_RECORDINGS, MOCK_DEVICE_FILES } from '../services/mockData';

interface DeviceContextType {
  status: ConnectionStatus;
  deviceName: string | null;
  batteryLevel: number;
  scanForDevices: () => Promise<void>;
  disconnect: () => void;
  localRecordings: Recording[];
  deviceFiles: Recording[];
  connectionHistory: ConnectionRecord[];
  syncFile: (file: Recording) => Promise<void>;
  syncAll: () => Promise<void>;
  isRecording: boolean;
  recordingSeconds: number;
  toggleRecording: () => void;
  deleteLocalRecording: (id: string) => void;
  renameLocalRecording: (id: string, newName: string) => void;
  deleteDeviceFile: (id: string) => void;
  checkIsSynced: (fileId: string) => boolean;
}

const DeviceContext = createContext<DeviceContextType | undefined>(undefined);

export const DeviceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<ConnectionStatus>(ConnectionStatus.DISCONNECTED);
  const [deviceName, setDeviceName] = useState<string | null>(null);
  const [batteryLevel, setBatteryLevel] = useState(85);
  
  const [localRecordings, setLocalRecordings] = useState<Recording[]>(MOCK_LOCAL_RECORDINGS);
  const [deviceFiles, setDeviceFiles] = useState<Recording[]>([]); 
  const [connectionHistory, setConnectionHistory] = useState<ConnectionRecord[]>([
    { id: 'h1', deviceName: 'SmartSound X1', timestamp: Date.now() - 86400000 * 2, durationMinutes: 45 },
    { id: 'h2', deviceName: 'SmartSound X1', timestamp: Date.now() - 86400000 * 5, durationMinutes: 120 },
  ]);
  
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const timerRef = useRef<number | null>(null);

  const scanForDevices = async () => {
    setStatus(ConnectionStatus.SCANNING);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setStatus(ConnectionStatus.CONNECTING);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const name = 'SmartSound X1';
    setStatus(ConnectionStatus.CONNECTED);
    setDeviceName(name);
    setDeviceFiles(MOCK_DEVICE_FILES);

    setConnectionHistory(prev => [
      { id: Date.now().toString(), deviceName: name, timestamp: Date.now() },
      ...prev
    ]);
  };

  const disconnect = () => {
    if (isRecording) stopTimer();
    setStatus(ConnectionStatus.DISCONNECTED);
    setDeviceName(null);
    setDeviceFiles([]);
    setIsRecording(false);
    setRecordingSeconds(0);
  };

  const startTimer = () => {
    setRecordingSeconds(0);
    timerRef.current = window.setInterval(() => {
      setRecordingSeconds(prev => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const toggleRecording = () => {
    const nextState = !isRecording;
    setIsRecording(nextState);
    
    if (nextState) {
      startTimer();
    } else {
      stopTimer();
      // On stop, add the recording to the device files
      if (status === ConnectionStatus.CONNECTED) {
        const finalDuration = recordingSeconds;
        const newFile: Recording = {
          id: Date.now().toString(),
          filename: `REC_${new Date().toISOString().slice(0,19).replace(/[:T]/g, '_')}.wav`,
          durationSec: finalDuration > 0 ? finalDuration : 1,
          timestamp: Date.now(),
          sizeBytes: Math.floor(Math.random() * 1000000) + 500000,
          source: deviceName || 'Unknown Device',
          isFavorite: false,
          tags: [],
          version: '1.0.0'
        };
        setDeviceFiles(prev => [newFile, ...prev]);
        setRecordingSeconds(0);
      }
    }
  };

  const checkIsSynced = (fileId: string) => {
    return localRecordings.some(r => r.id === fileId);
  };

  const syncFile = async (file: Recording) => {
    if (checkIsSynced(file.id)) return;
    await new Promise(resolve => setTimeout(resolve, 800));
    setLocalRecordings(prev => [file, ...prev]);
  };

  const syncAll = async () => {
    const unsynced = deviceFiles.filter(f => !checkIsSynced(f.id));
    for (const file of unsynced) {
        await syncFile(file);
    }
  };

  const deleteLocalRecording = (id: string) => {
    setLocalRecordings(prev => prev.filter(r => r.id !== id));
  };

  const renameLocalRecording = (id: string, newName: string) => {
    setLocalRecordings(prev => prev.map(r => r.id === id ? { ...r, filename: newName } : r));
  };

  const deleteDeviceFile = (id: string) => {
    setDeviceFiles(prev => prev.filter(r => r.id !== id));
  };

  useEffect(() => {
    if (status === ConnectionStatus.CONNECTED) {
      const interval = setInterval(() => {
        setBatteryLevel(prev => Math.max(0, prev - 1));
      }, 60000);
      return () => clearInterval(interval);
    }
  }, [status]);

  return (
    <DeviceContext.Provider value={{
      status,
      deviceName,
      batteryLevel,
      scanForDevices,
      disconnect,
      localRecordings,
      deviceFiles,
      connectionHistory,
      syncFile,
      syncAll,
      isRecording,
      recordingSeconds,
      toggleRecording,
      deleteLocalRecording,
      renameLocalRecording,
      deleteDeviceFile,
      checkIsSynced
    }}>
      {children}
    </DeviceContext.Provider>
  );
};

export const useDevice = () => {
  const context = useContext(DeviceContext);
  if (!context) throw new Error('useDevice must be used within a DeviceProvider');
  return context;
};
