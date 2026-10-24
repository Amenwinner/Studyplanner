import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { Course, Quiz, QuizQuestion, QuizAttempt, DeepExplanationResult } from '../types';
import { COURSE_THEMES, getCourseIcon } from '../lib/courseTheme';
import { explainConcept, generateBatchQuestions } from '../lib/geminiClient';
import {
  HelpCircle,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  Award,
  ChevronRight,
  BookOpen,
  ArrowRight,
  Sliders,
  Check,
  AlertCircle,
  Lightbulb,
  Layers,
  Filter,
  Send,
  Loader2,
  BookMarked,
  TrendingUp,
  BrainCircuit,
  X
} from 'lucide-react';

interface QuizViewProps {
  course: Course;
  currentWeek: number;
  onGenerateQuiz: (count: number, difficulty: any) => Promise<void>;
  isGeneratingQuiz: boolean;
  quizAttempts: QuizAttempt[];
  onRecordQuizAttempt: (attempt: QuizAttempt) => void;
  onNavigateTab: (tab: any) => void;
  onUpdateCourseQuizzes?: (courseId: string, weekNumber: number, quizzes: Quiz[]) => void;
}

export const QuizView: React.FC<QuizViewProps> = ({
  course,
  currentWeek,
  onGenerateQuiz,
  isGeneratingQuiz,
  quizAttempts,
  onRecordQuizAttempt,
  onNavigateTab,
  onUpdateCourseQuizzes,
}) => {
  const theme = COURSE_THEMES[course.color] || COURSE_THEMES.blue;
  const Icon = getCourseIcon(course.iconName);
  const weekModule = course.weeks.find((w) => w.weekNumber === currentWeek);
  const quizzes = weekModule?.quizzes || [];

  // Question bank across all quizzes in this week
  const allWeekQuestions = useMemo(() => {
    const list: QuizQuestion[] = [];
    const seen = new Set<string>();
    quizzes.forEach((q) => {
      q.questions.forEach((item) => {
        if (!seen.has(item.question.trim().toLowerCase())) {
          seen.add(item.question.trim().toLowerCase());
          list.push(item);
        }
      });
    });
    return list;
  }, [quizzes]);

  // All distinct topics represented in this course
  const courseTopics = useMemo(() => {
    const set = new Set<string>();
    course.weeks.forEach((w) => {
      w.quizzes?.forEach((q) => {
        q.questions?.forEach((qu) => {
          if (qu.topic) set.add(qu.topic);
          else if (qu.conceptTested) set.add(qu.conceptTested);
        });
      });
    });
    return Array.from(set);
  }, [course]);

  // Quiz running state
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [revealedQuestions, setRevealedQuestions] = useState<Record<number, boolean>>({});
  const [isQuizFinished, setIsQuizFinished] = useState(false);
  const [quizTimerSeconds, setQuizTimerSeconds] = useState(0);
  const [activeQuestionSet, setActiveQuestionSet] = useState<QuizQuestion[]>([]);
  const [activeQuizTitle, setActiveQuizTitle] = useState('');

  // Mode filters
  const [quizMode, setQuizMode] = useState<'allTopics' | 'specificTopic' | 'standard'>('allTopics');
  const [selectedTopicFilter, setSelectedTopicFilter] = useState<string>('all');
  const [selectedQuestionLimit, setSelectedQuestionLimit] = useState<number>(20);

  // Batch Generation State (reaching 60+ questions)
  const [isBatchGenerating, setIsBatchGenerating] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number; message: string } | null>(null);

  // Deep Explanation Modal State ("Where I don't understand")
  const [explainingQuestion, setExplainingQuestion] = useState<QuizQuestion | null>(null);
  const [deepExplanation, setDeepExplanation] = useState<DeepExplanationResult | null>(null);
  const [isLoadingExplanation, setIsLoadingExplanation] = useState(false);
  const [studentConfusionQuery, setStudentConfusionQuery] = useState('');
  const [showCheckAnswer, setShowCheckAnswer] = useState(false);

  // Question Timer
  useEffect(() => {
    let interval: any = null;
    if (isQuizActive && !isQuizFinished) {
      interval = setInterval(() => {
        setQuizTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isQuizActive, isQuizFinished]);

  // Start Quiz Handler
  const handleStartExam = (questions: QuizQuestion[], title: string) => {
    setActiveQuestionSet(questions);
    setActiveQuizTitle(title);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setRevealedQuestions({});
    setIsQuizFinished(false);
    setQuizTimerSeconds(0);
    setIsQuizActive(true);
  };

  const handleLaunchComprehensiveAllTopics = () => {
    // Collect questions across all topics from course
    let pool = [...allWeekQuestions];
    if (pool.length === 0) {
      // Gather across all weeks if current week is empty
      course.weeks.forEach((w) => {
        w.quizzes?.forEach((q) => pool.push(...q.questions));
      });
    }

    if (selectedTopicFilter !== 'all') {
      pool = pool.filter((q) => q.topic === selectedTopicFilter || q.conceptTested === selectedTopicFilter);
    }

    // Shuffle and slice to selected limit
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    const finalSet = shuffled.slice(0, selectedQuestionLimit);

    handleStartExam(
      finalSet.length > 0 ? finalSet : pool,
      `${course.code} Comprehensive Exam (${finalSet.length} Questions across ${courseTopics.length || 1} Topics)`
    );
  };

  const handleSelectOption = (optionIndex: number) => {
    if (revealedQuestions[currentQuestionIndex]) return;

    setUserAnswers((prev) => ({ ...prev, [currentQuestionIndex]: optionIndex }));
    setRevealedQuestions((prev) => ({ ...prev, [currentQuestionIndex]: true }));
  };

  const handleFinishQuiz = () => {
    setIsQuizFinished(true);

    let correctCount = 0;
    const topicBreakdown: Record<string, { correct: number; total: number }> = {};

    const answerDetails = activeQuestionSet.map((q, idx) => {
      const selected = userAnswers[idx];
      const isCorrect = selected === q.correctAnswerIndex;
      if (isCorrect) correctCount++;

      const topicName = q.topic || q.conceptTested || 'General Coursework';
      if (!topicBreakdown[topicName]) {
        topicBreakdown[topicName] = { correct: 0, total: 0 };
      }
      topicBreakdown[topicName].total += 1;
      if (isCorrect) topicBreakdown[topicName].correct += 1;

      return {
        questionId: q.id,
        selectedOption: selected ?? -1,
        isCorrect,
      };
    });

    const percentage = Math.round((correctCount / (activeQuestionSet.length || 1)) * 100);

    if (percentage >= 80) {
      try {
        confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 } });
      } catch (e) {}
    }

    const newAttempt: QuizAttempt = {
      id: `attempt-${Date.now()}`,
      courseId: course.id,
      weekNumber: currentWeek,
      quizTitle: activeQuizTitle || `${course.code} Quiz`,
      date: new Date().toISOString(),
      score: correctCount,
      totalQuestions: activeQuestionSet.length,
      percentage,
      timeSpentSeconds: quizTimerSeconds,
      topicBreakdown,
      answers: answerDetails,
    };

    onRecordQuizAttempt(newAttempt);
  };

  // Open "I don't understand - Explain Deeper" Drawer
  const handleOpenDeepExplanation = async (question: QuizQuestion, customQuery?: string) => {
    setExplainingQuestion(question);
    setIsLoadingExplanation(true);
    setDeepExplanation(null);
    setShowCheckAnswer(false);
    if (!customQuery) setStudentConfusionQuery('');

    const selectedIdx = userAnswers[activeQuestionSet.findIndex((q) => q.id === question.id)];
    const selectedAnswerText = selectedIdx !== undefined ? question.options[selectedIdx] : undefined;

    try {
      const result = await explainConcept({
        courseName: course.name,
        topicTitle: question.topic || question.conceptTested || weekModule?.topicTitle || 'Lecture Topic',
        questionText: question.question,
        selectedAnswer: selectedAnswerText,
        correctAnswer: question.options[question.correctAnswerIndex],
        initialExplanation: question.explanation,
        studentQuery: customQuery || undefined,
      });
      setDeepExplanation(result);
    } catch (err: any) {
      console.error(err);
      // Fallback
      setDeepExplanation({
        corePrinciple: `In ${course.name}, this concept balances theoretical models against practical real-world application.`,
        stepByStepBreakdown: [
          'Step 1: Identify the baseline variables given in the question.',
          'Step 2: Apply the governing formula or rule from the lecture slides.',
          'Step 3: Test boundary assumptions to eliminate misleading distractors.'
        ],
        realWorldAnalogy: 'Think of this like managing a retail inventory or balance sheet: when one variable shifts, secondary feedback effects occur.',
        whyTheAnswerIsCorrect: `The correct option is "${question.options[question.correctAnswerIndex]}" because it accurately reflects the verified mechanism.`,
        whyDistractorsAreMisleading: 'The other choices present common student mistakes such as reversing cause-and-effect or confusing short-term changes with long-term equilibrium.',
        examMemoryRule: 'Always write down the baseline definition before performing calculations on exams.',
      });
    } finally {
      setIsLoadingExplanation(false);
    }
  };

  // Batch Generation: Build up to 60+ Questions
  const handleBatchGenerate60 = async () => {
    const slideContent = weekModule?.slidesRaw || '';
    if (!slideContent.trim()) {
      return;
    }

    setIsBatchGenerating(true);
    setBatchProgress({ current: allWeekQuestions.length, total: 60, message: 'Initiating 60-question bank synthesis...' });

    try {
      const batchesNeeded = Math.ceil(Math.max(1, (60 - allWeekQuestions.length) / 12));
      let accumulatedQuestions: QuizQuestion[] = [...allWeekQuestions];

      for (let b = 1; b <= Math.min(batchesNeeded, 5); b++) {
        setBatchProgress({
          current: accumulatedQuestions.length,
          total: 60,
          message: `Generating Batch #${b}: Synthesizing questions on definitions, calculations, and exam traps...`,
        });

        const batchRes = await generateBatchQuestions({
          courseName: course.name,
          weekNumber: currentWeek,
          topicTitle: weekModule?.topicTitle || `Week ${currentWeek} Material`,
          slideContent,
          batchNumber: b,
          batchCount: 12,
        });

        if (batchRes.questions && batchRes.questions.length > 0) {
          accumulatedQuestions = [...accumulatedQuestions, ...batchRes.questions];
        }
      }

      // Update course's quizzes
      const updatedQuiz: Quiz = {
        id: `quiz-bank-60-${Date.now()}`,
        title: `${course.code} Week ${currentWeek}: Comprehensive 60+ Question Bank`,
        weekNumber: currentWeek,
        difficulty: 'Balanced',
        questions: accumulatedQuestions,
        createdAt: new Date().toISOString(),
      };

      if (onUpdateCourseQuizzes) {
        onUpdateCourseQuizzes(course.id, currentWeek, [updatedQuiz, ...quizzes]);
      }

      setBatchProgress(null);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsBatchGenerating(false);
    }
  };

  const currentQ = activeQuestionSet[currentQuestionIndex];
  const isCurrentRevealed = revealedQuestions[currentQuestionIndex];
  const selectedCurrentOption = userAnswers[currentQuestionIndex];

  return (
    <div className="space-y-6 pb-12">
      {/* Header bar */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${theme.badge} border shadow-sm`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base text-slate-900 dark:text-white">
                  {course.code} &bull; Week {currentWeek} Question Bank
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  {allWeekQuestions.length} Questions Ready
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Target: Over 60 slide-generated questions with deep AI explanations & multi-topic quizzes.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {allWeekQuestions.length < 60 && (
              <button
                onClick={handleBatchGenerate60}
                disabled={isBatchGenerating || !weekModule?.slidesRaw?.trim()}
                className="px-3.5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all"
              >
                {isBatchGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>{isBatchGenerating ? 'Synthesizing 60+ Qs...' : '⚡ Generate to 60+ Questions'}</span>
              </button>
            )}

            <button
              onClick={handleLaunchComprehensiveAllTopics}
              disabled={allWeekQuestions.length === 0}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all"
            >
              <BrainCircuit className="w-4 h-4" />
              <span>🎯 Quiz on Every Topic</span>
            </button>
          </div>
        </div>

        {/* Batch Generation Progress Indicator */}
        {batchProgress && (
          <div className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl border border-indigo-100 dark:border-indigo-900/60 text-xs">
            <div className="flex justify-between font-semibold text-indigo-900 dark:text-indigo-200 mb-1">
              <span>{batchProgress.message}</span>
              <span>{batchProgress.current} / {batchProgress.total} Questions</span>
            </div>
            <div className="w-full bg-indigo-200 dark:bg-indigo-900 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (batchProgress.current / batchProgress.total) * 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Main Quiz Stage */}
      {isQuizActive && !isQuizFinished && currentQ ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          {/* Top Progress & Navigation Bar */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between gap-4 bg-slate-50/70 dark:bg-slate-850">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-xs uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Question {currentQuestionIndex + 1} of {activeQuestionSet.length}
              </span>
              {(currentQ.topic || currentQ.conceptTested) && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  Topic: {currentQ.topic || currentQ.conceptTested}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300 font-mono font-semibold">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-500" />
                <span>
                  {Math.floor(quizTimerSeconds / 60)}:
                  {(quizTimerSeconds % 60).toString().padStart(2, '0')}
                </span>
              </div>
              <button
                onClick={() => setIsQuizActive(false)}
                className="text-slate-400 hover:text-rose-500 font-sans text-xs underline"
              >
                Exit Quiz
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 dark:bg-slate-700 h-1">
            <div
              className="bg-indigo-600 h-1 transition-all duration-300"
              style={{
                width: `${((currentQuestionIndex + 1) / activeQuestionSet.length) * 100}%`,
              }}
            />
          </div>

          {/* Question & Options */}
          <div className="p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-relaxed">
                {currentQ.question}
              </h2>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {currentQ.options.map((option, optIdx) => {
                const isSelected = selectedCurrentOption === optIdx;
                const isCorrect = currentQ.correctAnswerIndex === optIdx;

                let optionStyle =
                  'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 hover:border-indigo-400 hover:bg-indigo-50/30 text-slate-800 dark:text-slate-200';

                if (isCurrentRevealed) {
                  if (isCorrect) {
                    optionStyle =
                      'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-semibold ring-1 ring-emerald-500';
                  } else if (isSelected && !isCorrect) {
                    optionStyle =
                      'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-900 dark:text-rose-200 line-through opacity-80';
                  } else {
                    optionStyle =
                      'bg-slate-50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-700 text-slate-400 opacity-60';
                  }
                }

                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectOption(optIdx)}
                    disabled={isCurrentRevealed}
                    className={`w-full p-4 rounded-xl border text-left flex items-start gap-3 transition-all text-sm leading-relaxed ${optionStyle}`}
                  >
                    <span
                      className={`w-6 h-6 rounded-lg font-bold flex items-center justify-center shrink-0 text-xs mt-0.5 border ${
                        isCurrentRevealed && isCorrect
                          ? 'bg-emerald-600 text-white border-transparent'
                          : isCurrentRevealed && isSelected && !isCorrect
                          ? 'bg-rose-600 text-white border-transparent'
                          : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    <span className="flex-1">{option}</span>
                    {isCurrentRevealed && isCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    )}
                    {isCurrentRevealed && isSelected && !isCorrect && (
                      <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation & Deep Tutor Trigger */}
            {isCurrentRevealed && (
              <div
                className={`p-4 rounded-xl border text-xs leading-relaxed transition-all animate-fadeIn ${
                  selectedCurrentOption === currentQ.correctAnswerIndex
                    ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                    : 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2 font-bold flex-wrap gap-2">
                  <span className="flex items-center gap-1.5">
                    {selectedCurrentOption === currentQ.correctAnswerIndex ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Correct! Well reasoned.</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-rose-600" />
                        <span>Incorrect Choice</span>
                      </>
                    )}
                  </span>

                  {/* "I don't understand - Explain Deeper" Button */}
                  <button
                    onClick={() => handleOpenDeepExplanation(currentQ)}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <Lightbulb className="w-3.5 h-3.5 text-amber-300" />
                    <span>💡 I Don't Understand - Explain Deeper</span>
                  </button>
                </div>

                <p className="text-slate-700 dark:text-slate-300 mb-1.5">
                  {currentQ.explanation}
                </p>

                {currentQ.slideReference && (
                  <span className="text-[11px] opacity-75 font-mono">
                    Slide Reference: {currentQ.slideReference}
                  </span>
                )}
              </div>
            )}

            {/* Bottom Navigator */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
              <button
                disabled={currentQuestionIndex === 0}
                onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Previous
              </button>

              {currentQuestionIndex < activeQuestionSet.length - 1 ? (
                <button
                  disabled={!isCurrentRevealed}
                  onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <span>Next Question</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  disabled={!isCurrentRevealed}
                  onClick={handleFinishQuiz}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Award className="w-4 h-4" />
                  <span>Submit Exam & View Mastery</span>
                </button>
              )}
            </div>
          </div>
        </div>
      ) : isQuizFinished ? (
        /* Results & Topic Mastery Screen */
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="max-w-xl mx-auto text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-600 to-sky-500 text-white flex items-center justify-center mx-auto shadow-xl shadow-indigo-500/25 mb-4">
              <Award className="w-10 h-10" />
            </div>

            {(() => {
              const correct = activeQuestionSet.filter(
                (q, idx) => userAnswers[idx] === q.correctAnswerIndex
              ).length;
              const pct = Math.round((correct / activeQuestionSet.length) * 100);
              const grade =
                pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 70 ? 'B' : pct >= 60 ? 'C' : 'Needs Review';

              return (
                <>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 mb-2 inline-block">
                    Grade: {grade} &bull; {pct}% Overall Score
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-2">
                    {correct} of {activeQuestionSet.length} Correct
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                    Time taken: {Math.floor(quizTimerSeconds / 60)}m {quizTimerSeconds % 60}s.
                  </p>
                </>
              );
            })()}

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => handleStartExam(activeQuestionSet, activeQuizTitle)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retake Exam</span>
              </button>

              <button
                onClick={() => onNavigateTab('reports')}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs flex items-center gap-1.5"
              >
                <span>View Weekly Report</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Topic-by-Topic Mastery Breakdown */}
          {(() => {
            const topicScores: Record<string, { correct: number; total: number }> = {};
            activeQuestionSet.forEach((q, idx) => {
              const t = q.topic || q.conceptTested || 'General';
              if (!topicScores[t]) topicScores[t] = { correct: 0, total: 0 };
              topicScores[t].total += 1;
              if (userAnswers[idx] === q.correctAnswerIndex) {
                topicScores[t].correct += 1;
              }
            });

            return (
              <div className="pt-6 border-t border-slate-100 dark:border-slate-700 max-w-3xl mx-auto">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <BrainCircuit className="w-4 h-4 text-indigo-500" />
                      <span>Topic-by-Topic Mastery Breakdown</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      Evaluates your performance on every tested topic from this course.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {Object.entries(topicScores).map(([topicName, stats]) => {
                    const pct = Math.round((stats.correct / stats.total) * 100);
                    return (
                      <div
                        key={topicName}
                        className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-750 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex-1">
                          <div className="flex items-center justify-between font-bold mb-1">
                            <span className="text-slate-900 dark:text-white">{topicName}</span>
                            <span
                              className={
                                pct >= 80 ? 'text-emerald-600 font-bold' : pct >= 60 ? 'text-amber-600' : 'text-rose-600'
                              }
                            >
                              {stats.correct} / {stats.total} ({pct}%)
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-1.5 rounded-full ${
                                pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>

                        {pct < 80 && (
                          <button
                            onClick={() => {
                              const topicQs = activeQuestionSet.filter(
                                (q) => (q.topic || q.conceptTested) === topicName
                              );
                              handleStartExam(topicQs, `Drill: ${topicName}`);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold text-[11px] shrink-0 border border-amber-200 dark:border-amber-800"
                          >
                            Drill This Topic
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* Question-by-Question Review with Explanation Trigger */}
          <div className="text-left pt-6 border-t border-slate-100 dark:border-slate-700 space-y-4 max-w-3xl mx-auto">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Question Review & Deep Explanations
            </h3>
            {activeQuestionSet.map((q, idx) => {
              const selected = userAnswers[idx];
              const isCorrect = selected === q.correctAnswerIndex;

              return (
                <div
                  key={q.id}
                  className={`p-4 rounded-xl border text-xs leading-relaxed ${
                    isCorrect
                      ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
                      : 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2 font-semibold">
                    <span className="text-slate-900 dark:text-white">
                      {idx + 1}. {q.question}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] shrink-0 font-bold ${
                        isCorrect
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200'
                      }`}
                    >
                      {isCorrect ? 'Correct' : 'Incorrect'}
                    </span>
                  </div>

                  <p className="text-slate-600 dark:text-slate-400 mb-1">
                    <strong className="text-slate-800 dark:text-slate-200">Correct Answer:</strong>{' '}
                    {q.options[q.correctAnswerIndex]}
                  </p>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] mb-2">
                    {q.explanation}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
                    <span className="text-[10px] text-slate-400 font-mono">
                      Topic: {q.topic || q.conceptTested}
                    </span>
                    <button
                      onClick={() => handleOpenDeepExplanation(q)}
                      className="px-2.5 py-1 rounded bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-[11px] flex items-center gap-1"
                    >
                      <Lightbulb className="w-3 h-3 text-amber-500" />
                      <span>Deep Explanation</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Quiz Selection & Question Bank Launchpad */
        <div className="space-y-6">
          {/* Question Bank Overview & Custom Exam Configurator */}
          <div className="bg-gradient-to-r from-indigo-50/70 via-white to-blue-50/60 dark:from-slate-800 dark:via-slate-800 dark:to-indigo-950/30 rounded-2xl border border-indigo-200 dark:border-indigo-800 p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <BrainCircuit className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <span>Configure Multi-Topic Exam / Quiz on Every Topic</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  You have <strong className="text-indigo-600 dark:text-indigo-400">{allWeekQuestions.length} questions</strong> in the bank across{' '}
                  <strong className="text-slate-800 dark:text-slate-200">{courseTopics.length || 1} topics</strong>.
                </p>
              </div>

              {allWeekQuestions.length < 60 && (
                <button
                  onClick={handleBatchGenerate60}
                  disabled={isBatchGenerating || !weekModule?.slidesRaw?.trim()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Batch Generate to 60+ Questions</span>
                </button>
              )}
            </div>

            {/* Exam Options Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs mb-6">
              {/* Question count */}
              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                  Number of Exam Questions
                </label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[10, 20, 30, Math.min(60, allWeekQuestions.length || 60)].map((cnt) => (
                    <button
                      key={cnt}
                      onClick={() => setSelectedQuestionLimit(cnt)}
                      className={`px-3 py-1.5 rounded-lg font-bold border transition-all ${
                        selectedQuestionLimit === cnt
                          ? 'bg-indigo-600 text-white border-transparent'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {cnt === 60 || (cnt === allWeekQuestions.length && cnt > 30) ? 'Full Bank' : `${cnt} Qs`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Topic Filter */}
              <div className="md:col-span-2">
                <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                  Filter by Topic (or "Every Topic" to quiz across all coursework)
                </label>
                <select
                  value={selectedTopicFilter}
                  onChange={(e) => setSelectedTopicFilter(e.target.value)}
                  className="w-full text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">🎯 Every Topic in Course (Comprehensive Multi-Topic Coverage)</option>
                  {courseTopics.map((top) => (
                    <option key={top} value={top}>
                      Topic: {top}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleLaunchComprehensiveAllTopics}
              disabled={allWeekQuestions.length === 0}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 disabled:opacity-50 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 transition-all"
            >
              <BrainCircuit className="w-4 h-4" />
              <span>Launch {selectedQuestionLimit}-Question Exam across {selectedTopicFilter === 'all' ? 'Every Topic' : selectedTopicFilter}</span>
            </button>
          </div>

          {/* Topics Breakdown Badges */}
          {courseTopics.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-3">
                Covered Coursework Topics ({courseTopics.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {courseTopics.map((top) => {
                  const qCount = allWeekQuestions.filter((q) => (q.topic || q.conceptTested) === top).length;
                  return (
                    <button
                      key={top}
                      onClick={() => {
                        setSelectedTopicFilter(top);
                        const topicQs = allWeekQuestions.filter((q) => (q.topic || q.conceptTested) === top);
                        if (topicQs.length > 0) {
                          handleStartExam(topicQs, `${course.code}: ${top} Drill`);
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-indigo-950 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors"
                    >
                      <span>{top}</span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold">
                        {qCount} Qs
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Individual Weekly Quizzes */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
              Slide Quiz Sets for Week {currentWeek}
            </h4>

            {quizzes.map((quiz, idx) => (
              <div
                key={quiz.id}
                className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm flex items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {quiz.title}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                      {quiz.difficulty}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {quiz.questions.length} Questions &bull; Created on {new Date(quiz.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <button
                  onClick={() => handleStartExam(quiz.questions, quiz.title)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shrink-0"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Start Quiz</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Deep Explanation Modal / Drawer */}
      {explainingQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 max-w-2xl w-full p-6 text-slate-900 dark:text-white my-8 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
                  <Lightbulb className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Deep Concept Explanation</h3>
                  <p className="text-xs text-slate-500">
                    {course.code} &bull; {explainingQuestion.topic || explainingQuestion.conceptTested}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setExplainingQuestion(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs">
              {/* Target Question */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-750">
                <span className="font-bold text-[10px] uppercase tracking-wider text-slate-400 block mb-1">
                  Question Under Review:
                </span>
                <p className="font-bold text-sm text-slate-900 dark:text-white mb-2">
                  {explainingQuestion.question}
                </p>
                <p className="text-emerald-700 dark:text-emerald-400 font-semibold">
                  Correct Answer: {explainingQuestion.options[explainingQuestion.correctAnswerIndex]}
                </p>
              </div>

              {isLoadingExplanation ? (
                <div className="py-12 text-center space-y-3">
                  <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
                  <p className="text-xs text-slate-500 font-medium">
                    Synthesizing first-principles explanation and business analogy...
                  </p>
                </div>
              ) : deepExplanation ? (
                <div className="space-y-4">
                  {/* Core Principle */}
                  <div className="p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900">
                    <h4 className="font-bold text-indigo-950 dark:text-indigo-200 text-xs mb-1 flex items-center gap-1.5">
                      <BrainCircuit className="w-4 h-4 text-indigo-600" />
                      <span>Core Intuition from First Principles</span>
                    </h4>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs">
                      {deepExplanation.corePrinciple}
                    </p>
                  </div>

                  {/* Step-by-Step Breakdown */}
                  {deepExplanation.stepByStepBreakdown && (
                    <div className="p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700">
                      <h4 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
                        <BookMarked className="w-4 h-4 text-blue-500" />
                        <span>Step-by-Step Logical Progression</span>
                      </h4>
                      <ol className="space-y-2 list-decimal list-inside text-slate-700 dark:text-slate-300">
                        {deepExplanation.stepByStepBreakdown.map((step, idx) => (
                          <li key={idx} className="leading-relaxed">
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {/* Real World Analogy */}
                  {deepExplanation.realWorldAnalogy && (
                    <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900">
                      <h4 className="font-bold text-amber-900 dark:text-amber-200 mb-1 flex items-center gap-1.5">
                        <Lightbulb className="w-4 h-4 text-amber-600" />
                        <span>Real-World Business Analogy</span>
                      </h4>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed italic">
                        "{deepExplanation.realWorldAnalogy}"
                      </p>
                    </div>
                  )}

                  {/* Why Option is Right vs Why Distractors are Wrong */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
                      <h5 className="font-bold text-emerald-800 dark:text-emerald-300 mb-1">
                        Why It's Correct:
                      </h5>
                      <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                        {deepExplanation.whyTheAnswerIsCorrect}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800">
                      <h5 className="font-bold text-rose-800 dark:text-rose-300 mb-1">
                        Common Distractor Traps:
                      </h5>
                      <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                        {deepExplanation.whyDistractorsAreMisleading}
                      </p>
                    </div>
                  </div>

                  {/* Exam Memory Rule */}
                  {deepExplanation.examMemoryRule && (
                    <div className="p-3 rounded-lg bg-indigo-600 text-white font-semibold text-xs flex items-center gap-2 shadow-sm">
                      <Check className="w-4 h-4 shrink-0 text-amber-300" />
                      <span>Exam Takeaway: {deepExplanation.examMemoryRule}</span>
                    </div>
                  )}

                  {/* Check Question */}
                  {deepExplanation.checkQuestion && (
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700">
                      <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                        Quick Concept Check:
                      </span>
                      <p className="text-slate-600 dark:text-slate-400 mb-2">
                        {deepExplanation.checkQuestion.question}
                      </p>
                      {showCheckAnswer ? (
                        <p className="text-emerald-600 dark:text-emerald-400 font-bold text-xs bg-emerald-50 dark:bg-emerald-950/40 p-2 rounded">
                          Answer: {deepExplanation.checkQuestion.answer}
                        </p>
                      ) : (
                        <button
                          onClick={() => setShowCheckAnswer(true)}
                          className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          Reveal Answer
                        </button>
                      )}
                    </div>
                  )}

                  {/* Ask Tutor a Clarification */}
                  <div className="pt-2">
                    <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Still confused? Ask the AI Tutor a specific clarification:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={studentConfusionQuery}
                        onChange={(e) => setStudentConfusionQuery(e.target.value)}
                        placeholder="e.g. But why does the multiplier drop if tax rate increases?"
                        className="flex-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-2"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && studentConfusionQuery.trim()) {
                            handleOpenDeepExplanation(explainingQuestion, studentConfusionQuery);
                          }
                        }}
                      />
                      <button
                        onClick={() => handleOpenDeepExplanation(explainingQuestion, studentConfusionQuery)}
                        disabled={!studentConfusionQuery.trim()}
                        className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Ask</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex justify-end">
              <button
                onClick={() => setExplainingQuestion(null)}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs"
              >
                I Understand Now &bull; Return to Quiz
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
