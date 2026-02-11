export interface Pillar {
  title: string;
  description: string;
}

export interface SearchSource {
  title: string;
  uri: string;
}

export interface Variation {
  title: string;
  focus: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

export interface CourseModule {
  title: string;
  content: string; // Markdown supported
  imageKeyword: string;
}

export interface Course {
  title: string;
  subtitle: string;
  primaryColor: string; // Hex code
  modules: CourseModule[];
  quiz: QuizQuestion[];
}

export enum AppStep {
  INPUT_TOPIC = 0,
  SELECT_PILLAR = 1,
  SELECT_VARIATION = 2,
  VIEW_COURSE = 3,
}

// Responses from API
export interface PillarsResponse {
  pillars: Pillar[];
}

export interface VariationsResponse {
  variations: Variation[];
}