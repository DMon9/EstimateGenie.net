
export interface CostItem {
  description: string;
  estimatedCost: number;
  category: string;
}

export interface ProjectPhase {
  phaseName: string;
  duration: string;
  estimatedCost: number;
  description: string;
  tasks: string[];
}

export interface QuoteData {
  projectName: string;
  summary: string;
  totalEstimatedCostMin: number;
  totalEstimatedCostMax: number;
  currency: string;
  breakdown: CostItem[];
  timeline: ProjectPhase[];
  materials: string[];
  designStyleSuggestions: string[];
}

export type ImageSize = '1K' | '2K' | '4K';

export interface FileData {
  file: File;
  previewUrl: string;
  base64: string;
  mimeType: string;
}

export interface ManualInputItem {
  id: string;
  name: string;
  quantity: string;
}

export interface ProjectInputs {
  prompt: string;
  style: string;
  laborHours?: string;
  manualMaterials: ManualInputItem[];
}

export type SubscriptionTier = 'free' | 'pro' | 'business';

export interface User {
  name: string;
  email: string;
  tier: SubscriptionTier;
  avatar?: string;
  joinedDate: string;
  pdfDownloads: number;
}