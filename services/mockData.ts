
import { Recording, Folder } from '../types';

export const MOCK_FOLDERS: Folder[] = [
  {
    id: 'f1',
    name: 'Work Meetings',
    timestamp: 1698300000000
  },
  {
    id: 'f2',
    name: 'Inspiration',
    timestamp: 1698400000000
  }
];

export const MOCK_LOCAL_RECORDINGS: Recording[] = [
  {
    id: '1',
    filename: 'Meeting_2023_10_27.wav',
    durationSec: 345,
    timestamp: 1698400000000,
    sizeBytes: 4500000,
    source: 'SmartSpeaker X1',
    isFavorite: true,
    isPinned: true,
    tags: ['Work', 'Meeting'],
    thumbnailUrl: 'https://picsum.photos/seed/rec1/200/200',
    version: '1.0.2',
    folderId: 'f1'
  },
  {
    id: '2',
    filename: 'Idea_Sketch.wav',
    durationSec: 42,
    timestamp: 1698480000000,
    sizeBytes: 500000,
    source: 'SmartSpeaker X1',
    isFavorite: false,
    isPinned: false,
    tags: ['Creative'],
    thumbnailUrl: 'https://picsum.photos/seed/rec2/200/200',
    version: '1.0.0',
    folderId: 'f2'
  },
  {
    id: '3',
    filename: 'Nature_Ambience.wav',
    durationSec: 1200,
    timestamp: 1698500000000,
    sizeBytes: 15000000,
    source: 'SmartSpeaker X1',
    isFavorite: false,
    isPinned: false,
    tags: ['Travel'],
    thumbnailUrl: 'https://picsum.photos/seed/rec3/200/200',
    version: '2.1.0'
  },
];

export const MOCK_DEVICE_FILES: Recording[] = [
  {
    id: '1',
    filename: 'Meeting_2023_10_27.wav',
    durationSec: 345,
    timestamp: 1698400000000,
    sizeBytes: 4500000,
    source: 'SmartSpeaker X1',
    isFavorite: false,
    tags: [],
    version: '1.0.2'
  },
  {
    id: '2',
    filename: 'Idea_Sketch.wav',
    durationSec: 42,
    timestamp: 1698480000000,
    sizeBytes: 500000,
    source: 'SmartSpeaker X1',
    isFavorite: false,
    tags: [],
    version: '1.0.0'
  },
  {
    id: '3',
    filename: 'Nature_Sounds.wav',
    durationSec: 1200,
    timestamp: 1698500000000,
    sizeBytes: 15000000,
    source: 'SmartSpeaker X1',
    isFavorite: false,
    tags: [],
    version: '2.1.0'
  },
  {
    id: '4',
    filename: 'Conference_Call.wav',
    durationSec: 1800,
    timestamp: 1698600000000,
    sizeBytes: 22000000,
    source: 'SmartSpeaker X1',
    isFavorite: false,
    tags: [],
    version: '1.0.0'
  },
];
