import React, { useRef } from 'react';
import { Settings, Key, Palette, Hash, Sliders, Brush, Circle, User, Mountain, Image as ImageIcon, X } from 'lucide-react';
import { Button } from './Button';
import { 
  MIN_IMAGE_COUNT, MAX_IMAGE_COUNT, 
  MIN_DIFFICULTY, MAX_DIFFICULTY, 
  AppMode, ArtStyle 
} from '../constants';

interface SidebarProps {
  apiKey: string; setApiKey: (key: string) => void;
  theme: string; setTheme: (theme: string) => void;
  count: number; setCount: (count: number) => void;
  difficulty: number; setDifficulty: (level: number) => void;
  appMode: AppMode; setAppMode: (mode: AppMode) => void;
  artStyle: ArtStyle; setArtStyle: (style: ArtStyle) => void;
  selectedFile: File | null; setSelectedFile: (file: File | null) => void; // [신규] 파일 상태
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
  artStyle, setArtStyle,
  selectedFile, setSelectedFile, // [신규]
  onGenerate, isGenerating, progressStatus
}) => {
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getDifficultyLabel = (level: number) => {
    switch (level) {
      case 1: return "1단계 (단순)";
      case 2: return "2단계 (쉬움)";
      case 3: return "3단계 (보통)";
      case 4: return "4단계 (디테일)";
      case 5: return "5단계 (전문가)";
      default: return `${level}단계`;
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
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
          <p className="text-slate-500 text-sm mt-1">이미지 분석 & 고퀄리티 도안</p>
        </div>

        {/* 모드 선택 */}
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

          {/* [신규] 이미지 업로드 섹션 */}
          <div className="space-y-2">
            <label className="flex items-center text-sm font-semibold text-slate-700">
              <ImageIcon className="w-4 h-4 mr-2" />
              참고 이미지 (선택)
            </label>
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            
            {!selectedFile ? (
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-8 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 hover:border-indigo-500 hover:text-indigo-600 transition-colors flex flex-col items-center justify-center text-xs gap-1"
              >
                <span>클릭하여 이미지 업로드</span>
                <span className="text-[10px] text-slate-400">사진을 바탕으로 도안을 그립니다</span>
              </button>
            ) : (
              <div className="relative p-2 border border-indigo-200 bg-indigo-50 rounded-lg flex items-center gap-2">
                <div className="w-10 h-10 bg-indigo-200 rounded overflow-hidden flex-shrink-0">
                  <img src={URL.createObjectURL(selectedFile)} alt="preview" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-indigo-900 truncate">{selectedFile.name}</p>
                  <p className="text-[10px] text-indigo-600">이미지 분석 대기 중</p>
                </div>
                <button 
                  onClick={() => { setSelectedFile(null); if(fileInputRef.current) fileInputRef.current.value = ''; }}
                  className="p-1 hover:bg-white rounded-full text-slate-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="flex items-center text-sm font-semibold text-slate-700">
              <Palette className="w-4 h-4 mr-2" />
              주제 / 추가 요청
            </label>
            <input
              type="text"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder={selectedFile ? "예: 고양이를 더 귀엽게 그려줘" : "예: 숲속의 사슴"}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {appMode === AppMode.COLORING && (
            <div className="space-y-2">
              <label className="flex items-center text-sm font-semibold text-slate-700">
                <Settings className="w-4 h-4 mr-2" />
                그림체 스타일
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setArtStyle(ArtStyle.CHARACTER)}
                  className={`flex flex-col items-center justify-center p-3 border rounded-lg transition-all ${
                    artStyle === ArtStyle.CHARACTER 
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <User className="w-5 h-5 mb-1" />
                  <span className="text-xs font-medium">인물/캐릭터</span>
                </button>
                <button
                  onClick={() => setArtStyle(ArtStyle.LANDSCAPE)}
                  className={`flex flex-col items-center justify-center p-3 border rounded-lg transition-all ${
                    artStyle === ArtStyle.LANDSCAPE 
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <Mountain className="w-5 h-5 mb-1" />
                  <span className="text-xs font-medium">풍경/배경</span>
                </button>
              </div>
            </div>
          )}

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
          </div>

          <div className="space-y-2">
            <label className="flex items-center text-sm font-semibold text-slate-700">
              <Hash className="w-4 h-4 mr-2" />
              생성할 장수
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
            disabled={!apiKey || (!theme && !selectedFile)} // [변경] 파일이나 주제 중 하나만 있어도 가능
            className="w-full h-12 text-lg flex-col leading-tight"
          >
            {isGenerating ? (
              <span className="text-sm">{progressStatus || '생성 중...'}</span>
            ) : (
              '도안 생성하기'
            )}
          </Button>
        </div>
      </div>
    </aside>
  );
};
