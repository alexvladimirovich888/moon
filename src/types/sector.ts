export type SectorStatus = 'available' | 'reserved' | 'acquired';

export interface LunarSector {
  id: string; // e.g. "SEC-001"
  code: string; // "001"
  name: string; // e.g. "Mare Tranquillitatis Central"
  landmark: string; // "Sea of Tranquility"
  latitude: number; // degrees -90 to +90
  longitude: number; // degrees -180 to +180
  status: SectorStatus;
  priceSol: number;
  areaKm2: number; // square kilometers
  regionType: 'Mare' | 'Crater' | 'Highland' | 'Oceanus' | 'Sinus' | 'Lacus';
  historicalNote?: string;
  acquiredDate?: string;
  solAllocated?: number;
  registryReference?: string;
}

export interface ProjectStats {
  tokenCa: string;
  pumpfunUrl: string;
  moonRegisterUrl: string;
  xUrl: string;
  totalLandAcquiredKm2: number;
  totalSectorsAcquired: number;
  totalSolAllocated: number;
}
