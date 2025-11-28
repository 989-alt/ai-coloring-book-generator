import React from 'react';
import { Settings, Key, Palette, Hash, Sliders, Search, Brush } from 'lucide-react';
import { Button } from './Button';
import { 
  MIN_IMAGE_COUNT, MAX_IMAGE_COUNT, 
  MIN_DIFFICULTY, MAX_DIFFICULTY, 
  AppMode,
  MIN_HIDDEN_ITEMS, MAX_HIDDEN_ITEMS
} from '../constants';

// ... (Interface 부분은 동일) ...
interface SidebarProps {
  apiKey: string; setApiKey: (key: string) => void;
  theme: string; setTheme: (theme: string) => void;
  count: number; setCount: (count: number) => void;
  difficulty: number; setDifficulty: (level: number) => void;
  appMode: AppMode; setAppMode: (mode: AppMode) => void;
  hiddenCount: number; setHiddenCount: (n: number) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  progressStatus?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  apiKey, setApiKey,
  theme, setTheme,
  count, setCount,
  difficulty, setDifficulty,
  appMode, setAppMode,
  hiddenCount, setHiddenCount,
  onGenerate, isGenerating, progressStatus
}) => {
  
  // [변경] 5단계에 맞춘 라벨 설명
  const getDifficultyLabel = (level: number) => {
    switch (level) {
      case 1: return "1단계 (유아 - 단순)";
      case 2: return "2단계 (유치원 - 쉬움)";
      case 3: return "3단계 (초등 - 보통)";
      case 4: return "4단계 (고학년 - 디테일)";
      case 5: return "5단계 (전문가 - 복잡)";
      default: return `${level}단계`;
    }
  };

  const getDifficultyDescription = (level: number) => {
    if (level === 1) return "배경 없이 아주 크고 단순한 그림";
    if (level === 2) return "간단한 배경과 굵은 선";
    if (level === 3) return "적당한 배경과 이야기";
    if (level === 4) return "세밀한 묘사와 풍부한 배경";
    return "매우 복잡한 패턴과 젠탱글 스타일";
  };

  return (
    <aside className="w-full lg:w-80 bg-white border-b lg:border-b-0 lg:border-r border-slate-200 flex-shrink-0 lg:h-screen lg:sticky lg:top-0 overflow-y-auto z-10">
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <span className="bg-indigo-600 text-white p-1 rounded-md">AI</span>
            키즈 아트 생성기
          </h1>
          <p className="text-slate-500 text-sm mt-1">나만의 색칠공부 & 숨은그림찾기</p>
        </div>

        {/* ... (모드 스위처 및 API 키, 주제 입력 부분은 동일) ... */}
        
        {/* Mode Switcher */}
        <div className="flex p-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => setAppMode(AppMode.COLORING)}
            className={`flex-1 flex items-center justify-center py-2 text-sm font-medium rounded-md transition-all ${
              appMode === AppMode.COLORING ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Brush className="w-4 h-4 mr-2" />
            색칠공부
          </button>
          <button
            onClick={() => setAppMode(AppMode.HIDDEN_OBJECTS)}
            className={`flex-1 flex items-center justify-center py-2 text-sm font-medium rounded-md transition-all ${
              appMode === AppMode.HIDDEN_OBJECTS ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Search className="w-4 h-4 mr-2" />
            숨은그림
          </button>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="flex items-center text-sm font-semibold text-slate-700">
              <Key className="w-4 h-4 mr-2" />
              구글 API 키
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="API 키 입력"
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center text-sm font-semibold text-slate-700">
              <Palette className="w-4 h-4 mr-2" />
              주제 입력
            </label>
            <input
              type="text"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder={appMode === AppMode.COLORING ? "예: 우주를 여행하는 고양이" : "예: 보물이 숨겨진 해적섬"}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Conditional Controls based on Mode */}
          {appMode === AppMode.COLORING ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="flex items-center text-sm font-semibold text-slate-700">
                  <Sliders className="w-4 h-4 mr-2" />
                  난이도: {difficulty}
                </label>
                <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                  {getDifficultyLabel(difficulty)}
                </span>
              </div>
              <input
                type="range"
                min={MIN_DIFFICULTY} max={MAX_DIFFICULTY}
                step={1} // 명시적으로 1단위 설정
                value={difficulty}
                onChange={(e) => setDifficulty(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <p className="text-xs text-slate-500">
                {getDifficultyDescription(difficulty)}
              </p>
            </div>
          ) : (
             // ... (숨은 그림 찾기 컨트롤은 기존 유지) ...
            <div className="space-y-3">
              <label className="flex items-center text-sm font-semibold text-slate-700">
                <Search className="w-4 h-4 mr-2" />
                숨길 물건 개수: {hiddenCount}개
              </label>
              <input
                type="number"
                min={MIN_HIDDEN_ITEMS} max={MAX_HIDDEN_ITEMS}
                value={hiddenCount}
                onChange={(e) => setHiddenCount(Math.min(MAX_HIDDEN_ITEMS, Math.max(MIN_HIDDEN_ITEMS, parseInt(e.target.value) || 5)))}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-xs text-slate-500">
                * AI가 {hiddenCount}개의 서로 다른 물건을 숨깁니다.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <label className="flex items-center text-sm font-semibold text-slate-700">
              <Hash className="w-4 h-4 mr-2" />
              생성할 장수 (최대 {MAX_IMAGE_COUNT}장)
            </label>
            <input
              type="number"
              min={MIN_IMAGE_COUNT} max={MAX_IMAGE_COUNT}
              value={count}
              onChange={(e) => setCount(Math.min(MAX_IMAGE_COUNT, Math.max(MIN_IMAGE_COUNT, parseInt(e.target.value) || MIN_IMAGE_COUNT)))}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <Button 
            onClick={onGenerate} 
            isLoading={isGenerating} 
            disabled={!apiKey || !theme}
            className="w-full h-12 text-lg flex-col leading-tight"
          >
            {isGenerating ? (
              <span className="text-sm">{progressStatus || '생성 중...'}</span>
            ) : (
              appMode === AppMode.COLORING ? '색칠공부 생성하기' : '숨은그림찾기 생성'
            )}
          </Button>
        </div>

        <div className="pt-4 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-start gap-2 bg-slate-50 p-3 rounded-lg">
             <Settings className="w-4 h-4 flex-shrink-0 mt-0.5" />
             <p>
               {appMode === AppMode.COLORING 
                 ? "팁: 1단계는 선이 굵고 단순하며, 5단계는 매우 섬세하고 복잡한 그림이 나옵니다." 
                 : "팁: 숨은 그림은 AI가 랜덤으로 선택한 물건을 배경 속에 자연스럽게 숨깁니다."}
             </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
