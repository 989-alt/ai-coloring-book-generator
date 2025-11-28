import React from 'react';
import { Settings, Image as ImageIcon, Sparkles, Palette } from 'lucide-react';
import { Button } from './Button';

interface SidebarProps {
  apiKey: string;
  setApiKey: (key: string) => void;
  theme: string;
  setTheme: (theme: string) => void;
  count: number;
  setCount: (count: number) => void;
  difficulty: number;
  setDifficulty: (diff: number) => void;
  // ⭐ 추가된 Props
  styleMode: 'normal' | 'mandala';
  setStyleMode: (mode: 'normal' | 'mandala') => void;
  
  onGenerate: () => void;
  isGenerating: boolean;
  progressStatus: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  apiKey, setApiKey,
  theme, setTheme,
  count, setCount,
  difficulty, setDifficulty,
  styleMode, setStyleMode, // ⭐ 받기
  onGenerate,
  isGenerating,
  progressStatus
}) => {
  return (
    <aside className="w-full lg:w-80 bg-white border-r border-slate-200 p-6 flex flex-col gap-8 h-auto lg:h-screen overflow-y-auto shrink-0 z-10">
      <div className="flex items-center gap-2 text-indigo-600">
        <Palette className="w-8 h-8" />
        <h1 className="text-2xl font-bold tracking-tight">AI 키즈 아트</h1>
      </div>

      <div className="flex flex-col gap-6">
        {/* API 키 입력 */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Settings className="w-4 h-4" /> 구글 API 키
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="AI Studio 키를 입력하세요"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm"
          />
          <p className="text-xs text-slate-400">* 키는 브라우저에만 저장됩니다.</p>
        </div>

        {/* 주제 입력 */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <ImageIcon className="w-4 h-4" /> 도안 주제
          </label>
          <input
            type="text"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            placeholder="예: 우주를 여행하는 고양이"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            onKeyDown={(e) => e.key === 'Enter' && onGenerate()}
          />
        </div>

        {/* ⭐ 스타일 모드 선택 (신규 기능) */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> 그림 스타일
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setStyleMode('normal')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all border ${
                styleMode === 'normal'
                  ? 'bg-indigo-50 border-indigo-500 text-indigo-700 ring-1 ring-indigo-500'
                  : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
              }`}
            >
              🎨 일반 도안
            </button>
            <button
              onClick={() => setStyleMode('mandala')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all border ${
                styleMode === 'mandala'
                  ? 'bg-purple-50 border-purple-500 text-purple-700 ring-1 ring-purple-500'
                  : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
              }`}
            >
              🌀 만다라
            </button>
          </div>
          <p className="text-xs text-slate-500">
            {styleMode === 'normal' 
              ? '사물과 배경을 있는 그대로 자세히 그립니다.' 
              : '주제 안에 복잡하고 아름다운 패턴을 채웁니다.'}
          </p>
        </div>

        {/* 난이도 설정 */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-sm font-semibold text-slate-700">난이도 (복잡도)</label>
            <span className="text-xs font-medium px-2 py-1 bg-slate-100 rounded text-slate-600">
              {difficulty}단계
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={difficulty}
            onChange={(e) => setDifficulty(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
          <div className="flex justify-between text-xs text-slate-400">
            <span>단순함</span>
            <span>정교함</span>
          </div>
        </div>

        {/* 생성 개수 */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">생성할 장수</label>
          <input
            type="number"
            min="1"
            max="10"
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        <Button 
          variant="primary" 
          onClick={onGenerate} 
          disabled={isGenerating}
          className="w-full py-3 text-lg shadow-md hover:shadow-lg transform active:scale-[0.98] transition-all"
        >
          {isGenerating ? progressStatus : '도안 생성하기 ✨'}
        </Button>

        {isGenerating && (
          <p className="text-xs text-center text-slate-500 animate-pulse">
            고화질 이미지를 생성 중입니다...<br/>(약 5~10초 소요)
          </p>
        )}
      </div>
    </aside>
  );
};
