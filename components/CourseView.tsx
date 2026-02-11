import React, { useState, useEffect } from 'react';
import { Course } from '../types';
import { 
  ChevronLeft, 
  CheckCircle, 
  Book, 
  Award, 
  RefreshCw, 
  FileText, 
  Presentation, 
  Loader2, 
  Menu, 
  X,
  List,
  ExternalLink
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface CourseViewProps {
  course: Course;
  onBack: () => void;
}

export const CourseView: React.FC<CourseViewProps> = ({ course, onBack }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [quizAnswers, setQuizAnswers] = useState<number[]>(new Array(course.quiz.length).fill(-1));
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Dynamic style for the primary color
  const themeStyle = {
    '--theme-color': course.primaryColor || '#4F46E5',
  } as React.CSSProperties;

  const handleAnswerSelect = (questionIndex: number, optionIndex: number) => {
    if (quizSubmitted) return;
    const newAnswers = [...quizAnswers];
    newAnswers[questionIndex] = optionIndex;
    setQuizAnswers(newAnswers);
  };

  const calculateScore = () => {
    return quizAnswers.reduce((acc, answer, index) => {
      return answer === course.quiz[index].correctIndex ? acc + 1 : acc;
    }, 0);
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // Offset for fixed header
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
    // Close sidebar on mobile after clicking
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const stripMarkdown = (markdown: string): string => {
    return markdown
      .replace(/#+\s/g, '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/`{3}[\s\S]*?`{3}/g, '')
      .replace(/`/g, '')
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
      .replace(/^\s*-\s/gm, '• ');
  };

  const handleDownloadPDF = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      // @ts-ignore
      const jsPDFModule = await import('jspdf');
      const jsPDF = jsPDFModule.jsPDF || jsPDFModule.default;
      
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);

      doc.setFontSize(26);
      doc.setTextColor(course.primaryColor || '#000000');
      const titleLines = doc.splitTextToSize(course.title, contentWidth);
      doc.text(titleLines, margin, 50);

      doc.setFontSize(14);
      doc.setTextColor(100);
      const subLines = doc.splitTextToSize(course.subtitle, contentWidth);
      doc.text(subLines, margin, 50 + (titleLines.length * 12) + 10);

      course.modules.forEach((module, index) => {
        doc.addPage();
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text(`Curso: ${course.title} - Módulo ${index + 1}`, margin, 15);
        doc.setFontSize(20);
        doc.setTextColor(course.primaryColor || '#000000');
        doc.text(module.title, margin, 30, { maxWidth: contentWidth });
        doc.setFontSize(12);
        doc.setTextColor(0);
        const cleanContent = stripMarkdown(module.content);
        const splitText = doc.splitTextToSize(cleanContent, contentWidth);
        doc.text(splitText, margin, 50);
      });

      doc.save(`Curso_${course.title.substring(0, 15).replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error("Error PDF:", error);
      alert("Error al generar PDF.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadPPT = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      // @ts-ignore
      const PptxGenJSModule = await import('pptxgenjs');
      const PptxGenJS = PptxGenJSModule.default || PptxGenJSModule;

      const pres = new PptxGenJS();
      const themeColor = course.primaryColor?.replace('#', '') || '4F46E5';
      
      const titleSlide = pres.addSlide();
      titleSlide.addText(course.title, { x: 0.5, y: '35%', w: '90%', fontSize: 36, bold: true, color: themeColor, align: 'center' });
      titleSlide.addText(course.subtitle, { x: 1, y: '55%', w: '80%', fontSize: 18, color: '64748B', align: 'center' });

      course.modules.forEach((module, index) => {
        const slide = pres.addSlide();
        slide.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 1, fill: { color: themeColor } });
        slide.addText(`Módulo ${index + 1}: ${module.title}`, { x: 0.3, y: 0.2, w: '90%', fontSize: 24, bold: true, color: 'FFFFFF' });
        const cleanContent = stripMarkdown(module.content);
        slide.addText(cleanContent, { x: 0.5, y: 1.2, w: '90%', h: '75%', fontSize: 14, color: '334155', valign: 'top', lineSpacing: 22 });
      });

      pres.writeFile({ fileName: `Curso_${course.title.substring(0, 15).replace(/\s+/g, '_')}.pptx` });
    } catch (error) {
      console.error("Error PPT:", error);
      alert("Error al generar PowerPoint.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="animate-fade-in relative flex flex-col md:flex-row gap-6 items-start" style={themeStyle}>
      
      {/* Sidebar - Table of Contents */}
      <aside 
        className={`fixed md:sticky top-20 left-0 z-40 w-72 h-[calc(100vh-6rem)] transition-all duration-300 transform 
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:w-0 md:opacity-0 md:-ml-6'}
          bg-white border-r border-slate-200 md:border-none md:bg-transparent rounded-r-2xl md:rounded-none shadow-2xl md:shadow-none p-4 overflow-y-auto`}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <List size={16} /> Índice del Curso
          </h3>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-2 text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <nav className="space-y-2">
          {course.modules.map((module, idx) => (
            <button
              key={idx}
              onClick={() => scrollToSection(`module-${idx}`)}
              className="w-full text-left p-3 rounded-xl hover:bg-white hover:shadow-md border border-transparent hover:border-slate-100 transition-all group flex gap-3"
            >
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold flex items-center justify-center group-hover:bg-[var(--theme-color)] group-hover:text-white transition-colors">
                {idx + 1}
              </span>
              <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 line-clamp-2">
                {module.title}
              </span>
            </button>
          ))}
          <button
            onClick={() => scrollToSection('quiz-section')}
            className="w-full text-left p-3 rounded-xl hover:bg-white hover:shadow-md border border-transparent hover:border-slate-100 transition-all group flex gap-3 mt-4"
          >
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-colors">
              <Award size={12} />
            </span>
            <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900">
              Evaluación Final
            </span>
          </button>
        </nav>

        <div className="mt-8 pt-6 border-t border-slate-100 space-y-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Recursos del Alumno</p>
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="w-full flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
            >
              {isDownloading ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
              Descargar PDF
            </button>
            <button
              onClick={handleDownloadPPT}
              disabled={isDownloading}
              className="w-full flex items-center gap-2 px-4 py-2 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
            >
              {isDownloading ? <Loader2 size={14} className="animate-spin" /> : <Presentation size={14} />}
              Descargar Slides
            </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 w-full transition-all duration-300">
        
        {/* Top Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-slate-500 hover:text-[var(--theme-color)] transition-colors font-medium group"
          >
            <div className="p-1 rounded-full bg-white border border-slate-200 group-hover:border-[var(--theme-color)] transition-colors">
              <ChevronLeft size={16} />
            </div>
            Volver
          </button>

          {!isSidebarOpen && (
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full text-slate-600 hover:border-[var(--theme-color)] hover:text-[var(--theme-color)] transition-all shadow-sm font-medium"
            >
              <Menu size={18} /> Ver Índice
            </button>
          )}
        </div>

        {/* Course Card */}
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden mb-8">
          {/* Header Banner */}
          <div className="relative h-64 overflow-hidden" style={{ backgroundColor: course.primaryColor }}>
             <div className="absolute inset-0 bg-black/20" />
             <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
             <div className="absolute bottom-0 left-0 right-0 p-10 text-white">
               <div className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest mb-4">
                 Estrategia Generada por IA
               </div>
               <h1 className="text-4xl md:text-5xl font-black mb-3 leading-tight">{course.title}</h1>
               <p className="text-xl text-white/90 font-light max-w-2xl">{course.subtitle}</p>
             </div>
          </div>

          {/* Modules List */}
          <div className="p-4 md:p-10 space-y-16">
            {course.modules.map((module, idx) => (
              <section 
                key={idx} 
                id={`module-${idx}`} 
                className="scroll-mt-24 animate-fade-in group"
              >
                <div className="grid md:grid-cols-3 gap-10">
                  <div className="md:col-span-2 space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-[var(--theme-color)] font-black text-xl border border-slate-100">
                        {idx + 1}
                      </div>
                      <h2 className="text-3xl font-bold text-slate-900 group-hover:text-[var(--theme-color)] transition-colors">
                        {module.title}
                      </h2>
                    </div>

                    <div className="prose prose-slate prose-lg max-w-none text-slate-600">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h1: ({node, ...props}) => <h3 className="text-2xl font-bold text-slate-900 mt-8 mb-4 border-b border-slate-100 pb-2" {...props} />,
                          h2: ({node, ...props}) => <h4 className="text-xl font-bold text-slate-800 mt-6 mb-3" {...props} />,
                          h3: ({node, ...props}) => <h5 className="text-lg font-bold text-slate-800 mt-4 mb-2" {...props} />,
                          ul: ({node, ...props}) => <ul className="list-disc pl-6 space-y-2 my-4" {...props} />,
                          ol: ({node, ...props}) => <ol className="list-decimal pl-6 space-y-2 my-4" {...props} />,
                          li: ({node, ...props}) => <li className="text-slate-600 leading-relaxed" {...props} />,
                          p: ({node, ...props}) => <p className="leading-relaxed mb-4 text-slate-600" {...props} />,
                          strong: ({node, ...props}) => <strong className="font-bold text-slate-900" {...props} />,
                          em: ({node, ...props}) => <em className="italic text-slate-700" {...props} />,
                          blockquote: ({node, ...props}) => (
                            <blockquote className="border-l-4 border-[var(--theme-color)] pl-4 py-1 my-6 italic bg-slate-50/50 rounded-r-lg text-slate-700" {...props} />
                          ),
                          code: ({node, inline, className, children, ...props}: any) => {
                            return inline ? (
                              <code className="px-1.5 py-0.5 rounded bg-slate-100 text-pink-600 font-mono text-sm" {...props}>
                                {children}
                              </code>
                            ) : (
                              <div className="relative group/code my-6">
                                <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 overflow-x-auto font-mono text-sm leading-relaxed shadow-lg">
                                  <code {...props}>{children}</code>
                                </pre>
                              </div>
                            );
                          },
                          table: ({node, ...props}) => (
                            <div className="overflow-x-auto my-6 rounded-xl border border-slate-200 shadow-sm">
                              <table className="min-w-full divide-y divide-slate-200" {...props} />
                            </div>
                          ),
                          thead: ({node, ...props}) => <thead className="bg-slate-50" {...props} />,
                          th: ({node, ...props}) => <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider" {...props} />,
                          td: ({node, ...props}) => <td className="px-6 py-4 whitespace-normal text-sm text-slate-600 border-t border-slate-100" {...props} />,
                          a: ({node, ...props}) => (
                            <a 
                              className="text-[var(--theme-color)] font-medium underline decoration-2 underline-offset-2 hover:opacity-80 transition-opacity inline-flex items-center gap-1" 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              {...props} 
                            />
                          ),
                          hr: ({node, ...props}) => <hr className="my-8 border-slate-200" {...props} />,
                        }}
                      >
                        {module.content}
                      </ReactMarkdown>
                    </div>
                  </div>

                  <div className="md:col-span-1 space-y-6">
                    <div className="rounded-3xl overflow-hidden shadow-xl border border-slate-100 bg-slate-50 transform group-hover:scale-[1.02] transition-transform duration-500 sticky top-24">
                      <img 
                        src={`https://picsum.photos/seed/${module.imageKeyword}${idx}/600/450`} 
                        alt={module.title} 
                        className="w-full aspect-[4/3] object-cover"
                      />
                      <div className="p-4 bg-white/80 backdrop-blur-sm border-t border-slate-100">
                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Concepto Visual</span>
                         <p className="text-slate-600 text-sm font-medium italic">"{module.imageKeyword}"</p>
                      </div>
                    </div>
                  </div>
                </div>
                {idx < course.modules.length - 1 && (
                  <div className="mt-16 h-px bg-slate-100 w-full" />
                )}
              </section>
            ))}

            {/* Quiz Section */}
            <section id="quiz-section" className="scroll-mt-24 pt-10 border-t-4 border-slate-50">
              <div className="max-w-3xl mx-auto">
                <div className="text-center mb-12">
                  <div className="inline-flex p-5 rounded-3xl bg-amber-50 text-amber-500 mb-6 shadow-sm border border-amber-100">
                    <Award size={48} />
                  </div>
                  <h2 className="text-4xl font-black text-slate-900 mb-4">Evaluación de Conocimientos</h2>
                  <p className="text-lg text-slate-500">Mide tu comprensión de los conceptos clave presentados.</p>
                </div>

                <div className="space-y-10">
                  {course.quiz.map((q, qIndex) => (
                    <div key={qIndex} className="bg-slate-50/50 rounded-[2rem] p-8 border border-slate-200 shadow-sm">
                      <h3 className="text-xl font-bold text-slate-900 mb-6 flex gap-3">
                        <span className="text-slate-300 font-black">{qIndex + 1}.</span>
                        {q.question}
                      </h3>
                      <div className="grid gap-3">
                        {q.options.map((option, oIndex) => {
                          const isSelected = quizAnswers[qIndex] === oIndex;
                          const isCorrect = q.correctIndex === oIndex;
                          const showResult = quizSubmitted;
                          
                          let btnClass = "border-slate-200 hover:border-[var(--theme-color)] hover:bg-white bg-white/50";
                          if (showResult) {
                            if (isCorrect) btnClass = "bg-green-100 border-green-500 text-green-800 ring-2 ring-green-500/20";
                            else if (isSelected && !isCorrect) btnClass = "bg-red-50 border-red-300 text-red-800 opacity-80";
                            else btnClass = "border-slate-200 opacity-40";
                          } else {
                            if (isSelected) btnClass = "border-[var(--theme-color)] bg-[var(--theme-color)] text-white shadow-lg shadow-indigo-500/20";
                          }

                          return (
                            <button
                              key={oIndex}
                              onClick={() => handleAnswerSelect(qIndex, oIndex)}
                              disabled={quizSubmitted}
                              className={`w-full text-left p-5 rounded-2xl border-2 transition-all font-semibold flex items-center justify-between group ${btnClass}`}
                            >
                              <span>{option}</span>
                              {showResult && isCorrect && <CheckCircle size={22} className="text-green-600" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-16 flex flex-col items-center">
                  {!quizSubmitted ? (
                    <button
                      onClick={() => setQuizSubmitted(true)}
                      disabled={quizAnswers.includes(-1)}
                      className="px-12 py-5 bg-[var(--theme-color)] text-white rounded-2xl font-black text-xl shadow-2xl hover:shadow-indigo-500/40 hover:-translate-y-1 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                    >
                      Calificar Examen
                    </button>
                  ) : (
                    <div className="text-center p-10 bg-white rounded-[2rem] border border-slate-100 shadow-xl w-full">
                      <p className="text-5xl font-black text-slate-900 mb-4">
                        {calculateScore()} <span className="text-slate-300">/</span> {course.quiz.length}
                      </p>
                      <p className="text-lg text-slate-500 mb-8 font-medium">
                        {calculateScore() === course.quiz.length 
                          ? "¡Excelente! Has dominado este curso por completo. 🏆" 
                          : "Buen intento. Revisa los módulos para perfeccionar tus conocimientos. 📚"}
                      </p>
                      <button
                        onClick={() => {
                          setQuizSubmitted(false);
                          setQuizAnswers(new Array(course.quiz.length).fill(-1));
                        }}
                        className="text-[var(--theme-color)] font-bold hover:underline flex items-center gap-2 mx-auto py-2 px-4 rounded-xl hover:bg-slate-50 transition-colors"
                      >
                        <RefreshCw size={18} /> Reintentar Evaluación
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};
