import React, { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Download, RefreshCw, Trash2, Brush } from 'lucide-react';
import { jsPDF } from "jspdf"; // 1. 위치 수정됨

import { Sidebar } from './components/Sidebar';
import { ImageCard } from './components/ImageCard';
import { Button } from './components/Button';
import { ColoringPage } from './types';
import { generateImageWithGemini } from './services/geminiService';
// generatePDF import는 이제 필요 없어서 제거했습니다.

import { 
  DEFAULT_IMAGE_COUNT, 
  LOCAL_STORAGE_KEY_API, 
  DEFAULT_DIFFICULTY,
  COLORING_PROMPT_TEMPLATE
} from './constants'; // 2. 문법 오류 수정됨

const App: React.FC = () => {
  // State
  const [apiKey, setApiKey] = useState<string>('');
  const [theme, setTheme] = useState<string>('');
  const [count, setCount] = useState<number>(DEFAULT_IMAGE_COUNT);
  const [difficulty, setDifficulty] = useState<number>(DEFAULT_DIFFICULTY);
  
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

  // Helper: Generate Single Slot
  const generateSingleSlot = async (
    id: string, 
    currentTheme: string, 
    difficultyLevel: number
  ) => {
    try {
      // 3. 난이도 대신 스타일 키워드 강제 적용을 위해 프롬프트 전달 방식이 geminiService 내부에서 처리되도록 함
      // (geminiService.ts가 이미 수정되었으므로 여기서는 주제만 넘겨도 됩니다)
      const url = await generateImageWithGemini(apiKey, currentTheme);
      
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

  // Handler: Generate Loop
  const handleGenerate = async () => {
    if (!apiKey) return alert("API 키를 입력해주세요.");
    if (!theme) return alert("주제를 입력해주세요.");

    setIsGenerating(true);
    
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
      
      await generateSingleSlot(img.id, theme, difficulty);

      if (i < newImages.length - 1) {
        const waitTime = 5; // Pollinations는 빠르므로 대기 시간을 5초로 줄였습니다.
        for (let t = waitTime; t > 0; t--) {
             setProgressStatus(`다음 장 준비 중... (${t}초 대기)`);
             await delay(1000);
        }
      }
    }
    
    setIsGenerating(false);
    setProgressStatus('');
  };

  // Handler: Regenerate Selected
  const handleRegenerateSelected = async () => {
    const selectedIds = images.filter(img => img.isSelected).map(img => img.id);
    if (selectedIds.length === 0) return alert("다시 생성할 도안을 선택해주세요.");

    setIsGenerating(true);
    setImages(prev => prev.map(img => 
      img.isSelected ? { ...img, isLoading: true, error: null, url: null } : img
    ));

    for (let i = 0; i < selectedIds.length; i++) {
      setProgressStatus(`재생성 중... (${i + 1}/${selectedIds.length})`);
      await generateSingleSlot(selectedIds[i], theme, difficulty);
      
      if (i < selectedIds.length - 1) {
        await delay(3000); // 3초 대기
      }
    }

    setIsGenerating(false);
    setProgressStatus('');
  };

  // --- [PDF 저장 함수 수정 완료] ---
  const handleDownloadPDF = () => {
    // 1. 선택된 이미지들만 골라냅니다.
    const selectedImages = images.filter(img => img.isSelected && img.url);

    if (selectedImages.length === 0) {
      alert("PDF로 저장할 도안을 선택해주세요!");
      return;
    }

    try {
      const pdf = new jsPDF('p', 'mm', 'a4'); // A4 용지 생성
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      const margin = 10;
      const imgWidth = pageWidth - (margin * 2);
      const imgHeight = imgWidth; // 정사각형 이미지

      // 선택된 이미지들을 순서대로 PDF에 추가합니다.
      selectedImages.forEach((img, index) => {
        if (index > 0) {
            pdf.addPage(); // 두 번째 장부터는 새 페이지 추가
        }
        // img.url! 은 위에서 filter로 검사했으므로 존재함
        pdf.addImage(img.url!, 'PNG', margin, margin, imgWidth, imgHeight);
      });
      
      // 파일 저장
      pdf.save(`${theme || "색칠공부"}_도안.pdf`);

    } catch (error) {
      console.error("PDF 저장 에러:", error);
      alert("PDF 저장 중 문제가 발생했습니다. (이미지 로딩 문제일 수 있습니다)");
    }
  };
  // --- [PDF 저장 함수 끝] ---

  const toggleSelect = useCallback((id: string) => {
    setImages(prev => prev.map(img => 
      img.id === id ? { ...img, isSelected: !img.isSelected } : img
    ));
  }, []);

  const retrySingle = (id: string) => {
    setImages(prev => prev.map(img => 
        img.id === id ? { ...img, isLoading: true, error: null } : img
    ));
    generateSingleSlot(id, theme, difficulty);
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
