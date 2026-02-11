import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Course, PillarsResponse, VariationsResponse, Pillar, SearchSource } from "../types";

const apiKey = process.env.API_KEY;

// Helper to get client (handling re-instantiation if needed, though strictly we can reuse if key is static)
const getAiClient = () => new GoogleGenAI({ apiKey });

// --- Schemas ---

// Note: pillarsSchema is not used in the function with googleSearch because schema + tools is restricted.
// But we keep the structure in mind for the prompt instructions.

const variationsSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    variations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          focus: { type: Type.STRING },
        },
        required: ["title", "focus"],
      },
    },
  },
  required: ["variations"],
};

const courseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    subtitle: { type: Type.STRING },
    primaryColor: { type: Type.STRING, description: "A hex color code matching the mood (e.g. #4F46E5)" },
    modules: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          content: { type: Type.STRING, description: "Educational content in markdown format. Approx 150 words." },
          imageKeyword: { type: Type.STRING, description: "A simple english keyword for unsplash/picsum search" },
        },
        required: ["title", "content", "imageKeyword"],
      },
    },
    quiz: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          options: { type: Type.ARRAY, items: { type: Type.STRING } },
          correctIndex: { type: Type.INTEGER },
        },
        required: ["question", "options", "correctIndex"],
      },
    },
  },
  required: ["title", "subtitle", "primaryColor", "modules", "quiz"],
};

// --- API Calls ---

export const generatePillars = async (topic: string): Promise<{ pillars: Pillar[], sources: SearchSource[] }> => {
  const ai = getAiClient();
  // We cannot use responseSchema/responseMimeType with tools.
  // We must instruct the model to return JSON in the prompt and parse it manually.
  const prompt = `Actúa como un estratega de contenido experto. Analiza el tema: "${topic}".
  Genera 10 "Temas Pilar" amplios y estratégicos que podrían servir para construir una marca o serie de cursos alrededor de este tema.
  Usa Google Search para asegurarte de que los pilares sean relevantes y actuales.
  
  FORMATO DE RESPUESTA REQUERIDO:
  Devuelve SOLAMENTE un objeto JSON válido con la siguiente estructura, sin texto antes ni después (ni markdown):
  {
    "pillars": [
      {
        "title": "Título del pilar",
        "description": "Descripción breve"
      }
    ]
  }`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }], // Grounding enabled
      // responseMimeType: "application/json", // REMOVED: Incompatible with tools
      // responseSchema: pillarsSchema, // REMOVED: Incompatible with tools
      systemInstruction: "Eres un mentor experto en educación online. Responde siempre en español. Tu salida debe ser JSON válido.",
    },
  });

  const text = response.text || "";
  
  // Clean up potential markdown formatting from the response
  let cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
  // Extract JSON object if there is extra text
  const firstBrace = cleanText.indexOf('{');
  const lastBrace = cleanText.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1) {
    cleanText = cleanText.substring(firstBrace, lastBrace + 1);
  }

  let pillarsData: PillarsResponse;
  try {
    pillarsData = JSON.parse(cleanText) as PillarsResponse;
  } catch (e) {
    console.error("Failed to parse pillars JSON:", cleanText);
    throw new Error("La IA no devolvió un formato válido. Por favor, intenta de nuevo.");
  }

  // Extract Grounding Sources
  const sources: SearchSource[] = [];
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  
  if (chunks) {
    const seenUris = new Set<string>();
    chunks.forEach(chunk => {
      if (chunk.web && chunk.web.uri && chunk.web.title) {
        if (!seenUris.has(chunk.web.uri)) {
          seenUris.add(chunk.web.uri);
          sources.push({
            title: chunk.web.title,
            uri: chunk.web.uri
          });
        }
      }
    });
  }

  return { pillars: pillarsData.pillars, sources };
};

export const generateVariations = async (pillarTitle: string, mainTopic: string): Promise<VariationsResponse> => {
  const ai = getAiClient();
  const prompt = `Para el tema pilar "${pillarTitle}" (dentro del tema principal "${mainTopic}"), genera 10 variaciones específicas de lecciones o ángulos únicos para un curso.
  Cada variación debe ser atractiva y resolver un problema específico.
  Devuelve la respuesta estrictamente en JSON.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: variationsSchema,
      systemInstruction: "Eres un creador de cursos creativo. Responde siempre en español.",
    },
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");
  return JSON.parse(text) as VariationsResponse;
};

export const generateCourse = async (variationTitle: string, pillarTitle: string): Promise<Course> => {
  const ai = getAiClient();
  const prompt = `Crea un mini-curso completo y detallado para la lección: "${variationTitle}" (Contexto: "${pillarTitle}").
  
  Requisitos:
  1. Estructura visual y atractiva.
  2. Define un título pegadizo y un subtítulo.
  3. Elige un color hex (#RRGGBB) que combine con la temática.
  4. Crea entre 4 y 5 módulos de contenido educativo de alta calidad. El contenido debe usar formato Markdown (negritas, listas, subtítulos) para ser legible.
  5. Asigna una palabra clave en INGLÉS para buscar una imagen representativa para cada módulo.
  6. Crea un quiz final con 3 preguntas tipo test para evaluar el aprendizaje.
  
  Devuelve la respuesta estrictamente en JSON.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: courseSchema,
      systemInstruction: "Eres un profesor experto y visual. Creas contenido educativo excelente. Responde siempre en español.",
    },
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");
  return JSON.parse(text) as Course;
};