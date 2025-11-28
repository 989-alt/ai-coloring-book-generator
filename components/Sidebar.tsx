import React from 'react';
import { Settings, Key, Palette, Hash, Sliders, Search, Brush } from 'lucide-react';
import { Button } from './Button';
import { 
  MIN_IMAGE_COUNT, MAX_IMAGE_COUNT, 
  MIN_DIFFICULTY, MAX_DIFFICULTY, 
  AppMode,
  MIN_HIDDEN_ITEMS, MAX_HIDDEN_ITEMS
} from '../constants';

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
  
  const getDifficultyLabel = (level: number) => {
    if (level <= 2) return "1-2단계 (유아용)";
    if (level <= 5) return "3-5단계 (초등용)";
    return "6-10단계 (청소년/성인)";
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
                value={difficulty}
                onChange={(e) => setDifficulty(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <p className="text-xs text-slate-500">
                {difficulty <= 2 ? "배경 없음, 아주 단순함" : difficulty <= 5 ? "적당한 배경과 캐릭터" : "복잡한 패턴과 배경"}
              </p>
            </div>
          ) : (
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
                 ? "팁: 1단계는 유아용으로 아주 단순하며, 10단계는 어른용으로 매우 복잡합니다." 
                 : "팁: 숨은 그림은 AI가 랜덤으로 선택한 물건을 배경 속에 자연스럽게 숨깁니다."}
             </p>
          </div>
        </div>
      </div>
    </aside>
  );
};