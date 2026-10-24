import { TopicSummary, QuizQuestion, Flashcard, WeeklyInsightReport } from '../types';

export async function generateTopicSummary(params: {
  courseName: string;
  weekNumber: number;
  topicTitle: string;
  slideContent: string;
}): Promise<TopicSummary> {
  const response = await fetch('/api/gemini/summarize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Server responded with ${response.status}`);
  }

  const data = await response.json();
  return {
    ...data,
    generatedAt: new Date().toISOString(),
  };
}

export async function generateQuizQuestions(params: {
  courseName: string;
  weekNumber: number;
  topicTitle: string;
  slideContent: string;
  numQuestions: number;
  difficulty: 'Foundational' | 'Balanced' | 'Exam-Level';
}): Promise<{ quizTitle: string; questions: QuizQuestion[] }> {
  const response = await fetch('/api/gemini/quiz', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Server responded with ${response.status}`);
  }

  return response.json();
}

export async function generateFlashcards(params: {
  courseName: string;
  weekNumber: number;
  topicTitle: string;
  slideContent: string;
  count: number;
}): Promise<{ flashcards: Flashcard[] }> {
  const response = await fetch('/api/gemini/flashcards', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Server responded with ${response.status}`);
  }

  return response.json();
}

export async function generateWeeklyReport(params: {
  weekNumber: number;
  coursesData: any[];
  recentQuizScores: any[];
  totalStudyMinutes: number;
}): Promise<WeeklyInsightReport> {
  const response = await fetch('/api/gemini/weekly-insights', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Server responded with ${response.status}`);
  }

  const data = await response.json();
  return {
    ...data,
    generatedAt: new Date().toISOString(),
  };
}

export async function explainConcept(params: {
  courseName: string;
  topicTitle: string;
  questionText: string;
  selectedAnswer?: string;
  correctAnswer: string;
  initialExplanation?: string;
  studentQuery?: string;
}) {
  const response = await fetch('/api/gemini/explain-concept', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Server responded with ${response.status}`);
  }

  return response.json();
}

export async function generateBatchQuestions(params: {
  courseName: string;
  weekNumber: number;
  topicTitle: string;
  slideContent: string;
  batchNumber: number;
  batchCount?: number;
  targetSubtopic?: string;
}): Promise<{ questions: QuizQuestion[] }> {
  const response = await fetch('/api/gemini/batch-quiz', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Server responded with ${response.status}`);
  }

  return response.json();
}
