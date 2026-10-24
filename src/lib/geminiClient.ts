import { TopicSummary, QuizQuestion, Flashcard, WeeklyInsightReport, DeepExplanationResult } from '../types';

// Helper to extract lines from slide content
function extractSlideLines(slideContent: string): string[] {
  return slideContent
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith('---'));
}

// Client-side fallback generators for static deployment (e.g. GitHub Pages)
function clientFallbackSummary(params: {
  courseName: string;
  weekNumber: number;
  topicTitle: string;
  slideContent: string;
}): TopicSummary {
  const lines = extractSlideLines(params.slideContent);
  const takeaways = lines.slice(0, 5).map((l) => l.replace(/^[-*•\d.]+\s*/, ''));
  
  return {
    title: params.topicTitle || `${params.courseName} - Week ${params.weekNumber}`,
    executiveSummary: `Structured academic overview for ${params.courseName} (Week ${params.weekNumber}: ${params.topicTitle}). Synthesized from lecture slide decks focusing on core principles, analytical models, and practical application.`,
    keyTakeaways: takeaways.length >= 3 ? takeaways : [
      `Master the core principles of ${params.topicTitle}.`,
      `Understand key quantitative and conceptual models presented in this module.`,
      `Apply theoretical frameworks to realistic business and examination case studies.`,
      `Review key formulas and variable dependencies.`,
      `Avoid common conceptual misconceptions during problem-solving.`
    ],
    coreDefinitions: [
      {
        term: params.topicTitle.split(/[,&]/)[0].trim() || 'Core Concept',
        definition: `Fundamental framework analyzed in ${params.courseName} Week ${params.weekNumber}.`,
        importance: 'high',
      },
      {
        term: 'Operational Application',
        definition: 'Practical implementation method used in industry scenarios.',
        importance: 'medium',
      },
      {
        term: 'Performance Levers',
        definition: 'Key quantitative and qualitative drivers of success.',
        importance: 'high',
      }
    ],
    formulasOrTheorems: [
      {
        name: 'Core Metric Relationship',
        formulaOrRule: 'Output = Function(Inputs, Efficiency Levers)',
        explanation: 'Governing relationship defined in lecture notes.',
      }
    ],
    examWatchouts: [
      `Confusing terminology across related subtopics in ${params.topicTitle}.`,
      'Misapplying quantitative formulas without verifying standard assumptions.',
      'Overlooking boundary conditions or edge-case scenarios.',
    ],
    cheatSheetBullets: [
      `Priority focus: High-frequency exam questions center on ${params.topicTitle}.`,
      'Always state assumptions before starting numerical calculations.',
      'Review slide diagrams and process flows thoroughly.',
    ],
    generatedAt: new Date().toISOString(),
  };
}

function clientFallbackQuiz(params: {
  courseName: string;
  weekNumber: number;
  topicTitle: string;
  slideContent: string;
  numQuestions: number;
  difficulty: 'Foundational' | 'Balanced' | 'Exam-Level';
}): { quizTitle: string; questions: QuizQuestion[] } {
  const lines = extractSlideLines(params.slideContent).filter((l) => l.length > 15);
  const count = Math.max(5, params.numQuestions || 10);
  const questions: QuizQuestion[] = [];

  for (let i = 0; i < count; i++) {
    const rawLine = lines[i % lines.length] || `${params.topicTitle} fundamental principle`;
    const cleaned = rawLine.replace(/^[-*•\d.]+\s*/, '');

    questions.push({
      id: `q-client-${Date.now()}-${i}`,
      question: `Regarding ${params.topicTitle}: Which statement best reflects the principle: "${cleaned.slice(0, 80)}..."?`,
      options: [
        `It represents the primary verified framework described in the lecture slides.`,
        `It is strictly an optional theoretical model with no industry relevance.`,
        `It applies only under zero-growth economic conditions.`,
        `It has been fully replaced by unstructured qualitative metrics.`
      ],
      correctAnswerIndex: 0,
      explanation: `As detailed in the lecture notes, this concept establishes essential foundations for ${params.courseName}.`,
      slideReference: `Slide ${((i % 8) + 1)}: ${params.topicTitle}`,
      conceptTested: params.topicTitle,
      topic: params.topicTitle,
      difficulty: params.difficulty || 'Balanced',
    });
  }

  return {
    quizTitle: `${params.courseName} - Week ${params.weekNumber} Practice Exam`,
    questions,
  };
}

function clientFallbackFlashcards(params: {
  courseId?: string;
  courseName: string;
  weekNumber: number;
  topicTitle: string;
  slideContent: string;
  count: number;
}): { flashcards: Flashcard[] } {
  const lines = extractSlideLines(params.slideContent).filter((l) => l.length > 10);
  const count = Math.max(5, params.count || 8);
  const flashcards: Flashcard[] = [];

  for (let i = 0; i < count; i++) {
    const line = lines[i % lines.length] || `Core Principle ${i + 1}`;
    const clean = line.replace(/^[-*•\d.]+\s*/, '');
    const parts = clean.split(/[:=-]/);
    const front = parts[0]?.trim() || `Concept ${i + 1}`;
    const back = parts.slice(1).join(' ').trim() || `Essential rule and application in ${params.courseName}.`;

    flashcards.push({
      id: `fc-client-${Date.now()}-${i}`,
      courseId: params.courseId || 'general',
      weekNumber: params.weekNumber,
      front: `What is the significance of: ${front}?`,
      back: back.length > 5 ? back : `${front} plays a central role in ${params.topicTitle}.`,
      category: i % 2 === 0 ? 'Concept' : 'Application',
      difficulty: 'Medium',
      box: 1,
      nextReviewDate: new Date().toISOString().split('T')[0],
      reviewCount: 0,
    });
  }

  return { flashcards };
}

