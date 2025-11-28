import React, { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Download, RefreshCw, Trash2, Brush } from 'lucide-react';
import { jsPDF } from "jspdf"; 

import { Sidebar } from './components/Sidebar';
import { ImageCard } from './components/ImageCard';
import { Button } from './components/Button';
import { ColoringPage } from './types';
import { generateImageWithGemini } from './services/geminiService';

import { 
  DEFAULT_IMAGE_COUNT, 
  LOCAL_STORAGE_KEY_API, 
  DEFAULT_DIFFICULTY
} from './constants';

const App: React.FC = () => {
  // State
  const [apiKey, setApiKey] = useState<string>('');
  const [theme, setTheme] = useState<string>('');
  const [count, setCount] = useState<number>(DEFAULT_IMAGE_COUNT);
  const [difficulty, setDifficulty] = useState<number>(DEFAULT_DIFFICULTY);
  // ⭐ 신규 상태: 스타일 모드 (기본값 'normal')
  const [styleMode, setStyleMode] = useState<'normal' | 'mandala'>('normal');
  
  const [images, setImages] = useState<ColoringPage[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [progressStatus, setProgressStatus] = useState<string>('');

  // Load API Key
  useEffect(() => {
    const storedKey = localStorage.getItem(LOCAL_STORAGE_KEY_API);
    if (storedKey) setApiKey(storedKey);
  }, []);

  // Save API Key
  useEffect(() => {
    if (apiKey) localStorage.setItem(LOCAL_STORAGE_KEY_API, apiKey);
  }, [apiKey]);

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // Helper: 도안 1장 생성 함수
  const generateSingleSlot = async (
    id: string, 
    currentTheme: string, 
    difficultyLevel: number,
    mode: 'normal' | 'mandala' // ⭐ 모드 인자 추가
  ) => {
    try {
      // ⭐ generateImageWithGemini에 모드(mode) 전달
      const url = await generateImageWithGemini(apiKey, currentTheme, difficultyLevel, mode);
      
      setImages(prev => prev.map(img => 
        img.id === id ? { ...img, isLoading: false, url, error: null } : img
      ));
      return true;
    } catch (error: any) {
      setImages(prev => prev.map(img => 
        img.id === id ? { ...img, isLoading: false, error: error.message || "생성 실패", url: null } : img
      ));
      return false;
    }
  };

  // Handler: 전체 생성 버튼 클릭
  const handleGenerate = async () => {
    if (!theme) return alert("주제를 입력해주세요.");

    setIsGenerating(true);
    
    // 빈 카드 생성
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
      setProgressStatus(`도안 그리는 중... (${i + 1}/${count})`);
      
      // ⭐ 스타일 모드(styleMode) 전달
      await generateSingleSlot(img.id, theme, difficulty, styleMode);

      if (i < newImages.length - 1) {
        const waitTime = 5; 
        for (let t = waitTime; t > 0; t--) {
             setProgressStatus(`다음 장 준비 중... (${t}초 대기)`);
             await delay(1000);
        }
      }
    }
    
    setIsGenerating(false);
    setProgressStatus('');
  };

  // Handler: 선택 재성성
  const handleRegenerateSelected = async () => {
    const selectedIds = images.filter(img => img.isSelected).map(img => img.id);
    if (selectedIds.length === 0) return alert("다시 생성할 도안을 선택해주세요.");

    setIsGenerating(true);
    setImages(prev => prev.map(img => 
      img.isSelected ? { ...img, isLoading: true, error: null, url: null } : img
    ));

    for (let i = 0; i < selectedIds.length; i++) {
      setProgressStatus(`재생성 중... (${i + 1}/${selectedIds.length})`);
      // ⭐ 스타일 모드 전달
      await generateSingleSlot(selectedIds[i], theme, difficulty, styleMode);
      
      if (i < selectedIds.length - 1) {
        await delay(3000);
      }
    }

    setIsGenerating(false);
    setProgressStatus('');
  };

  const handleDownloadPDF = () => {
    const selectedImages = images.filter(img => img.isSelected && img.url);

    if (selectedImages.length === 0) {
      alert("PDF로 저장할 도안을 선택해주세요!");
      return;
    }

    try {
      const pdf = new jsPDF('p', 'mm', 'a4'); 
      const pageWidth = pdf.internal.pageSize.getWidth();
      
      const margin = 10;
      const imgWidth = pageWidth - (margin * 2);
      const imgHeight = imgWidth;

      selectedImages.forEach((img, index) => {
        if (index > 0) pdf.addPage();
        pdf.addImage(img.url!, 'PNG', margin, margin, imgWidth, imgHeight);
      });
      
      pdf.save(`${theme || "색칠공부"}_도안.pdf`);

    } catch (error) {
      console.error("PDF 저장 에러:", error);
      alert("PDF 저장 중 문제가 발생했습니다.");
    }
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
    generateSingleSlot(id, theme, difficulty, styleMode);
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
        // ⭐ Props 전달
        styleMode={styleMode} setStyleMode={setStyleMode}
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
              <Brush className="w-12 h-12 text-slate-300" />
            </div>
            <h2 className="text-xl font-semibold text-slate-600 mb-2">도안이 없습니다</h2>
            <p>왼쪽 메뉴에서 주제를 입력하고 도안을 생성해보세요.</p>
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
