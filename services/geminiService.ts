
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Course, PillarsResponse, VariationsResponse, Pillar, SearchSource } from "../types";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY_MISSING: Por favor, asegúrate de que la variable de entorno API_KEY esté configurada correctamente en el panel de control de Vercel.");
  }
  return new GoogleGenAI({ apiKey });
};

// --- Schemas ---

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
          imageKeyword: { type: Type.STRING, description: "A simple english keyword for image generation" },
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

// Helper for robust JSON parsing
const parseAIJSON = (text: string) => {
  try {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start !== -1 && end !== -1) {
      return JSON.parse(text.substring(start, end + 1));
    }
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse AI JSON", e, text);
    return null;
  }
};

// --- API Calls ---

export const generatePillars = async (topic: string): Promise<{ pillars: Pillar[], sources: SearchSource[] }> => {
  const ai = getAiClient();
  const prompt = `Actúa como un estratega de contenido experto. Analiza el tema: "${topic}".
  Genera 10 "Temas Pilar" amplios y estratégicos que podrían servir para construir una marca o serie de cursos alrededor de este tema.
  Usa Google Search para asegurarte de que los pilares sean relevantes y actuales.
  
  Devuelve un objeto JSON con esta estructura: {"pillars": [{"title": "...", "description": "..."}]}`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      systemInstruction: "Eres un mentor experto en educación online. Responde siempre en español. Tu salida principal DEBE ser un objeto JSON válido.",
    },
  });

  const text = response.text || "";
  const pillarsData = parseAIJSON(text) as PillarsResponse;
  
  const sources: SearchSource[] = [];
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  if (chunks) {
    const seenUris = new Set<string>();
    chunks.forEach(chunk => {
      if (chunk.web?.uri && chunk.web?.title && !seenUris.has(chunk.web.uri)) {
        seenUris.add(chunk.web.uri);
        sources.push({ title: chunk.web.title, uri: chunk.web.uri });
      }
    });
  }

  return { pillars: pillarsData?.pillars || [], sources };
};

export const generateVariations = async (pillarTitle: string, mainTopic: string): Promise<VariationsResponse> => {
  const ai = getAiClient();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Para el tema pilar "${pillarTitle}" (tema principal "${mainTopic}"), genera 10 variaciones de lecciones únicas.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: variationsSchema,
      systemInstruction: "Eres un creador de cursos creativo. Responde siempre en español.",
    },
  });
  const data = parseAIJSON(response.text || "{}") as VariationsResponse;
  return { variations: data?.variations || [] };
};

export const generateCourse = async (variationTitle: string, pillarTitle: string, numModules: number = 5): Promise<Course> => {
  const ai = getAiClient();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Crea un mini-curso detallado de exactamente ${numModules} módulos para: "${variationTitle}" (Contexto: "${pillarTitle}").`,
    config: {
      responseMimeType: "application/json",
      responseSchema: courseSchema,
      systemInstruction: `Eres un profesor experto. Creas exactamente ${numModules} módulos educativos excelentes en español con Markdown rico.`,
    },
  });
  const data = parseAIJSON(response.text || "{}") as Course;
  return {
    ...data,
    modules: data?.modules || [],
    quiz: data?.quiz || []
  };
};

export const generateModuleImage = async (keyword: string, courseTitle: string): Promise<string> => {
  const ai = getAiClient();
  const prompt = `A professional, high-quality 3D digital illustration or clean minimal photography about "${keyword}" related to "${courseTitle}". Professional lighting, educational style, vibrant but clean.`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: prompt }] },
    config: {
      imageConfig: { aspectRatio: "16:9" }
    },
  });

  for (const part of response.candidates?.[0]?.content.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return `https://picsum.photos/seed/${keyword}/800/450`; // Fallback
};
