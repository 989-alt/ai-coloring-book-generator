
export interface ColoringPage {
  id: string;
  url: string | null;
  isLoading: boolean;
  error: string | null;
  isSelected: boolean;
}

export interface AppState {
  apiKey: string;
  theme: string;
  count: number;
  difficulty: number;
}
