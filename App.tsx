import React, { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Download, RefreshCw, Trash2 } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { ImageCard } from './components/ImageCard';
import { Button } from './components/Button';
import { ColoringPage } from './types';
import { generateImageWithGemini, analyzeImageForPrompt } from './services/geminiService';
import { generatePDF } from './utils/pdfGenerator';
import { DEFAULT_IMAGE_COUNT, LOCAL_STORAGE_KEY_API, DEFAULT_DIFFICULTY, AppMode, ArtStyle, COLORING_PROMPT_TEMPLATE, MANDALA_PROMPT_TEMPLATE } from './constants';

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [theme, setTheme] = useState('');
  const [count, setCount] = useState(DEFAULT_IMAGE_COUNT);
  const [difficulty, setDifficulty] = useState(DEFAULT_DIFFICULTY);
  const [appMode, setAppMode] = useState(AppMode.COLORING);
  const [artStyle, setArtStyle] = useState(ArtStyle.CHARACTER);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const [images, setImages] = useState<ColoringPage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressStatus, setProgressStatus] = useState('');

  useEffect(() => {
    const key = localStorage.getItem(LOCAL_STORAGE_KEY_API);
    if (key) setApiKey(key);
  }, []);

  useEffect(() => {
    if (apiKey) localStorage.setItem(LOCAL_STORAGE_KEY_API, apiKey);
  }, [apiKey]);

  const generateSingle = async (id: string, currentTheme: string, diff: number, mode: AppMode, style: ArtStyle, imgDesc?: string) => {
    try {
      const prompt = mode === AppMode.COLORING 
        ? COLORING_PROMPT_TEMPLATE(currentTheme, diff, style, imgDesc)
        : MANDALA_PROMPT_TEMPLATE(currentTheme, diff);

      const url = await generateImageWithGemini(apiKey, prompt);
      setImages(prev => prev.map(p => p.id === id ? { ...p, isLoading: false, url, error: null } : p));
    } catch (e) {
      setImages(prev => prev.map(p => p.id === id ? { ...p, isLoading: false, error: "실패", url: null } : p));
    }
  };

  const handleGenerate = async () => {
    if (!apiKey) return alert("API 키 필요");
    if (!theme && !selectedFile) return alert("주제나 이미지 필요");

    setIsGenerating(true);
    let imgDesc = "";

    if (selectedFile) {
      setProgressStatus("이미지 분석 중...");
      try {
        imgDesc = await analyzeImageForPrompt(apiKey, selectedFile);
      } catch (e) { console.error(e); }
    }

    const newPages = Array.from({ length: count }).map(() => ({
      id: uuidv4(), url: null, isLoading: true, error: null, isSelected: false
    }));
    setImages(newPages);

    for (let i = 0; i < newPages.length; i++) {
      setProgressStatus(`생성 중 (${i+1}/${count})`);
      await generateSingle(newPages[i].id, theme, difficulty, appMode, artStyle, imgDesc);
    }
    setIsGenerating(false);
    setProgressStatus('');
  };

  const handleDownloadPDF = () => {
    const urls = images.filter(i => i.isSelected && i.url).map(i => i.url!);
    if (urls.length === 0) return alert("선택된 도안 없음");
    generatePDF(urls, "ColoringBook");
  };

  const toggleSelect = useCallback((id: string) => {
    setImages(prev => prev.map(i => i.id === id ? { ...i, isSelected: !i.isSelected } : i));
  }, []);

  const retry = (id: string) => {
    setImages(prev => prev.map(i => i.id === id ? { ...i, isLoading: true, error: null } : i));
    generateSingle(id, theme, difficulty, appMode, artStyle);
  };

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
        onGenerate={handleGenerate} isGenerating={isGenerating} progressStatus={progressStatus}
      />
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map(page => (
            <ImageCard key={page.id} page={page} onToggleSelect={toggleSelect} onRetry={retry} />
          ))}
        </div>
        {images.length > 0 && (
          <div className="fixed bottom-6 right-6 flex gap-2">
             <Button onClick={handleDownloadPDF} icon={<Download className="w-4 h-4"/>}>PDF 저장</Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
