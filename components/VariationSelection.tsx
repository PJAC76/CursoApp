import React from 'react';
import { Variation, Pillar } from '../types';
import { BookOpen, Target, ArrowLeft } from 'lucide-react';

interface VariationSelectionProps {
  pillar: Pillar;
  variations: Variation[];
  onSelect: (variation: Variation) => void;
  onBack: () => void;
  isLoading: boolean;
}

export const VariationSelection: React.FC<VariationSelectionProps> = ({ pillar, variations, onSelect, onBack, isLoading }) => {
  return (
    <div className="space-y-8 animate-fade-in">
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
        <h2 className="text-3xl font-bold mb-2">Pilar: {pillar.title}</h2>
        <p className="text-indigo-100 opacity-90">{pillar.description}</p>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
          <Target className="text-indigo-500" />
          Selecciona un ángulo para tu curso
        </h3>
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
             <p className="text-slate-500 animate-pulse">Diseñando el curso completo con imágenes y quiz...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {variations.map((variation, index) => (
              <button
                key={index}
                onClick={() => onSelect(variation)}
                className="flex items-center gap-4 p-5 bg-white border border-slate-200 rounded-xl hover:border-indigo-400 hover:bg-indigo-50/30 transition-all text-left w-full group"
              >
                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 font-bold group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  {index + 1}
                </div>
                <div className="flex-grow">
                  <h4 className="text-lg font-semibold text-slate-900 group-hover:text-indigo-700">
                    {variation.title}
                  </h4>
                  <p className="text-sm text-slate-500 mt-1">
                    Enfoque: {variation.focus}
                  </p>
                </div>
                <BookOpen className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
