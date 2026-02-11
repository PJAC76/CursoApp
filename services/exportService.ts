
import jsPDF from 'jspdf';
import pptxgen from 'pptxgenjs';
import { Course } from '../types';

export const exportToPDF = async (course: Course) => {
  const doc = new jsPDF();
  const margin = 20;
  let y = 20;

  // Title
  doc.setFontSize(22);
  doc.setTextColor(course.primaryColor);
  doc.text(course.title, margin, y);
  y += 10;

  // Subtitle
  doc.setFontSize(14);
  doc.setTextColor(100, 100, 100);
  doc.text(course.subtitle, margin, y);
  y += 20;

  course.modules.forEach((module, index) => {
    if (y > 250) {
      doc.addPage();
      y = 20;
    }

    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text(`${index + 1}. ${module.title}`, margin, y);
    y += 10;

    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    const splitContent = doc.splitTextToSize(module.content, 170);
    doc.text(splitContent, margin, y);
    y += (splitContent.length * 5) + 15;
  });

  doc.save(`${course.title.replace(/\s+/g, '_')}_Estrategia.pdf`);
};

export const exportToPPTX = async (course: Course) => {
  const pptx = new pptxgen();
  
  // Title Slide
  const titleSlide = pptx.addSlide();
  titleSlide.background = { fill: course.primaryColor };
  titleSlide.addText(course.title, { 
    x: 0.5, y: 1.5, w: '90%', h: 1, 
    fontSize: 44, color: 'FFFFFF', bold: true, align: 'center' 
  });
  titleSlide.addText(course.subtitle, { 
    x: 0.5, y: 2.5, w: '90%', h: 1, 
    fontSize: 24, color: 'FFFFFF', align: 'center' 
  });

  // Modules Slides
  course.modules.forEach((module) => {
    const slide = pptx.addSlide();
    slide.addText(module.title, { 
      x: 0.5, y: 0.5, w: '90%', h: 0.8, 
      fontSize: 32, color: course.primaryColor.replace('#', ''), bold: true 
    });
    
    slide.addText(module.content.substring(0, 500) + '...', { 
      x: 0.5, y: 1.5, w: '90%', h: 3.5, 
      fontSize: 16, color: '333333', align: 'left', valign: 'top' 
    });
  });

  pptx.writeFile({ fileName: `${course.title.replace(/\s+/g, '_')}_Presentacion.pptx` });
};
