
import React, { useState, useMemo, useEffect } from 'react';
import { Course } from '../types';
import { 
  ChevronLeft, 
  Award, 
  RefreshCw, 
  Loader2, 
  Menu, 
  X,
  List,
  Sparkles,
  Download,
  FileText,
  Presentation,
  Copy,
  Check,
  Maximize2
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { exportToPDF, exportToPPTX } from '../services/exportService';

interface CourseViewProps {
  course: Course;
  onBack: () => void;
}

export const CourseView: React.FC<CourseViewProps> = ({ course, onBack }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedImageUrl, setSelectedImageUrl] = useState<{url: string, title: string} | null>(null);
  
  // Safe defaults
  const safeModules = course.modules || [];
  const safeQuiz = course.quiz || [];

  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Initialize quiz answers when course changes
  useEffect(() => {
    setQuizAnswers(new Array(safeQuiz.length).fill(-1));
  }, [course]);

  // Handle escape key to close lightbox
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedImageUrl(null);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const imagesGenerated = useMemo(() => 
    safeModules.filter(m => !!m.imageUrl).length, 
    [safeModules]
  );
  
  const progressPercent = safeModules.length > 0 
    ? Math.round((imagesGenerated / safeModules.length) * 100) 
    : 0;

  const themeStyle = {
    '--theme-color': course.primaryColor || '#4F46E5',
  } as React.CSSProperties;

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({ top: element.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
    }
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const handleCopy = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const downloadImage = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename.replace(/\s+/g, '_')}_Imagen.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="animate-fade-in relative flex flex-col md:flex-row gap-6 items-start" style={themeStyle}>
      {/* Sidebar navigation */}
      <aside className={`fixed md:sticky top-20 left-0 z-40 w-72 h-[calc(100vh-6rem)] transition-all duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:w-0 md:opacity-0 md:-ml-6'} bg-white border-r border-slate-200 md:border-none md:bg-transparent rounded-r-2xl md:rounded-none shadow-2xl md:shadow-none p-4 overflow-y-auto`}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><List size={16} /> Índice</h3>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-2"><X size={20} /></button>
        </div>
        <nav className="space-y-2">
          {safeModules.map((m, idx) => (
            <button key={idx} onClick={() => scrollToSection(`module-${idx}`)} className="w-full text-left p-3 rounded-xl hover:bg-white hover:shadow-md border border-transparent transition-all group flex gap-3">
              <span className={`flex-shrink-0 w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center transition-colors ${m.imageUrl ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'}`}>
                {m.imageUrl ? <Check size={10} /> : idx + 1}
              </span>
              <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 line-clamp-2">{m.title}</span>
            </button>
          ))}
          {safeQuiz.length > 0 && (
            <button onClick={() => scrollToSection('quiz-section')} className="w-full text-left p-3 rounded-xl hover:bg-white hover:shadow-md border border-transparent transition-all group flex gap-3 mt-4">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-colors"><Award size={12} /></span>
              <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900">Evaluación Final</span>
            </button>
          )}
        </nav>

        {/* Export Card */}
        <div className="mt-8 p-4 bg-indigo-50 rounded-2xl border border-indigo-100 space-y-3">
          <p className="text-xs font-bold text-indigo-400 uppercase tracking-tighter">Exportar Estrategia</p>
          <button 
            onClick={() => exportToPDF(course)}
            className="w-full flex items-center gap-2 p-2 bg-white rounded-lg text-sm font-medium text-slate-700 hover:text-indigo-600 border border-transparent hover:border-indigo-200 transition-all"
          >
            <FileText size={16} className="text-red-500" /> PDF Documento
          </button>
          <button 
            onClick={() => exportToPPTX(course)}
            className="w-full flex items-center gap-2 p-2 bg-white rounded-lg text-sm font-medium text-slate-700 hover:text-indigo-600 border border-transparent hover:border-indigo-200 transition-all"
          >
            <Presentation size={16} className="text-orange-500" /> PowerPoint
          </button>
        </div>
      </aside>

      <div className="flex-1 w-full">
        <div className="flex justify-between items-center mb-6">
          <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-[var(--theme-color)] transition-colors font-medium">
            <ChevronLeft size={16} /> Volver
          </button>
          
          <div className="flex items-center gap-4">
            {progressPercent < 100 && safeModules.length > 0 && (
              <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-white rounded-full shadow-sm border border-slate-100">
                <Loader2 size={14} className="animate-spin text-indigo-500" />
                <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${progressPercent}%` }} />
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">{progressPercent}% IA</span>
              </div>
            )}
            {!isSidebarOpen && <button onClick={() => setIsSidebarOpen(true)} className="px-4 py-2 bg-white border rounded-full text-slate-600 hover:border-[var(--theme-color)] transition-all shadow-sm flex items-center gap-2"><Menu size={18} /> Índice</button>}
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden mb-8">
          <div className="relative h-72 overflow-hidden" style={{ backgroundColor: course.primaryColor }}>
             <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
             <div className="absolute bottom-0 left-0 right-0 p-10 text-white">
               <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest mb-4">
                 <Sparkles size={12} /> Estrategia v1.2 Premium
               </div>
               <h1 className="text-4xl md:text-5xl font-black mb-3 leading-tight">{course.title}</h1>
               <p className="text-xl text-white/90 font-light max-w-2xl">{course.subtitle}</p>
             </div>
          </div>

          <div className="p-6 md:p-10 space-y-20">
            {safeModules.map((module, idx) => (
              <section key={idx} id={`module-${idx}`} className="scroll-mt-24 animate-fade-in group">
                <div className="grid md:grid-cols-3 gap-10">
                  <div className="md:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-[var(--theme-color)] font-black text-xl border border-slate-100">{idx + 1}</div>
                        <h2 className="text-3xl font-bold text-slate-900 group-hover:text-[var(--theme-color)] transition-colors">{module.title}</h2>
                      </div>
                      <button 
                        onClick={() => handleCopy(module.content, idx)}
                        className={`p-2 rounded-lg transition-all ${copiedId === idx ? 'bg-green-50 text-green-600' : 'text-slate-400 hover:bg-slate-50 hover:text-indigo-600'}`}
                        title="Copiar contenido"
                      >
                        {copiedId === idx ? <Check size={18} /> : <Copy size={18} />}
                      </button>
                    </div>
                    <div className="prose prose-slate prose-lg max-w-none text-slate-600">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{module.content}</ReactMarkdown>
                    </div>
                  </div>
                  <div className="md:col-span-1">
                    <div className="rounded-3xl overflow-hidden shadow-2xl border border-slate-100 bg-slate-50 sticky top-24 aspect-video flex items-center justify-center group/img">
                      {module.imageUrl ? (
                        <div 
                          className="relative w-full h-full cursor-zoom-in overflow-hidden"
                          onClick={() => setSelectedImageUrl({ url: module.imageUrl!, title: module.title })}
                        >
                          <img 
                            src={module.imageUrl} 
                            alt={module.title} 
                            className="w-full h-full object-cover animate-fade-in transition-transform duration-700 group-hover/img:scale-110" 
                          />
                          <div className="absolute top-4 right-4 flex gap-2">
                             <div className="p-2 bg-black/40 backdrop-blur-md rounded-full text-white opacity-0 group-hover/img:opacity-100 transition-opacity">
                               <Maximize2 size={14} />
                             </div>
                          </div>
                          <div className="absolute inset-0 bg-black/10 opacity-0 group-hover/img:opacity-100 transition-opacity" />
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-slate-400">
                          <Loader2 className="animate-spin" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">IA Ilustrando...</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            ))}

            {safeQuiz.length > 0 && (
              <section id="quiz-section" className="pt-10 border-t-4 border-slate-50">
                <div className="max-w-2xl mx-auto text-center">
                  <div className="inline-flex p-5 rounded-full bg-amber-50 text-amber-500 mb-6 border border-amber-100"><Award size={48} /></div>
                  <h2 className="text-4xl font-black text-slate-900 mb-8">Examen Final</h2>
                  <div className="space-y-6 text-left">
                    {safeQuiz.map((q, qIdx) => (
                      <div key={qIdx} className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                        <p className="font-bold text-lg mb-4">{qIdx + 1}. {q.question}</p>
                        <div className="grid gap-2">
                          {q.options.map((opt, oIdx) => (
                            <button 
                              key={oIdx} 
                              disabled={quizSubmitted}
                              onClick={() => {
                                const newAns = [...quizAnswers];
                                newAns[qIdx] = oIdx;
                                setQuizAnswers(newAns);
                              }}
                              className={`w-full text-left p-4 rounded-xl border-2 transition-all ${quizAnswers[qIdx] === oIdx ? 'border-[var(--theme-color)] bg-white shadow-md' : 'border-transparent bg-white/50'}`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  {!quizSubmitted ? (
                    <button 
                      onClick={() => setQuizSubmitted(true)}
                      disabled={quizAnswers.includes(-1)}
                      className="mt-10 px-10 py-4 bg-[var(--theme-color)] text-white rounded-2xl font-bold text-xl shadow-xl hover:-translate-y-1 transition-all disabled:opacity-50"
                    >
                      Calificar Curso
                    </button>
                  ) : (
                    <div className="mt-10 p-8 bg-white rounded-3xl border shadow-lg">
                      <p className="text-4xl font-bold mb-2">Puntuación: {quizAnswers.filter((a, i) => a === safeQuiz[i].correctIndex).length} / {safeQuiz.length}</p>
                      <button onClick={() => {setQuizSubmitted(false); setQuizAnswers(new Array(safeQuiz.length).fill(-1));}} className="text-[var(--theme-color)] font-bold flex items-center gap-2 mx-auto mt-4"><RefreshCw size={16} /> Reintentar</button>
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox / Gallery Overlay */}
      {selectedImageUrl && (
        <div 
          className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-xl flex items-center justify-center p-4 sm:p-10 animate-fade-in"
          onClick={() => setSelectedImageUrl(null)}
        >
          <button 
            className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
            onClick={(e) => { e.stopPropagation(); setSelectedImageUrl(null); }}
          >
            <X size={32} />
          </button>

          <div 
            className="relative max-w-5xl w-full group/lightbox"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={selectedImageUrl.url} 
              alt={selectedImageUrl.title} 
              className="w-full h-auto max-h-[85vh] object-contain rounded-2xl shadow-2xl border border-white/10"
            />
            
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/60 backdrop-blur-md px-6 py-3 rounded-full border border-white/20 opacity-0 group-hover/lightbox:opacity-100 transition-opacity">
               <span className="text-white text-sm font-medium whitespace-nowrap">{selectedImageUrl.title}</span>
               <div className="w-px h-4 bg-white/20" />
               <button 
                 onClick={() => downloadImage(selectedImageUrl.url, selectedImageUrl.title)}
                 className="text-white hover:text-indigo-400 transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-widest"
               >
                 <Download size={16} /> Descargar
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
