import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { TopicInput } from './components/TopicInput';
import { PillarSelection } from './components/PillarSelection';
import { VariationSelection } from './components/VariationSelection';
import { CourseView } from './components/CourseView';
import { AppStep, Pillar, Variation, Course, SearchSource } from './types';
import { generatePillars, generateVariations, generateCourse } from './services/geminiService';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.INPUT_TOPIC);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data State
  const [mainTopic, setMainTopic] = useState('');
  const [pillars, setPillars] = useState<Pillar[]>([]);
  const [searchSources, setSearchSources] = useState<SearchSource[]>([]);
  const [selectedPillar, setSelectedPillar] = useState<Pillar | null>(null);
  const [variations, setVariations] = useState<Variation[]>([]);
  const [selectedVariation, setSelectedVariation] = useState<Variation | null>(null);
  const [course, setCourse] = useState<Course | null>(null);

  // --- Handlers ---

  const handleRestart = () => {
    if (window.confirm("¿Empezar de nuevo? Se perderá el progreso actual.")) {
      setStep(AppStep.INPUT_TOPIC);
      setMainTopic('');
      setPillars([]);
      setSearchSources([]);
      setSelectedPillar(null);
      setVariations([]);
      setCourse(null);
      setError(null);
    }
  };

  const handleTopicSubmit = async (topic: string) => {
    setLoading(true);
    setError(null);
    try {
      setMainTopic(topic);
      const { pillars, sources } = await generatePillars(topic);
      setPillars(pillars);
      setSearchSources(sources);
      setStep(AppStep.SELECT_PILLAR);
    } catch (err) {
      setError("Hubo un error generando los pilares. Inténtalo de nuevo.");
      console.error(err);
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
      setError("Error generando las variaciones. Inténtalo de nuevo.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVariationSelect = async (variation: Variation) => {
    setLoading(true);
    setError(null);
    try {
      setSelectedVariation(variation);
      if (selectedPillar) {
        const generatedCourse = await generateCourse(variation.title, selectedPillar.title);
        setCourse(generatedCourse);
        setStep(AppStep.VIEW_COURSE);
      }
    } catch (err) {
      setError("Error construyendo el curso. La IA puede estar ocupada.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToPillars = () => {
    setStep(AppStep.SELECT_PILLAR);
    setSelectedPillar(null);
    setVariations([]);
  };

  const handleBackToVariations = () => {
    setStep(AppStep.SELECT_VARIATION);
    setCourse(null); // Clear course to free memory/reset view
    // We retain selectedPillar and variations so user can pick another
  };

  return (
    <Layout onRestart={() => setStep(AppStep.INPUT_TOPIC)}>
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg flex items-center justify-between">
          <p>{error}</p>
          <button onClick={() => setError(null)} className="text-sm font-bold hover:underline">Cerrar</button>
        </div>
      )}

      {step === AppStep.INPUT_TOPIC && (
        <TopicInput onSubmit={handleTopicSubmit} isLoading={loading} />
      )}

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
          onSelect={handleVariationSelect}
          onBack={handleBackToPillars}
          isLoading={loading}
        />
      )}

      {step === AppStep.VIEW_COURSE && course && (
        <CourseView 
          course={course}
          onBack={handleBackToVariations}
        />
      )}
    </Layout>
  );
};

export default App;