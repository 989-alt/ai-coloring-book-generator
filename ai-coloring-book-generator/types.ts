import { AppMode } from './constants';

export interface ColoringPage {
  id: string;
  url: string | null;
  isLoading: boolean;
  error: string | null;
  isSelected: boolean;
  hiddenItems?: string[]; // For hidden object mode
}

export interface AppState {
  apiKey: string;
  theme: string;
  count: number;
  difficulty: number;
  mode: AppMode;
  hiddenCount: number;
}