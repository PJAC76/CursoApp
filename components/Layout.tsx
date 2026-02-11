
import React from 'react';
import { BookOpen, Sparkles } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  onRestart: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, onRestart }) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-700">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={onRestart}
          >
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
              <BookOpen size={20} strokeWidth={2.5} />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-700 to-purple-600 bg-clip-text text-transparent">
              CursoAPP
            </h1>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
            <Sparkles size={16} className="text-amber-500" />
            <span>AI Mentor</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-200 mt-12 bg-white/50">
        <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-slate-400 text-sm">
          <p>Potenciado por Gemini 3 Flash & Google Search</p>
          <div className="flex items-center gap-4">
            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded text-[10px] font-bold uppercase tracking-wider">
              Stable v1.2.3
            </span>
            <span className="text-slate-300">|</span>
            <p>© 2024 CursoAPP Strategy Builder</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
