export type AssetCategory =
  | 'COMPUTER'
  | 'PROJECTOR'
  | 'SMART_BOARD'
  | 'LAB_EQUIPMENT'
  | 'PRINTER'
  | 'NETWORK_SWITCH'
  | 'HVAC_UNIT'
  | 'SAFETY_EQUIPMENT';

export type AssetStatus = 
  | 'OPERATIONAL'
  | 'DEGRADED'
  | 'MAINTENANCE'
  | 'DECOMMISSIONED';

export interface Asset {
  id: string;
  roomId: string;
  assetTag: string;
  name: string;
  category: AssetCategory;
  modelNumber?: string;
  serialNumber?: string;
  status: AssetStatus;
  specifications: Record<string, unknown>;
  lastServicedAt?: string;
  warrantyExpiry?: string;
}
