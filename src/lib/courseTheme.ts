import { CourseColor } from '../types';
import {
  Code,
  Dna,
  Calculator,
  TrendingUp,
  FlaskConical,
  Brain,
  BarChart3,
  BookOpen,
  Atom,
  GraduationCap
} from 'lucide-react';

export const COURSE_THEMES: Record<CourseColor, {
  badge: string;
  activeTab: string;
  border: string;
  bgLight: string;
  pill: string;
  text: string;
  barColor: string;
  gradient: string;
}> = {
  blue: {
    badge: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800',
    activeTab: 'bg-blue-600 text-white shadow-sm',
    border: 'border-blue-300 dark:border-blue-700',
    bgLight: 'bg-blue-50/70 dark:bg-blue-950/20',
    pill: 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200',
    text: 'text-blue-600 dark:text-blue-400',
    barColor: '#2563eb',
    gradient: 'from-blue-600 to-indigo-600',
  },
  emerald: {
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800',
    activeTab: 'bg-emerald-600 text-white shadow-sm',
    border: 'border-emerald-300 dark:border-emerald-700',
    bgLight: 'bg-emerald-50/70 dark:bg-emerald-950/20',
    pill: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200',
    text: 'text-emerald-600 dark:text-emerald-400',
    barColor: '#059669',
    gradient: 'from-emerald-600 to-teal-600',
  },
  amber: {
    badge: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
    activeTab: 'bg-amber-600 text-white shadow-sm',
    border: 'border-amber-300 dark:border-amber-700',
    bgLight: 'bg-amber-50/70 dark:bg-amber-950/20',
    pill: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200',
    text: 'text-amber-600 dark:text-amber-400',
    barColor: '#d97706',
    gradient: 'from-amber-600 to-orange-600',
  },
  violet: {
    badge: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/50 dark:text-violet-300 dark:border-violet-800',
    activeTab: 'bg-violet-600 text-white shadow-sm',
    border: 'border-violet-300 dark:border-violet-700',
    bgLight: 'bg-violet-50/70 dark:bg-violet-950/20',
    pill: 'bg-violet-100 text-violet-800 dark:bg-violet-900/60 dark:text-violet-200',
    text: 'text-violet-600 dark:text-violet-400',
    barColor: '#7c3aed',
    gradient: 'from-violet-600 to-purple-700',
  },
  rose: {
    badge: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800',
    activeTab: 'bg-rose-600 text-white shadow-sm',
    border: 'border-rose-300 dark:border-rose-700',
    bgLight: 'bg-rose-50/70 dark:bg-rose-950/20',
    pill: 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200',
    text: 'text-rose-600 dark:text-rose-400',
    barColor: '#e11d48',
    gradient: 'from-rose-600 to-pink-600',
  },
  cyan: {
    badge: 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/50 dark:text-cyan-300 dark:border-cyan-800',
    activeTab: 'bg-cyan-600 text-white shadow-sm',
    border: 'border-cyan-300 dark:border-cyan-700',
    bgLight: 'bg-cyan-50/70 dark:bg-cyan-950/20',
    pill: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/60 dark:text-cyan-200',
    text: 'text-cyan-600 dark:text-cyan-400',
    barColor: '#0891b2',
    gradient: 'from-cyan-600 to-blue-600',
  },
  orange: {
    badge: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-800',
    activeTab: 'bg-orange-600 text-white shadow-sm',
    border: 'border-orange-300 dark:border-orange-700',
    bgLight: 'bg-orange-50/70 dark:bg-orange-950/20',
    pill: 'bg-orange-100 text-orange-800 dark:bg-orange-900/60 dark:text-orange-200',
    text: 'text-orange-600 dark:text-orange-400',
    barColor: '#ea580c',
    gradient: 'from-orange-600 to-amber-600',
  },
};

export function getCourseIcon(iconName: string) {
  switch (iconName.toLowerCase()) {
    case 'code':
      return Code;
    case 'dna':
      return Dna;
    case 'calculator':
      return Calculator;
    case 'trendingup':
    case 'trending-up':
      return TrendingUp;
    case 'flaskconical':
    case 'flask':
      return FlaskConical;
    case 'brain':
      return Brain;
    case 'barchart3':
    case 'chart':
      return BarChart3;
    case 'atom':
      return Atom;
    default:
      return BookOpen;
  }
}
