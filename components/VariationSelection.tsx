
import React, { useState } from 'react';
import { Variation, Pillar, SearchSource } from '../types';
import { BookOpen, Target, ArrowLeft, ExternalLink, Check, Sparkles, Layers } from 'lucide-react';

interface VariationSelectionProps {
  pillar: Pillar;
  variations: Variation[];
  onGenerateSelected: (selectedVariations: Variation[], moduleCount: number) => void;
  onBack: () => void;
  isLoading: boolean;
  sources: SearchSource[];
}

export const VariationSelection: React.FC<VariationSelectionProps> = ({ pillar, variations, onGenerateSelected, onBack, isLoading, sources }) => {
  const [selectedTitles, setSelectedTitles] = useState<string[]>([]);
  const [moduleCount, setModuleCount] = useState(5);
  const safeVariations = variations || [];

  const toggleSelection = (title: string) => {
    setSelectedTitles(prev => 
      prev.includes(title) 
        ? prev.filter(t => t !== title) 
        : [...prev, title]
    );
  };

  const handleSelectAll = () => {
    if (selectedTitles.length === safeVariations.length) {
      setSelectedTitles([]);
    } else {
      setSelectedTitles(safeVariations.map(v => v.title));
    }
  };

  const handleSubmit = () => {
    const selected = safeVariations.filter(v => selectedTitles.includes(v.title));
    if (selected.length > 0) {
      onGenerateSelected(selected, moduleCount);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-24">
       <button 
        onClick={onBack}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-4 text-sm font-medium"
      >
        <ArrowLeft size={16} /> Volver a Pilares
      </button>

      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 text-white shadow-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 text-white rounded-full text-sm font-medium backdrop-blur-sm mb-4">
          Paso 2 de 3
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold mb-2">Pilar: {pillar.title}</h2>
            <p className="text-indigo-100 opacity-90 max-w-2xl">{pillar.description}</p>
          </div>
          <button 
            onClick={handleSelectAll}
            className="text-xs font-bold uppercase tracking-widest px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors border border-white/20 whitespace-nowrap"
          >
            {selectedTitles.length === safeVariations.length ? 'Desmarcar todo' : 'Seleccionar todo'}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
          <Target className="text-indigo-500" />
          Selecciona los enfoques para tu formación maestra
        </h3>
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
             <p className="text-slate-500 animate-pulse">Fusionando enfoques y generando contenido integral...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {safeVariations.map((variation, index) => {
                const isSelected = selectedTitles.includes(variation.title);
                return (
                  <div
                    key={index}
                    onClick={() => toggleSelection(variation.title)}
                    className={`relative flex items-center gap-4 p-5 bg-white border rounded-2xl transition-all cursor-pointer group shadow-sm ${
                      isSelected 
                        ? 'border-indigo-500 ring-2 ring-indigo-500/10 bg-indigo-50/20' 
                        : 'border-slate-200 hover:border-indigo-300 hover:shadow-md'
                    }`}
                  >
                    <div className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full border-2 transition-colors ${
                      isSelected 
                        ? 'bg-indigo-600 border-indigo-600 text-white' 
                        : 'border-slate-200 text-transparent'
                    }`}>
                      <Check size={16} strokeWidth={3} />
                    </div>
                    <div className="flex-grow">
                      <h4 className={`text-lg font-bold transition-colors ${isSelected ? 'text-indigo-700' : 'text-slate-900'}`}>
                        {variation.title}
                      </h4>
                      <p className="text-sm text-slate-500 mt-1">
                        {variation.focus}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {(sources || []).length > 0 && (
              <div className="mt-12 pt-6 border-t border-slate-200">
                <h4 className="text-sm font-semibold text-slate-500 mb-3 flex items-center gap-2">
                  <span className="bg-indigo-100 p-1 rounded">G</span> Tendencias y Referencias
                </h4>
                <div className="flex flex-wrap gap-2">
                  {sources.map((source, idx) => (
                    <a 
                      key={idx}
                      href={source.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-full text-slate-600 hover:border-indigo-300 hover:text-indigo-600 transition-colors"
                    >
                      {source.title}
                      <ExternalLink size={10} />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Sticky Action Bar */}
            {selectedTitles.length > 0 && (
              <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl z-50 animate-slide-up">
                <div className="bg-slate-900 text-white p-4 sm:p-6 rounded-2xl shadow-2xl border border-white/10 flex flex-col sm:flex-row items-center gap-4 justify-between">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                       <Layers size={16} className="text-indigo-400" />
                       <span className="text-sm font-bold">{selectedTitles.length} Enfoques</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                       <input 
                         type="range" 
                         min="1" 
                         max="10" 
                         value={moduleCount} 
                         onChange={(e) => setModuleCount(parseInt(e.target.value))}
                         className="w-24 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                       />
                       <span className="text-[10px] font-black uppercase text-indigo-400">{moduleCount} módulos / enfoque</span>
                    </div>
                  </div>
                  <button 
                    onClick={handleSubmit}
                    className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Sparkles size={18} /> Generar Formación Integral
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
