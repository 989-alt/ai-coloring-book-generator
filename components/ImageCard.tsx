import React from 'react';
import { CheckCircle2, AlertCircle, RefreshCw, Download } from 'lucide-react';
import { ColoringPage } from '../types';

interface ImageCardProps {
  page: ColoringPage;
  onToggleSelect: (id: string) => void;
  onRetry: (id: string) => void;
}

export const ImageCard: React.FC<ImageCardProps> = ({ page, onToggleSelect, onRetry }) => {
  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (page.url) {
      const link = document.createElement('a');
      link.href = page.url;
      link.download = `coloring_page_${page.id.slice(0, 8)}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Hidden Items Hint 섹션 삭제됨 */}

      <div 
        className={`relative group rounded-xl overflow-hidden border-2 transition-all duration-200 bg-white shadow-sm aspect-[3/4] ${
          page.isSelected 
            ? 'border-indigo-600 ring-2 ring-indigo-100' 
            : 'border-slate-200 hover:border-slate-300'
        }`}
        onClick={() => !page.isLoading && !page.error && onToggleSelect(page.id)}
      >
        {page.isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 z-10">
            <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
            <span className="text-sm text-slate-500 font-medium animate-pulse">그리는 중...</span>
          </div>
        )}

        {page.error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50 p-4 text-center z-10">
            <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
            <p className="text-sm text-red-600 mb-4">{page.error}</p>
            <button 
              onClick={(e) => { e.stopPropagation(); onRetry(page.id); }}
              className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-md text-sm font-medium hover:bg-red-50"
            >
              다시 시도
            </button>
          </div>
        )}

        {page.url && !page.isLoading && (
          <>
            <img src={page.url} alt="Result" className="w-full h-full object-contain p-2" />
            
            <div className={`absolute top-3 right-3 transition-transform duration-200 ${page.isSelected ? 'scale-100' : 'scale-0 group-hover:scale-100'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${page.isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>

            <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
               <button
                 onClick={handleDownload}
                 className="p-2 bg-white text-slate-600 rounded-full shadow-md border border-slate-200 hover:text-indigo-600"
               >
                 <Download className="w-5 h-5" />
               </button>
            </div>
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-200 pointer-events-none" />
          </>
        )}
      </div>
    </div>
  );
};
