export interface FlavourData {
  id: string;
  name: string;
  color: string;
  colorRGB: [number, number, number];
}

export const flavours: FlavourData[] = [
  { id: 'blueberry-mint', name: 'Blueberry Mint', color: '#6366f1', colorRGB: [0.388, 0.400, 0.945] },
  { id: 'double-apple', name: 'Double Apple', color: '#ef4444', colorRGB: [0.937, 0.267, 0.267] },
  { id: 'watermelon', name: 'Watermelon', color: '#f43f5e', colorRGB: [0.957, 0.247, 0.369] },
  { id: 'grape-ice', name: 'Grape Ice', color: '#a855f7', colorRGB: [0.659, 0.333, 0.969] },
  { id: 'mango', name: 'Mango', color: '#f59e0b', colorRGB: [0.961, 0.620, 0.043] },
  { id: 'peach', name: 'Peach', color: '#fb923c', colorRGB: [0.984, 0.573, 0.235] },
  { id: 'lemon-mint', name: 'Lemon Mint', color: '#84cc16', colorRGB: [0.518, 0.800, 0.086] },
  { id: 'strawberry', name: 'Strawberry', color: '#e11d48', colorRGB: [0.882, 0.114, 0.282] },
  { id: 'lychee', name: 'Lychee', color: '#ec4899', colorRGB: [0.925, 0.282, 0.600] },
  { id: 'cola-mint', name: 'Cola Mint', color: '#78350f', colorRGB: [0.471, 0.208, 0.059] },
  { id: 'passion-fruit', name: 'Passion Fruit', color: '#eab308', colorRGB: [0.918, 0.702, 0.031] },
  { id: 'tropical-mix', name: 'Tropical Mix', color: '#14b8a6', colorRGB: [0.078, 0.722, 0.651] },
];
