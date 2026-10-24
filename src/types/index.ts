export type CourseColor = 'blue' | 'emerald' | 'amber' | 'violet' | 'rose' | 'cyan' | 'orange';

export interface DefinitionItem {
  term: string;
  definition: string;
  importance: 'high' | 'medium';
}

export interface FormulaItem {
  name: string;
  formulaOrRule: string;
  explanation: string;
}

export interface TopicSummary {
  title: string;
  executiveSummary: string;
  keyTakeaways: string[];
  coreDefinitions: DefinitionItem[];
  formulasOrTheorems: FormulaItem[];
  examWatchouts: string[];
  cheatSheetBullets: string[];
  generatedAt?: string;
}

export interface DeepExplanationResult {
  corePrinciple: string;
  stepByStepBreakdown: string[];
  realWorldAnalogy: string;
  whyTheAnswerIsCorrect: string;
  whyDistractorsAreMisleading: string;
  examMemoryRule: string;
  checkQuestion?: {
    question: string;
    answer: string;
  };
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  slideReference?: string;
  conceptTested?: string;
  difficulty?: 'Foundational' | 'Application' | 'Exam-Level' | string;
  topic?: string;
}

export interface QuizAttempt {
  id: string;
  courseId: string;
  weekNumber: number;
  quizTitle: string;
  date: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  timeSpentSeconds: number;
  topicBreakdown?: Record<string, { correct: number; total: number }>;
  answers: {
    questionId: string;
    selectedOption: number;
    isCorrect: boolean;
  }[];
}

export interface Quiz {
  id: string;
  title: string;
  weekNumber: number;
  difficulty: 'Foundational' | 'Balanced' | 'Exam-Level';
  questions: QuizQuestion[];
  createdAt: string;
}

export interface Flashcard {
  id: string;
  courseId: string;
  weekNumber: number;
  front: string;
  back: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  box: number; // 1 to 5 Leitner box
  nextReviewDate: string;
  reviewCount: number;
  isStarred?: boolean;
}

export interface WeeklyModule {
  weekNumber: number;
  topicTitle: string;
  slidesRaw: string;
  slidesCount?: number;
  summary?: TopicSummary;
  quizzes: Quiz[];
  flashcards: Flashcard[];
  studyMinutes: number;
  lastStudiedDate?: string;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  department: string;
  color: CourseColor;
  iconName: string;
  professor: string;
  targetWeeklyHours: number;
  weeks: WeeklyModule[];
}

export interface WeeklyInsightReport {
  overallScoreGrade: string;
  weeklyHeadline: string;
  summary: string;
  strongestCourses: string[];
  atRiskCourses: {
    courseName: string;
    reason: string;
    actionableNextStep: string;
  }[];
  recommendedStudySplit: {
    courseName: string;
    recommendedHours: number;
    priorityFocusTopic: string;
  }[];
  weeklyStudyTip: string;
  generatedAt: string;
}

export type ActiveTab = 'dashboard' | 'slides' | 'summary' | 'quiz' | 'flashcards' | 'reports';