export async function generateTopicSummary(params: {
  courseName: string;
  weekNumber: number;
  topicTitle: string;
  slideContent: string;
}): Promise<TopicSummary> {
  try {
    const response = await fetch('/api/gemini/summarize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (response.ok) {
      const data = await response.json();
      return {
        ...data,
        generatedAt: new Date().toISOString(),
      };
    }
  } catch (err) {
    console.warn('API unreachable, using client synthesis fallback:', err);
  }

  return clientFallbackSummary(params);
}

export async function generateQuizQuestions(params: {
  courseName: string;
  weekNumber: number;
  topicTitle: string;
  slideContent: string;
  numQuestions: number;
  difficulty: 'Foundational' | 'Balanced' | 'Exam-Level';
}): Promise<{ quizTitle: string; questions: QuizQuestion[] }> {
  try {
    const response = await fetch('/api/gemini/quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (response.ok) {
      return await response.json();
    }
  } catch (err) {
    console.warn('API unreachable, using client quiz generator fallback:', err);
  }

  return clientFallbackQuiz(params);
}

export async function generateFlashcards(params: {
  courseName: string;
  weekNumber: number;
  topicTitle: string;
  slideContent: string;
  count: number;
}): Promise<{ flashcards: Flashcard[] }> {
  try {
    const response = await fetch('/api/gemini/flashcards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (response.ok) {
      return await response.json();
    }
  } catch (err) {
    console.warn('API unreachable, using client flashcard generator fallback:', err);
  }

  return clientFallbackFlashcards(params);
}

export async function generateWeeklyReport(params: {
  weekNumber: number;
  coursesData: any[];
  recentQuizScores: any[];
  totalStudyMinutes: number;
}): Promise<WeeklyInsightReport> {
  try {
    const response = await fetch('/api/gemini/weekly-insights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (response.ok) {
      const data = await response.json();
      return {
        ...data,
        generatedAt: new Date().toISOString(),
      };
    }
  } catch (err) {
    console.warn('API unreachable, using client report analysis fallback:', err);
  }

  const courseNames = (params.coursesData || []).map((c) => c.name || c.code || 'Course');
  const strongCourses = params.coursesData
    .filter((c) => (c.quizzesTaken || 0) > 0)
    .map((c) => c.name || c.code);

  const atRisk = courseNames.slice(2, 4).map((name) => ({
    courseName: name,
    reason: 'Upload weekly slide decks to benchmark comprehension with an active-recall quiz.',
    actionableNextStep: `Paste or upload Week ${params.weekNumber} slides and generate a quick quiz.`,
  }));

  const recommendedSplit = courseNames.map((name) => ({
    courseName: name,
    recommendedHours: 3.5,
    priorityFocusTopic: `Week ${params.weekNumber} slides revision & active recall`,
  }));

  return {
    weeklyHeadline: `Weekly Study & Revision Summary (Week ${params.weekNumber})`,
    summary: `For Week ${params.weekNumber}, you logged ${Math.round(
      params.totalStudyMinutes / 60
    )} hours of active study across your course curriculum. Uploading your lecture slides enables precision quiz drills tailored to your professor's material.`,
    overallScoreGrade: strongCourses.length > 0 ? 'B+' : 'Pending',
    strongestCourses: strongCourses.length > 0 ? strongCourses : courseNames.slice(0, 2),
    atRiskCourses: atRisk,
    recommendedStudySplit: recommendedSplit,
    weeklyStudyTip: 'Spacing effect: Taking your slide quizzes 24-48 hours after reading slides produces significantly greater long-term retention than massed reading.',
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
}): Promise<DeepExplanationResult> {
  try {
    const response = await fetch('/api/gemini/explain-concept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (response.ok) {
      return await response.json();
    }
  } catch (err) {
    console.warn('API unreachable, using client concept tutor fallback:', err);
  }

  return {
    corePrinciple: `The question tests your core understanding of: "${params.correctAnswer}". In ${params.courseName}, this concept establishes how different variables interact under realistic business constraints.`,
    realWorldAnalogy: `Think of this like an airline managing seat inventory: efficiency isn't just about packing passengers; it's about optimizing margins, customer goodwill, and predictable long-term retention.`,
    stepByStepBreakdown: [
      `Identify the primary objective stated in the problem statement.`,
      `Recognize why "${params.correctAnswer}" satisfies the academic and quantitative criteria.`,
      `Eliminate distractor options that assume unrealistic market or economic conditions.`,
      `Verify the result against standard lecture definitions.`
    ],
    whyTheAnswerIsCorrect: `As detailed in the lecture slides, "${params.correctAnswer}" directly aligns with the governing framework established for ${params.courseName}.`,
    whyDistractorsAreMisleading: `Alternative choices either invert cause-and-effect or assume static, non-competitive market dynamics.`,
    examMemoryRule: `Always verify whether the question is asking for long-term sustainability or short-term transactional output.`,
    checkQuestion: {
      question: `If the core variable increases while other inputs remain constant, what happens to overall efficiency?`,
      answer: `It scales positively until diminishing marginal returns take effect.`
    }
  };
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
  try {
    const response = await fetch('/api/gemini/batch-quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (response.ok) {
      return await response.json();
    }
  } catch (err) {
    console.warn('API unreachable, using client batch question generator fallback:', err);
  }

  const generated = clientFallbackQuiz({
    courseName: params.courseName,
    weekNumber: params.weekNumber,
    topicTitle: params.targetSubtopic || params.topicTitle,
    slideContent: params.slideContent,
    numQuestions: params.batchCount || 10,
    difficulty: 'Balanced',
  });

  return { questions: generated.questions };
}
