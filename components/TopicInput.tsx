
import React, { useState, useRef } from 'react';
import { Search, ArrowRight, Lightbulb } from 'lucide-react';

interface TopicInputProps {
  onSubmit: (topic: string) => void;
  isLoading: boolean;
}

export const TopicInput: React.FC<TopicInputProps> = ({ onSubmit, isLoading }) => {
  const [topic, setTopic] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim()) {
      onSubmit(topic);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (topic.trim()) onSubmit(topic);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTopic(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] max-w-2xl mx-auto text-center space-y-8 animate-fade-in">
      <div className="space-y-4">
        <div className="inline-flex items-center justify-center p-3 bg-indigo-50 rounded-full mb-4 ring-1 ring-indigo-100">
          <Lightbulb className="text-indigo-600 w-8 h-8" />
        </div>
        <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
          ¿Qué quieres enseñar hoy?
        </h2>
        <p className="text-lg text-slate-600 max-w-xl mx-auto">
          Dime un tema y construiré una estrategia de contenido completa para ti, desde los pilares hasta el curso final.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full relative group">
        <div className="absolute top-4 left-4 flex items-center pointer-events-none">
          <Search className="h-6 w-6 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
        </div>
        <textarea
          ref={textareaRef}
          value={topic}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Ej: Marketing Digital, Cocina Vegana, Python..."
          rows={1}
          className="block w-full pl-12 pr-36 py-4 bg-white border-2 border-slate-200 rounded-2xl text-lg placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm hover:border-slate-300 resize-none overflow-hidden min-h-[4rem]"
          disabled={isLoading}
          style={{ minHeight: '64px' }}
        />
        <button
          type="submit"
          disabled={!topic.trim() || isLoading}
          className="absolute right-2 bottom-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 h-12 rounded-xl font-medium transition-all flex items-center gap-2"
        >
          {isLoading ? (
            <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <>
              Empezar <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>
      
      <div className="flex flex-col items-center gap-10">
        <div className="flex gap-4 text-xs font-medium text-slate-400">
          <span>✨ Contenido Estructurado</span>
          <span>•</span>
          <span>🔍 Datos Actualizados</span>
          <span>•</span>
          <span>🎓 Formato Educativo</span>
        </div>

        {/* Identidad Visual Actualizada: Solo Texto ANADECO, centrado e Indigo */}
        <div className="flex flex-col items-center animate-pulse-slow">
           <h3 className="text-2xl font-black text-indigo-600 tracking-[0.2em] uppercase">
             ANADECO
           </h3>
           <div className="w-16 h-1 bg-indigo-100 rounded-full mt-3"></div>
        </div>
      </div>
    </div>
  );
};
