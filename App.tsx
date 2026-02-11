
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { TopicInput } from './components/TopicInput';
import { PillarSelection } from './components/PillarSelection';
import { VariationSelection } from './components/VariationSelection';
import { CourseView } from './components/CourseView';
import { AppStep, Pillar, Variation, Course, SearchSource, CourseModule, QuizQuestion } from './types';
import { generatePillars, generateVariations, generateCourse, generateModuleImage } from './services/geminiService';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.INPUT_TOPIC);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [mainTopic, setMainTopic] = useState('');
  const [pillars, setPillars] = useState<Pillar[]>([]);
  const [searchSources, setSearchSources] = useState<SearchSource[]>([]);
  const [selectedPillar, setSelectedPillar] = useState<Pillar | null>(null);
  const [variations, setVariations] = useState<Variation[]>([]);
  const [course, setCourse] = useState<Course | null>(null);

  // Simulated progress logic for AI waiting periods
  useEffect(() => {
    let interval: number;
    if (loading) {
      setProgress(5); // Start immediately
      interval = window.setInterval(() => {
        setProgress(prev => {
          if (prev < 40) return prev + 3;      // Early stage: fast
          if (prev < 70) return prev + 1.5;    // Mid stage: medium
          if (prev < 90) return prev + 0.5;    // Late stage: slow
          if (prev < 98) return prev + 0.1;    // Finalizing: very slow
          return prev;
        });
      }, 300);
    } else {
      if (progress > 0) {
        setProgress(100);
        const timer = setTimeout(() => setProgress(0), 800);
        return () => clearTimeout(timer);
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [loading]);

  const handleTopicSubmit = async (topic: string) => {
    setLoading(true);
    setError(null);
    try {
      setMainTopic(topic);
      const { pillars, sources } = await generatePillars(topic);
      if (!pillars || pillars.length === 0) {
        throw new Error("No se pudieron generar pilares estratégicos.");
      }
      setPillars(pillars);
      setSearchSources(sources);
      setStep(AppStep.SELECT_PILLAR);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error generando los pilares. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handlePillarSelect = async (pillar: Pillar) => {
    setLoading(true);
    setError(null);
    try {
      setSelectedPillar(pillar);
      const data = await generateVariations(pillar.title, mainTopic);
      setVariations(data.variations);
      setStep(AppStep.SELECT_VARIATION);
    } catch (err) {
      setError("Error generando las variaciones.");
    } finally {
      setLoading(false);
    }
  };

  const handleVariationsSelect = async (selectedVariations: Variation[], moduleCount: number) => {
    setLoading(true);
    setError(null);
    try {
      if (selectedPillar) {
        let combinedModules: CourseModule[] = [];
        let combinedQuizzes: QuizQuestion[] = [];
        let finalCourse: Course | null = null;

        for (const variation of selectedVariations) {
          const part = await generateCourse(variation.title, selectedPillar.title, moduleCount);
          combinedModules = [...combinedModules, ...part.modules];
          combinedQuizzes = [...combinedQuizzes, ...part.quiz];
          
          if (!finalCourse) {
            finalCourse = { 
              ...part, 
              title: selectedVariations.length > 1 ? `Estrategia Integral: ${selectedPillar.title}` : part.title,
              subtitle: selectedVariations.length > 1 ? `Formación fusionada basada en ${selectedVariations.length} enfoques estratégicos.` : part.subtitle
            };
          }
        }

        if (finalCourse) {
          finalCourse.modules = combinedModules;
          finalCourse.quiz = combinedQuizzes;
          setCourse(finalCourse);
          setStep(AppStep.VIEW_COURSE);

          // Image generation doesn't block the UI as much but contributes to overall state
          const updatedModules = [...combinedModules];
          for (let i = 0; i < updatedModules.length; i++) {
            try {
              const imgUrl = await generateModuleImage(updatedModules[i].imageKeyword, finalCourse.title);
              updatedModules[i] = { ...updatedModules[i], imageUrl: imgUrl };
              setCourse(prev => prev ? { ...prev, modules: [...updatedModules] } : null);
            } catch (e) {
              console.warn("Failed to generate image for module", i);
            }
          }
        }
      }
    } catch (err) {
      setError("Error construyendo la formación integral.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout 
      onRestart={() => setStep(AppStep.INPUT_TOPIC)} 
      isLoading={loading}
      progress={progress}
    >
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg flex items-center justify-between animate-bounce">
          <div className="flex flex-col">
            <p className="font-bold">Error de Proceso</p>
            <p className="text-sm">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-sm font-bold ml-4 p-2 hover:bg-red-100 rounded-full transition-colors">✕</button>
        </div>
      )}

      {step === AppStep.INPUT_TOPIC && <TopicInput onSubmit={handleTopicSubmit} isLoading={loading} />}
      {step === AppStep.SELECT_PILLAR && (
        <PillarSelection 
          topic={mainTopic} 
          pillars={pillars} 
          onSelect={handlePillarSelect} 
          isLoading={loading}
          sources={searchSources}
        />
      )}
      {step === AppStep.SELECT_VARIATION && selectedPillar && (
        <VariationSelection 
          pillar={selectedPillar} 
          variations={variations} 
          onGenerateSelected={handleVariationsSelect}
          onBack={() => setStep(AppStep.SELECT_PILLAR)}
          isLoading={loading}
          sources={searchSources}
        />
      )}
      {step === AppStep.VIEW_COURSE && course && (
        <CourseView course={course} onBack={() => setStep(AppStep.SELECT_VARIATION)} />
      )}
    </Layout>
  );
};

export default App;
