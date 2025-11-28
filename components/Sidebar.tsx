import React from 'react';
import { Settings, Key, Palette, Hash, Sliders, Brush, Circle } from 'lucide-react'; // Circle 아이콘 추가
import { Button } from './Button';
import { 
  MIN_IMAGE_COUNT, MAX_IMAGE_COUNT, 
  MIN_DIFFICULTY, MAX_DIFFICULTY, 
  AppMode
} from '../constants';

interface SidebarProps {
  apiKey: string; setApiKey: (key: string) => void;
  theme: string; setTheme: (theme: string) => void;
  count: number; setCount: (count: number) => void;
  difficulty: number; setDifficulty: (level: number) => void;
  appMode: AppMode; setAppMode: (mode: AppMode) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  progressStatus?: string;
  // hiddenCount 관련 props 삭제됨
}

export const Sidebar: React.FC<SidebarProps> = ({
  apiKey, setApiKey,
  theme, setTheme,
  count, setCount,
  difficulty, setDifficulty,
  appMode, setAppMode,
  onGenerate, isGenerating, progressStatus
}) => {
  
  const getDifficultyLabel = (level: number) => {
    switch (level) {
      case 1: return "1단계 (단순함)";
      case 2: return "2단계 (쉬움)";
      case 3: return "3단계 (보통)";
      case 4: return "4단계 (디테일)";
      case 5: return "5단계 (복잡함)";
      default: return `${level}단계`;
    }
  };

  return (
    <aside className="w-full lg:w-80 bg-white border-b lg:border-b-0 lg:border-r border-slate-200 flex-shrink-0 lg:h-screen lg:sticky lg:top-0 overflow-y-auto z-10">
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <span className="bg-indigo-600 text-white p-1 rounded-md">AI</span>
            도안 생성기
          </h1>
          <p className="text-slate-500 text-sm mt-1">색칠공부 & 만다라 만들기</p>
        </div>

        {/* 모드 선택 버튼 (색칠공부 vs 만다라) */}
        <div className="flex p-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => setAppMode(AppMode.COLORING)}
            className={`flex-1 flex items-center justify-center py-2 text-sm font-medium rounded-md transition-all ${
              appMode === AppMode.COLORING ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Brush className="w-4 h-4 mr-2" />
            일반 도안
          </button>
          <button
            onClick={() => setAppMode(AppMode.MANDALA)}
            className={`flex-1 flex items-center justify-center py-2 text-sm font-medium rounded-md transition-all ${
              appMode === AppMode.MANDALA ? 'bg-white text-pink-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Circle className="w-4 h-4 mr-2" />
            만다라
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
              placeholder={appMode === AppMode.COLORING ? "예: 숲속의 다람쥐" : "예: 꽃, 불꽃, 우주"}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* 난이도 슬라이더 (모든 모드 공통 사용) */}
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
              step={1}
              value={difficulty}
              onChange={(e) => setDifficulty(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <p className="text-xs text-slate-500">
              {appMode === AppMode.MANDALA 
                ? "낮을수록 패턴이 크고 단순하며, 높을수록 아주 세밀해집니다." 
                : "1단계는 유아용, 5단계는 전문가용 수준입니다."}
            </p>
          </div>

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
              appMode === AppMode.COLORING ? '도안 생성하기' : '만다라 생성하기'
            )}
          </Button>
        </div>

        <div className="pt-4 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-start gap-2 bg-slate-50 p-3 rounded-lg">
             <Settings className="w-4 h-4 flex-shrink-0 mt-0.5" />
             <p>팁: 만다라 모드에서 '난이도 5'를 선택하면 명상용 힐링 아트가 생성됩니다.</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
