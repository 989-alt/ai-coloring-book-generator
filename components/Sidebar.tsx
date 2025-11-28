import React, { useRef } from 'react';
import { Settings, Key, Palette, Hash, Sliders, Brush, Circle, User, Mountain, Image, X } from 'lucide-react';
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
  selectedFile: File | null; setSelectedFile: (file: File | null) => void;
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
  selectedFile, setSelectedFile,
  onGenerate, isGenerating, progressStatus
}) => {
  
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        </div>

        <div className="flex p-1 bg-slate-100 rounded-lg">
          <button onClick={() => setAppMode(AppMode.COLORING)} className={`flex-1 py-2 text-sm rounded-md ${appMode === AppMode.COLORING ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>
            <Brush className="w-4 h-4 inline mr-2" />도안
          </button>
          <button onClick={() => setAppMode(AppMode.MANDALA)} className={`flex-1 py-2 text-sm rounded-md ${appMode === AppMode.MANDALA ? 'bg-white text-pink-600 shadow-sm' : 'text-slate-500'}`}>
            <Circle className="w-4 h-4 inline mr-2" />만다라
          </button>
        </div>

        <div className="space-y-4">
          <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="API 키" className="w-full px-3 py-2 border rounded-md" />
          
          {/* 이미지 업로드 */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center">
              <Image className="w-4 h-4 mr-2" /> 참고 이미지
            </label>
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
            
            {!selectedFile ? (
              <button onClick={() => fileInputRef.current?.click()} className="w-full py-4 border-2 border-dashed border-slate-300 rounded-lg text-xs text-slate-500 hover:border-indigo-500">
                이미지 업로드 (선택)
              </button>
            ) : (
              <div className="flex items-center gap-2 p-2 bg-indigo-50 rounded-lg border border-indigo-200">
                <span className="text-xs truncate flex-1">{selectedFile.name}</span>
                <button onClick={() => {setSelectedFile(null); if(fileInputRef.current) fileInputRef.current.value='';}}><X className="w-4 h-4 text-slate-500"/></button>
              </div>
            )}
          </div>

          <input type="text" value={theme} onChange={(e) => setTheme(e.target.value)} placeholder="주제 입력" className="w-full px-3 py-2 border rounded-md" />

          {appMode === AppMode.COLORING && (
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setArtStyle(ArtStyle.CHARACTER)} className={`p-2 border rounded-lg text-xs ${artStyle === ArtStyle.CHARACTER ? 'bg-indigo-50 border-indigo-600' : ''}`}><User className="w-4 h-4 inline mb-1"/> 인물</button>
              <button onClick={() => setArtStyle(ArtStyle.LANDSCAPE)} className={`p-2 border rounded-lg text-xs ${artStyle === ArtStyle.LANDSCAPE ? 'bg-indigo-50 border-indigo-600' : ''}`}><Mountain className="w-4 h-4 inline mb-1"/> 풍경</button>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">난이도: {difficulty}</span>
          </div>
          <input type="range" min={MIN_DIFFICULTY} max={MAX_DIFFICULTY} value={difficulty} onChange={(e) => setDifficulty(parseInt(e.target.value))} className="w-full" />
          
          <input type="number" min={MIN_IMAGE_COUNT} max={MAX_IMAGE_COUNT} value={count} onChange={(e) => setCount(parseInt(e.target.value))} className="w-full px-3 py-2 border rounded-md" />

          <Button onClick={onGenerate} isLoading={isGenerating} disabled={!apiKey || (!theme && !selectedFile)} className="w-full h-12">
            {isGenerating ? '생성 중...' : '도안 생성하기'}
          </Button>
        </div>
      </div>
    </aside>
  );
};
