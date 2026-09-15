export interface HookahData {
  id: string;
  name: string;
  category: string;
  description: string;
  accent: string;
  accentRGB: [number, number, number];
  modelConfig: {
    baseColor: string;
    stemColor: string;
    bowlColor: string;
    metalColor: string;
    glassOpacity: number;
    baseShape: 'round' | 'tall' | 'wide' | 'angular' | 'classic';
    stemHeight: number;
    stemStyle: 'straight' | 'ornate' | 'twisted' | 'slim' | 'thick';
    baseScale: [number, number, number];
  };
}

export const hookahs: HookahData[] = [
  {
    id: 'aurora',
    name: 'Aurora',
    category: 'PREMIUM',
    description: 'Northern lights inspired with iridescent glass and chrome finish.',
    accent: '#7B68EE',
    accentRGB: [0.482, 0.408, 0.933],
    modelConfig: {
      baseColor: '#4a3f8a',
      stemColor: '#c0c0c0',
      bowlColor: '#6b5b95',
      metalColor: '#d4d4d4',
      glassOpacity: 0.35,
      baseShape: 'round',
      stemHeight: 2.8,
      stemStyle: 'ornate',
      baseScale: [1, 1, 1],
    },
  },
  {
    id: 'obsidian',
    name: 'Obsidian',
    category: 'SIGNATURE',
    description: 'Deep black volcanic glass with matte black hardware.',
    accent: '#2c2c2c',
    accentRGB: [0.173, 0.173, 0.173],
    modelConfig: {
      baseColor: '#1a1a1a',
      stemColor: '#333333',
      bowlColor: '#2a2a2a',
      metalColor: '#444444',
      glassOpacity: 0.25,
      baseShape: 'tall',
      stemHeight: 3.2,
      stemStyle: 'straight',
      baseScale: [0.85, 1.15, 0.85],
    },
  },
  {
    id: 'royal-gold',
    name: 'Royal Gold',
    category: 'LUXURY',
    description: 'Opulent gold plating with crystal-clear Bohemian glass.',
    accent: '#d4a574',
    accentRGB: [0.831, 0.647, 0.455],
    modelConfig: {
      baseColor: '#8B7355',
      stemColor: '#d4a574',
      bowlColor: '#c9a96e',
      metalColor: '#FFD700',
      glassOpacity: 0.3,
      baseShape: 'classic',
      stemHeight: 3.0,
      stemStyle: 'ornate',
      baseScale: [1.05, 1, 1.05],
    },
  },
  {
    id: 'violet-mist',
    name: 'Violet Mist',
    category: 'PREMIUM',
    description: 'Ethereal purple haze design with frosted glass accents.',
    accent: '#9b59b6',
    accentRGB: [0.608, 0.349, 0.714],
    modelConfig: {
      baseColor: '#6c3483',
      stemColor: '#8e44ad',
      bowlColor: '#7d3c98',
      metalColor: '#bdc3c7',
      glassOpacity: 0.4,
      baseShape: 'round',
      stemHeight: 2.6,
      stemStyle: 'twisted',
      baseScale: [1.1, 0.9, 1.1],
    },
  },
  {
    id: 'ice-pearl',
    name: 'Ice Pearl',
    category: 'SIGNATURE',
    description: 'Frosted white pearl finish with silver ice-blue undertones.',
    accent: '#a8d8ea',
    accentRGB: [0.659, 0.847, 0.918],
    modelConfig: {
      baseColor: '#b0c4de',
      stemColor: '#e0e0e0',
      bowlColor: '#87ceeb',
      metalColor: '#c0c0c0',
      glassOpacity: 0.45,
      baseShape: 'wide',
      stemHeight: 2.5,
      stemStyle: 'slim',
      baseScale: [1.2, 0.85, 1.2],
    },
  },
  {
    id: 'crimson',
    name: 'Crimson',
    category: 'PREMIUM',
    description: 'Bold crimson red glass with dark bronze hardware.',
    accent: '#c0392b',
    accentRGB: [0.753, 0.224, 0.169],
    modelConfig: {
      baseColor: '#8b0000',
      stemColor: '#8B4513',
      bowlColor: '#a52a2a',
      metalColor: '#cd7f32',
      glassOpacity: 0.35,
      baseShape: 'classic',
      stemHeight: 2.9,
      stemStyle: 'thick',
      baseScale: [1, 1, 1],
    },
  },
  {
    id: 'emerald-luxe',
    name: 'Emerald Luxe',
    category: 'LUXURY',
    description: 'Rich emerald green crystal with antique gold trim.',
    accent: '#2ecc71',
    accentRGB: [0.180, 0.800, 0.443],
    modelConfig: {
      baseColor: '#145a32',
      stemColor: '#d4a574',
      bowlColor: '#1e8449',
      metalColor: '#d4a574',
      glassOpacity: 0.35,
      baseShape: 'tall',
      stemHeight: 3.1,
      stemStyle: 'ornate',
      baseScale: [0.9, 1.1, 0.9],
    },
  },
  {
    id: 'silver-phantom',
    name: 'Silver Phantom',
    category: 'SIGNATURE',
    description: 'Mirror-polished silver with smoky translucent glass.',
    accent: '#95a5a6',
    accentRGB: [0.584, 0.647, 0.651],
    modelConfig: {
      baseColor: '#4a4a4a',
      stemColor: '#c0c0c0',
      bowlColor: '#696969',
      metalColor: '#e0e0e0',
      glassOpacity: 0.3,
      baseShape: 'angular',
      stemHeight: 2.7,
      stemStyle: 'straight',
      baseScale: [0.95, 1.05, 0.95],
    },
  },
  {
    id: 'midnight-crown',
    name: 'Midnight Crown',
    category: 'LUXURY',
    description: 'Royal midnight blue with platinum crown-shaped accents.',
    accent: '#1a237e',
    accentRGB: [0.102, 0.137, 0.494],
    modelConfig: {
      baseColor: '#0d1b2a',
      stemColor: '#e0e0e0',
      bowlColor: '#1b2838',
      metalColor: '#e8e8e8',
      glassOpacity: 0.3,
      baseShape: 'classic',
      stemHeight: 3.3,
      stemStyle: 'ornate',
      baseScale: [1, 1.15, 1],
    },
  },
  {
    id: 'desert-noir',
    name: 'Desert Noir',
    category: 'PREMIUM',
    description: 'Warm desert sand tones with dark smoke glass and copper.',
    accent: '#d2691e',
    accentRGB: [0.824, 0.412, 0.118],
    modelConfig: {
      baseColor: '#8B6914',
      stemColor: '#b87333',
      bowlColor: '#a0522d',
      metalColor: '#b87333',
      glassOpacity: 0.35,
      baseShape: 'wide',
      stemHeight: 2.6,
      stemStyle: 'thick',
      baseScale: [1.15, 0.9, 1.15],
    },
  },
];
