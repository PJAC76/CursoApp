
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

  