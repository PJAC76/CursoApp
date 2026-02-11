
import React, { useState } from 'react';
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
  const [error, setError] = useState<string | null>(null);

  const [mainTopic, setMainTopic] = useState('');
  const [pillars, setPillars] = useState<Pillar[]>([]);
  const [searchSources, setSearchSources] = useState<SearchSource[]>([]);
  const [selectedPillar, setSelectedPillar] = useState<Pillar | null>(null);
  const [variations, setVariations] = useState<Variation[]>([]);
  const [course, setCourse] = useState<Course | null>(null);

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

        // Generar cada parte de la formación secuencialmente para mantener la calidad
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

          // Generación asíncrona de todas las imágenes
          const updatedModules = [...combinedModules];
          for (let i = 0; i < updatedModules.length; i++) {
            try {
              const imgUrl = await generateModuleImage(updatedModules[i].imageKeyword, finalCourse.title);
              updatedModules[i] = { ...updatedModules[i], imageUrl: imgUrl };
              // Actualización parcial reactiva para ver el progreso real
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
    <Layout onRestart={() => setStep(AppStep.INPUT_TOPIC)}>
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
