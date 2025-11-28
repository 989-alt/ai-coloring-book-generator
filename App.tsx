import React, { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Download, RefreshCw, Trash2 } from 'lucide-react';

import { Sidebar } from './components/Sidebar';
import { ImageCard } from './components/ImageCard';
import { Button } from './components/Button';
import { ColoringPage } from './types';
import { generateImageWithGemini, analyzeImageForPrompt } from './services/geminiService';
import { generatePDF } from './utils/pdfGenerator';
import { 
  DEFAULT_IMAGE_COUNT, 
  LOCAL_STORAGE_KEY_API, 
  DEFAULT_DIFFICULTY,
  AppMode,
  ArtStyle, 
  COLORING_PROMPT_TEMPLATE,
  MANDALA_PROMPT_TEMPLATE
} from './constants';

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>('');
  const [theme, setTheme] = useState<string>('');
  const [count, setCount] = useState<number>(DEFAULT_IMAGE_COUNT);
  const [difficulty, setDifficulty] = useState<number>(DEFAULT_DIFFICULTY);
  const [appMode, setAppMode] = useState<AppMode>(AppMode.COLORING);
  const [artStyle, setArtStyle] = useState<ArtStyle>(ArtStyle.CHARACTER);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const [images, setImages] = useState<ColoringPage[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [progressStatus, setProgressStatus] = useState<string>('');

  useEffect(() => {
    const storedKey = localStorage.getItem(LOCAL_STORAGE_KEY_API);
    if (storedKey) setApiKey(storedKey);
  }, []);

  useEffect(() => {
    if (apiKey) localStorage.setItem(LOCAL_STORAGE_KEY_API, apiKey);
  }, [apiKey]);

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const generateSingleSlot = async (
    id: string, 
    currentTheme: string, 
    difficultyLevel: number,
    mode: AppMode,
    style: ArtStyle,
    imageDesc?: string
  ) => {
    try {
      let prompt = "";

      if (mode === AppMode.COLORING) {
        prompt = COLORING_PROMPT_TEMPLATE(currentTheme, difficultyLevel, style, imageDesc);
      } else if (mode === AppMode.MANDALA) {
        prompt = MANDALA_PROMPT_TEMPLATE(currentTheme, difficultyLevel);
      }

      const url = await generateImageWithGemini(apiKey, prompt);
      
      setImages(prev => prev.map(img => 
        img.id === id ? { ...img, isLoading: false, url, error: null } : img
      ));
      return true;
    } catch (error: any) {
      setImages(prev => prev.map(img => 
        img.id === id ? { ...img, isLoading: false, error: "생성 실패", url: null } : img
      ));
      return false;
    }
  };

  const handleGenerate = async () => {
    if (!apiKey) return alert("API 키를 입력해주세요.");
    if (!theme && !selectedFile) return alert("주제 입력 또는 이미지를 업로드해주세요.");

    setIsGenerating(true);
    
    // 1. 이미지 분석 단계
    let analyzedDescription = "";
    if (selectedFile) {
      try {
        setProgressStatus("AI가 이미지를 분석 중...");
        analyzedDescription = await analyzeImageForPrompt(apiKey, selectedFile);
        
        if (!analyzedDescription) {
             console.warn("이미지 분석 결과가 비어있습니다.");
        }
      } catch (e) {
        console.error("이미지 분석 건너뜀:", e);
      }
    }

    const newImages: ColoringPage[] = Array.from({ length: count }).map(() => ({
      id: uuidv4(),
      url: null,
      isLoading: true,
      error: null,
      isSelected: false 
    }));
    setImages(newImages);

    for (let i = 0; i < newImages.length; i++) {
      const img = newImages[i];
      setProgressStatus(`도안 생성 중 (${i + 1}/${count})`);
      
      await generateSingleSlot(img.id, theme, difficulty, appMode, artStyle, analyzedDescription);

      if (i < newImages.length - 1) {
        await delay(1500);
      }
    }
    
    setIsGenerating(false);
    setProgressStatus('');
  };

  const handleRegenerateSelected = async () => {
    const selectedIds = images.filter(img => img.isSelected).map(img => img.id);
    if (selectedIds.length === 0) return alert("다시 생성할 도안을 선택해주세요.");

    setIsGenerating(true);
    setImages(prev => prev.map(img => 
      img.isSelected ? { ...img, isLoading: true, error: null, url: null } : img
    ));

    for (let i = 0; i < selectedIds.length; i++) {
      setProgressStatus(`재생성 중 (${i + 1}/${selectedIds.length})`);
      await generateSingleSlot(selectedIds[i], theme, difficulty, appMode, artStyle);
      if (i < selectedIds.length - 1) await delay(1500);
    }

    setIsGenerating(false);
    setProgressStatus('');
  };

  const handleDownloadPDF = () => {
    const selectedImages = images.filter(img => img.isSelected && img.url).map(img => img.url!);
    if (selectedImages.length === 0) return alert("PDF로 저장할 도안을 선택해주세요.");
    generatePDF(selectedImages, theme || "ColoringBook");
  };

  const toggleSelect = useCallback((id: string) => {
    setImages(prev => prev.map(img => 
      img.id === id ? { ...img, isSelected: !img.isSelected } : img
    ));
  }, []);

  const retrySingle = (id: string) => {
    setImages(prev => prev.map(img => 
        img.id === id ? { ...img, isLoading: true, error: null } : img
    ));
    generateSingleSlot(id, theme, difficulty, appMode, artStyle);
  };

  const hasImages = images.length > 0;
  const selectedCount = images.filter(i => i.isSelected).length;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50">
      <Sidebar 
        apiKey={apiKey} setApiKey={setApiKey}
        theme={theme} setTheme={setTheme}
        count={count} setCount={setCount}
        difficulty={difficulty} setDifficulty={setDifficulty}
        appMode={appMode} setAppMode={setAppMode}
        artStyle={artStyle} setArtStyle={setArtStyle}
        selectedFile={selectedFile} setSelectedFile={setSelectedFile}
        onGenerate={handleGenerate}
        isGenerating={isGenerating}
        progressStatus={progressStatus}
      />

      <main className="flex-1 p-6 lg:p-10 overflow-y-auto h-auto lg:h-screen">
        {hasImages && (
          <div className="mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200 sticky top-0 z-20">
            <div className="text-slate-600 font-medium">
              <span className="text-indigo-600 font-bold">{selectedCount}</span>장 선택됨
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button 
                variant="secondary" onClick={handleRegenerateSelected}
                disabled={selectedCount === 0 || isGenerating}
                icon={<RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />}
                className="flex-1 sm:flex-none"
              >
                선택 다시 만들기
              </Button>
              <Button 
                variant="primary" onClick={handleDownloadPDF}
                disabled={selectedCount === 0 || isGenerating}
                icon={<Download className="w-4 h-4" />}
                className="flex-1 sm:flex-none"
              >
                PDF 저장
              </Button>
            </div>
          </div>
        )}

        {!hasImages && !isGenerating && (
          <div className="h-[60vh] flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
            <div className="bg-white p-6 rounded-full shadow-sm mb-4">
              <Trash2 className="w-12 h-12 text-slate-300" />
            </div>
            <h2 className="text-xl font-semibold text-slate-600 mb-2">생성된 도안이 없습니다</h2>
            <p>왼쪽 메뉴에서 주제를 입력하거나 사진을 업로드하세요.</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 pb-20">
          {images.map((page) => (
            <ImageCard 
              key={page.id} page={page} 
              onToggleSelect={toggleSelect} onRetry={retrySingle}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default App;
