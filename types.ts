
export enum Language {
  ZH_CN = 'zh-CN', // China (Default)
  EN_US = 'en-US', // USA
  DE_DE = 'de-DE', // Germany
}

export enum ConnectionStatus {
  DISCONNECTED = 'DISCONNECTED',
  SCANNING = 'SCANNING',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  ERROR = 'ERROR',
}

export interface User {
  id: string;
  email: string;
  nickname: string;
  avatarUrl: string;
  language: Language;
}

export interface Folder {
  id: string;
  name: string;
  timestamp: number;
}

export interface Recording {
  id: string;
  filename: string;
  durationSec: number;
  timestamp: number; // Unix timestamp
  sizeBytes: number;
  source: string; // Device Model
  isFavorite: boolean;
  tags: string[];
  thumbnailUrl?: string;
  version?: string;
  folderId?: string; // Optional: if undefined, it's in the root
}

export interface ConnectionRecord {
  id: string;
  deviceName: string;
  timestamp: number;
  durationMinutes?: number;
}