
export type Category = 'food' | 'medicine' | 'personal-care' | 'household' | 'other';

export interface ExpiryAnalysis {
  productName: string;
  expiryDate: string; 
  foundText: string;
  confidence: 'high' | 'medium' | 'low';
  isExpired: boolean;
  daysRemaining: number | null;
  status: 'expired' | 'expiring-soon' | 'valid' | 'unknown';
  category: Category;
}

export type AppView = 'dashboard' | 'scan' | 'history';
export type ScanMethod = 'camera' | 'upload' | 'manual';

export interface ScanResult extends ExpiryAnalysis {
  id: string;
  timestamp: number;
  imageUrl?: string;
}

export interface DashboardStats {
  total: number;
  expired: number;
  soon: number;
  safe: number;
}
