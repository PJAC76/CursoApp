
import React from 'react';
import { Pillar, SearchSource } from '../types';
import { Layers, ArrowRight, ExternalLink } from 'lucide-react';

interface PillarSelectionProps {
  topic: string;
  pillars: Pillar[];
  onSelect: (pillar: Pillar) => void;
  isLoading: boolean;
  sources: SearchSource[];
}

export const PillarSelection: React.FC<PillarSelectionProps> = ({ topic, pillars, onSelect, isLoading, sources }) => {
  const safePillars = pillars || [];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
          Paso 1 de 3
        </div>
        <h2 className="text-3xl font-bold text-slate-900">Pilares Estratégicos para "{topic}"</h2>
        <p className="text-slate-600">
          Hemos analizado las tendencias. Selecciona uno de estos 10 temas pilar para profundizar.
        </p>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="text-slate-500 animate-pulse">Generando variaciones de lecciones...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {safePillars.map((pillar, index) => (
              <button
                key={index}
                onClick={() => onSelect(pillar)}
                className="group relative flex flex-col items-start p-6 bg-white border border-slate-200 rounded-2xl hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-500/5 transition-all text-left w-full"
              >
                <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-500">
                  <ArrowRight />
                </div>
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Layers size={24} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-indigo-700 transition-colors">
                  {pillar.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {pillar.description}
                </p>
              </button>
            ))}
          </div>

          {(sources || []).length > 0 && (
            <div className="mt-8 pt-6 border-t border-slate-200">
              <h4 className="text-sm font-semibold text-slate-500 mb-3 flex items-center gap-2">
                <span className="bg-indigo-100 p-1 rounded">G</span> Fuentes de Google Search
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
        </>
      )}
    </div>
  );
};
