import React, { useState, useEffect } from 'react';
import { Course, Quiz, QuizAttempt, WeeklyInsightReport, ActiveTab, Flashcard } from './types';
import {
  loadCourses,
  saveCourses,
  loadQuizAttempts,
  saveQuizAttempts,
  loadWeeklyReports,
  saveWeeklyReports,
  loadCurrentWeek,
  saveCurrentWeek,
} from './lib/storage';
import {
  generateTopicSummary,
  generateQuizQuestions,
  generateFlashcards,
  generateWeeklyReport,
} from './lib/geminiClient';
import { Navbar } from './components/Navbar';
import { CourseSelectorBar } from './components/CourseSelectorBar';
import { DashboardView } from './components/DashboardView';
import { SlidesView } from './components/SlidesView';
import { SummaryView } from './components/SummaryView';
import { QuizView } from './components/QuizView';
import { FlashcardsView } from './components/FlashcardsView';
import { WeeklyReportView } from './components/WeeklyReportView';
import { StudyTimerModal } from './components/StudyTimerModal';
import { CourseManagerModal } from './components/CourseManagerModal';
import { Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  const [courses, setCourses] = useState<Course[]>(() => loadCourses());
  const [activeCourseId, setActiveCourseId] = useState<string>(() => {
    const loaded = loadCourses();
    return loaded[0]?.id || 'cs-301';
  });
  const [currentWeek, setCurrentWeek] = useState<number>(() => loadCurrentWeek());
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>(() => loadQuizAttempts());
  const [weeklyReports, setWeeklyReports] = useState<Record<number, WeeklyInsightReport>>(() =>
    loadWeeklyReports()
  );

  // Timer state
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [isCourseManagerOpen, setIsCourseManagerOpen] = useState(false);
  const [timerSecondsRemaining, setTimerSecondsRemaining] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Loading states
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [isGeneratingCards, setIsGeneratingCards] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(
    null
  );

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Timer ticking
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSecondsRemaining((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            showToast('Pomodoro session complete! Great work.');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Sync to persistence
  useEffect(() => {
    saveCourses(courses);
  }, [courses]);

  useEffect(() => {
    saveQuizAttempts(quizAttempts);
  }, [quizAttempts]);

  useEffect(() => {
    saveWeeklyReports(weeklyReports);
  }, [weeklyReports]);

  useEffect(() => {
    saveCurrentWeek(currentWeek);
  }, [currentWeek]);

  const activeCourse = courses.find((c) => c.id === activeCourseId) || courses[0];

  // Refresh all state from local storage (used after backup import or reset)
  const handleRefreshData = () => {
    const loadedCourses = loadCourses();
    setCourses(loadedCourses);
    if (!loadedCourses.some((c) => c.id === activeCourseId)) {
      setActiveCourseId(loadedCourses[0]?.id || 'cs-301');
    }
    setCurrentWeek(loadCurrentWeek());
    setQuizAttempts(loadQuizAttempts());
    setWeeklyReports(loadWeeklyReports());
    showToast('Semester study data updated.');
  };

  // Update slide text and topic title
  const handleUpdateSlides = (
    courseId: string,
    weekNumber: number,
    slidesRaw: string,
    topicTitle?: string
  ) => {
    const updated = courses.map((course) => {
      if (course.id !== courseId) return course;

      let weekFound = false;
      const updatedWeeks = course.weeks.map((wm) => {
        if (wm.weekNumber === weekNumber) {
          weekFound = true;
          return {
            ...wm,
            slidesRaw,
            topicTitle: topicTitle || wm.topicTitle,
            slidesCount: slidesRaw.split(/(?:^|\n)(?=---\s*Slide|\nSlide\s+\d+:)/i).length,
          };
        }
        return wm;
      });

      if (!weekFound) {
        updatedWeeks.push({
          weekNumber,
          topicTitle: topicTitle || `Week ${weekNumber} Topic`,
          slidesRaw,
          slidesCount: 1,
          studyMinutes: 0,
          quizzes: [],
          flashcards: [],
        });
      }

      return {
        ...course,
        weeks: updatedWeeks,
      };
    });

    setCourses(updated);
    showToast(`Saved slides for ${activeCourse?.code} (Week ${weekNumber})`);
  };

  // Log study time
  const handleLogStudyTime = (courseId: string, weekNumber: number, minutes: number) => {
    const updated = courses.map((course) => {
      if (course.id !== courseId) return course;

      let weekFound = false;
      const updatedWeeks = course.weeks.map((wm) => {
        if (wm.weekNumber === weekNumber) {
          weekFound = true;
          return {
            ...wm,
            studyMinutes: (wm.studyMinutes || 0) + minutes,
            lastStudiedDate: new Date().toISOString(),
          };
        }
        return wm;
      });

      if (!weekFound) {
        updatedWeeks.push({
          weekNumber,
          topicTitle: `Week ${weekNumber} Topic`,
          slidesRaw: '',
          studyMinutes: minutes,
          lastStudiedDate: new Date().toISOString(),
          quizzes: [],
          flashcards: [],
        });
      }

      return { ...course, weeks: updatedWeeks };
    });

    setCourses(updated);
    showToast(`Logged ${minutes}m of study time to ${courseId.toUpperCase()}`);
  };

  // Generate Topic Summary via Gemini
  const handleGenerateSummary = async () => {
    const weekModule = activeCourse?.weeks.find((w) => w.weekNumber === currentWeek);
    const slideContent = weekModule?.slidesRaw || '';

    if (!slideContent.trim()) {
      showToast('Please add slides for this week before summarizing.', 'error');
      return;
    }

    setIsGeneratingSummary(true);
    try {
      const summary = await generateTopicSummary({
        courseName: activeCourse.name,
        weekNumber: currentWeek,
        topicTitle: weekModule?.topicTitle || `Week ${currentWeek} Topic`,
        slideContent,
      });

      // Save summary into course
      const updated = courses.map((course) => {
        if (course.id !== activeCourse.id) return course;
        return {
          ...course,
          weeks: course.weeks.map((wm) =>
            wm.weekNumber === currentWeek ? { ...wm, summary } : wm
          ),
        };
      });

      setCourses(updated);
      setActiveTab('summary');
      showToast('AI topic summary synthesized from slides!');
    } catch (e: any) {
      console.error(e);
      showToast(e.message || 'Failed to generate summary', 'error');
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  // Generate Quiz via Gemini
  const handleGenerateQuiz = async (
    numQuestions: number,
    difficulty: 'Foundational' | 'Balanced' | 'Exam-Level'
  ) => {
    const weekModule = activeCourse?.weeks.find((w) => w.weekNumber === currentWeek);
    const slideContent = weekModule?.slidesRaw || '';

    if (!slideContent.trim()) {
      showToast('Please add slides for this week before generating a quiz.', 'error');
      return;
    }

    setIsGeneratingQuiz(true);
    try {
      const result = await generateQuizQuestions({
        courseName: activeCourse.name,
        weekNumber: currentWeek,
        topicTitle: weekModule?.topicTitle || `Week ${currentWeek} Topic`,
        slideContent,
        numQuestions,
        difficulty,
      });

      const newQuiz = {
        id: `quiz-${Date.now()}`,
        title: result.quizTitle || `${activeCourse.code} Week ${currentWeek} Quiz`,
        weekNumber: currentWeek,
        difficulty,
        questions: result.questions,
        createdAt: new Date().toISOString(),
      };

      const updated = courses.map((course) => {
        if (course.id !== activeCourse.id) return course;
        return {
          ...course,
          weeks: course.weeks.map((wm) =>
            wm.weekNumber === currentWeek
              ? { ...wm, quizzes: [newQuiz, ...(wm.quizzes || [])] }
              : wm
          ),
        };
      });

      setCourses(updated);
      setActiveTab('quiz');
      showToast(`AI quiz generated with ${result.questions.length} questions!`);
    } catch (e: any) {
      console.error(e);
      showToast(e.message || 'Failed to generate quiz', 'error');
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  // Generate Flashcards via Gemini
  const handleGenerateFlashcards = async (count: number) => {
    const weekModule = activeCourse?.weeks.find((w) => w.weekNumber === currentWeek);
    const slideContent = weekModule?.slidesRaw || '';

    if (!slideContent.trim()) {
      showToast('Please add slides for this week before creating flashcards.', 'error');
      return;
    }

    setIsGeneratingCards(true);
    try {
      const result = await generateFlashcards({
        courseName: activeCourse.name,
        weekNumber: currentWeek,
        topicTitle: weekModule?.topicTitle || `Week ${currentWeek} Topic`,
        slideContent,
        count,
      });

      const formattedCards: Flashcard[] = result.flashcards.map((f, i) => ({
        ...f,
        id: f.id || `fc-${Date.now()}-${i}`,
        courseId: activeCourse.id,
        weekNumber: currentWeek,
        box: 1,
        reviewCount: 0,
        nextReviewDate: new Date().toISOString(),
        isStarred: false,
      }));

      const updated = courses.map((course) => {
        if (course.id !== activeCourse.id) return course;
        return {
          ...course,
          weeks: course.weeks.map((wm) =>
            wm.weekNumber === currentWeek
              ? { ...wm, flashcards: [...formattedCards, ...(wm.flashcards || [])] }
              : wm
          ),
        };
      });

      setCourses(updated);
      setActiveTab('flashcards');
      showToast(`Created ${formattedCards.length} spaced-repetition flashcards!`);
    } catch (e: any) {
      console.error(e);
      showToast(e.message || 'Failed to generate flashcards', 'error');
    } finally {
      setIsGeneratingCards(false);
    }
  };

  // Update Flashcards list (reorder, edit, rating change)
  const handleUpdateFlashcards = (courseId: string, weekNumber: number, cards: Flashcard[]) => {
    const updated = courses.map((course) => {
      if (course.id !== courseId) return course;
      return {
        ...course,
        weeks: course.weeks.map((wm) =>
          wm.weekNumber === weekNumber ? { ...wm, flashcards: cards } : wm
        ),
      };
    });
    setCourses(updated);
  };

  // Record Quiz Attempt
  const handleRecordQuizAttempt = (attempt: QuizAttempt) => {
    setQuizAttempts((prev) => [attempt, ...prev]);
    showToast(`Quiz completed: ${attempt.score}/${attempt.totalQuestions} (${attempt.percentage}%)`);
  };

  // Generate Weekly Performance Report via Gemini
  const handleGenerateWeeklyReport = async (week: number) => {
    setIsGeneratingReport(true);
    try {
      const weekAttempts = quizAttempts.filter((a) => a.weekNumber === week);
      const coursesData = courses.map((c) => {
        const wm = c.weeks.find((w) => w.weekNumber === week);
        const attempts = weekAttempts.filter((a) => a.courseId === c.id);
        const avgAcc =
          attempts.length > 0
            ? Math.round(attempts.reduce((s, a) => s + a.percentage, 0) / attempts.length)
            : null;

        return {
          code: c.code,
          name: c.name,
          studyMinutes: wm?.studyMinutes || 0,
          targetWeeklyHours: c.targetWeeklyHours,
          quizzesTaken: attempts.length,
          avgAccuracy: avgAcc,
        };
      });

      const totalMins = coursesData.reduce((s, cd) => s + cd.studyMinutes, 0);

      const report = await generateWeeklyReport({
        weekNumber: week,
        coursesData,
        recentQuizScores: weekAttempts.map((a) => ({
          courseId: a.courseId,
          score: a.score,
          total: a.totalQuestions,
          percentage: a.percentage,
        })),
        totalStudyMinutes: totalMins,
      });

      setWeeklyReports((prev) => ({
        ...prev,
        [week]: report,
      }));

      showToast(`AI Performance Report generated for Week ${week}!`);
    } catch (e: any) {
      console.error(e);
      showToast(e.message || 'Failed to generate weekly report', 'error');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // Compute total study time for current week across all 6 courses
  const totalStudyMinutesThisWeek = courses.reduce((sum, course) => {
    const wm = course.weeks.find((w) => w.weekNumber === currentWeek);
    return sum + (wm?.studyMinutes || 0);
  }, 0);

  const handleUpdateCourseQuizzes = (courseId: string, weekNumber: number, quizzes: Quiz[]) => {
    const updated = courses.map((course) => {
      if (course.id !== courseId) return course;
      return {
        ...course,
        weeks: course.weeks.map((wm) =>
          wm.weekNumber === weekNumber ? { ...wm, quizzes } : wm
        ),
      };
    });
    setCourses(updated);
    showToast(`Question bank expanded with ${quizzes[0]?.questions.length || 0} questions!`);
  };

  const totalQuizzesThisWeek = quizAttempts.filter((a) => a.weekNumber === currentWeek).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Top Navbar */}
      <Navbar
        currentWeek={currentWeek}
        onWeekChange={(w) => setCurrentWeek(w)}
        onOpenTimer={() => setIsTimerOpen(true)}
        activeTimerSeconds={timerSecondsRemaining}
        isTimerRunning={isTimerRunning}
        totalStudyMinutesThisWeek={totalStudyMinutesThisWeek}
        totalQuizzesTakenThisWeek={totalQuizzesThisWeek}
        onRefreshData={handleRefreshData}
      />

      {/* 6-Course Selector Ribbon and Tab Navigation */}
      <CourseSelectorBar
        courses={courses}
        activeCourseId={activeCourseId}
        onSelectCourse={(id) => setActiveCourseId(id)}
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        currentWeek={currentWeek}
        onOpenCourseManager={() => setIsCourseManagerOpen(true)}
      />

      {/* Main Viewport Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            courses={courses}
            currentWeek={currentWeek}
            quizAttempts={quizAttempts}
            onSelectCourse={(id) => setActiveCourseId(id)}
            onNavigateTab={(tab, courseId) => {
              if (courseId) setActiveCourseId(courseId);
              setActiveTab(tab);
            }}
            onOpenTimer={() => setIsTimerOpen(true)}
          />
        )}

        {activeTab === 'slides' && activeCourse && (
          <SlidesView
            course={activeCourse}
            currentWeek={currentWeek}
            onUpdateSlides={handleUpdateSlides}
            onGenerateSummary={handleGenerateSummary}
            onGenerateQuiz={handleGenerateQuiz}
            onGenerateFlashcards={handleGenerateFlashcards}
            isGeneratingSummary={isGeneratingSummary}
            isGeneratingQuiz={isGeneratingQuiz}
            isGeneratingCards={isGeneratingCards}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'summary' && activeCourse && (
          <SummaryView
            course={activeCourse}
            currentWeek={currentWeek}
            onGenerateSummary={handleGenerateSummary}
            isGeneratingSummary={isGeneratingSummary}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'quiz' && activeCourse && (
          <QuizView
            course={activeCourse}
            currentWeek={currentWeek}
            onGenerateQuiz={handleGenerateQuiz}
            isGeneratingQuiz={isGeneratingQuiz}
            quizAttempts={quizAttempts}
            onRecordQuizAttempt={handleRecordQuizAttempt}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onUpdateCourseQuizzes={handleUpdateCourseQuizzes}
          />
        )}

        {activeTab === 'flashcards' && (
          <FlashcardsView
            courses={courses}
            activeCourseId={activeCourseId}
            currentWeek={currentWeek}
            onGenerateFlashcards={handleGenerateFlashcards}
            isGeneratingCards={isGeneratingCards}
            onUpdateFlashcards={handleUpdateFlashcards}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'reports' && (
          <WeeklyReportView
            courses={courses}
            currentWeek={currentWeek}
            onWeekChange={(w) => setCurrentWeek(w)}
            quizAttempts={quizAttempts}
            weeklyReports={weeklyReports}
            onGenerateReport={handleGenerateWeeklyReport}
            isGeneratingReport={isGeneratingReport}
            onNavigateTab={(tab, courseId) => {
              if (courseId) setActiveCourseId(courseId);
              setActiveTab(tab);
            }}
          />
        )}
      </main>

      {/* Floating Timer & Course Manager Modals */}
      <StudyTimerModal
        isOpen={isTimerOpen}
        onClose={() => setIsTimerOpen(false)}
        courses={courses}
        activeCourseId={activeCourseId}
        currentWeek={currentWeek}
        onLogStudyTime={handleLogStudyTime}
        secondsRemaining={timerSecondsRemaining}
        setSecondsRemaining={setTimerSecondsRemaining}
        isRunning={isTimerRunning}
        setIsRunning={setIsTimerRunning}
      />

      <CourseManagerModal
        isOpen={isCourseManagerOpen}
        onClose={() => setIsCourseManagerOpen(false)}
        courses={courses}
        onSaveCourses={(updated) => {
          setCourses(updated);
          showToast('Updated 6-course semester settings.');
        }}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl shadow-xl border flex items-center gap-2.5 text-xs font-semibold animate-slideUp ${
            toastMessage.type === 'error'
              ? 'bg-rose-900 text-white border-rose-700'
              : 'bg-slate-900 text-white border-slate-700 dark:bg-white dark:text-slate-900 dark:border-slate-200'
          }`}
        >
          {toastMessage.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-400" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}
    </div>
  );
}
