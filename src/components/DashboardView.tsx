import React from 'react';
import { Course, QuizAttempt, ActiveTab } from '../types';
import { COURSE_THEMES, getCourseIcon } from '../lib/courseTheme';
import {
  Sparkles,
  BookOpen,
  HelpCircle,
  Layers,
  FileText,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  ArrowUpRight,
  BarChart3,
  Flame,
  Plus
} from 'lucide-react';

interface DashboardViewProps {
  courses: Course[];
  currentWeek: number;
  quizAttempts: QuizAttempt[];
  onSelectCourse: (courseId: string) => void;
  onNavigateTab: (tab: ActiveTab, courseId?: string) => void;
  onOpenTimer: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  courses,
  currentWeek,
  quizAttempts,
  onSelectCourse,
  onNavigateTab,
  onOpenTimer,
}) => {
  // Aggregate stats for current week
  const currentWeekAttempts = quizAttempts.filter((a) => a.weekNumber === currentWeek);
  const avgQuizAccuracy =
    currentWeekAttempts.length > 0
      ? Math.round(
          currentWeekAttempts.reduce((sum, a) => sum + a.percentage, 0) /
            currentWeekAttempts.length
        )
      : null;

  const totalMinutesStudied = courses.reduce((sum, course) => {
    const wm = course.weeks.find((w) => w.weekNumber === currentWeek);
    return sum + (wm?.studyMinutes || 0);
  }, 0);

  const totalTargetMinutes =
    courses.reduce((sum, c) => sum + (c.targetWeeklyHours || 4), 0) * 60;

  const totalFlashcards = courses.reduce((sum, course) => {
    const wm = course.weeks.find((w) => w.weekNumber === currentWeek);
    return sum + (wm?.flashcards?.length || 0);
  }, 0);

  // Identify courses that need attention for the current week
  const coursesNeedingAttention = courses.filter((course) => {
    const wm = course.weeks.find((w) => w.weekNumber === currentWeek);
    const attempts = quizAttempts.filter(
      (a) => a.courseId === course.id && a.weekNumber === currentWeek
    );
    const lowestScore = attempts.length > 0 ? Math.min(...attempts.map((a) => a.percentage)) : null;
    const hasNoSlides = !wm?.slidesRaw?.trim();
    const hasNoStudyTime = !wm?.studyMinutes || wm.studyMinutes < 30;
    const hasLowScore = lowestScore !== null && lowestScore < 70;

    return hasNoSlides || hasNoStudyTime || hasLowScore;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-indigo-900/40">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3 border border-indigo-500/30">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Semester Week {currentWeek} Overview &bull; 6 Active Courses</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
            Stay on top of every lecture, slide deck, and weekly exam prep.
          </h1>
          <p className="text-sm text-slate-300 mb-6 leading-relaxed">
            Upload your weekly lecture slides to automatically generate high-yield active-recall quizzes,
            spaced-repetition flashcards, and university-grade cheat sheets for all 6 of your classes.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigateTab('reports')}
              className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-500/25 transition-all"
            >
              <BarChart3 className="w-4 h-4" />
              <span>View Week {currentWeek} Performance Report</span>
            </button>
            <button
              onClick={onOpenTimer}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl flex items-center gap-2 border border-white/10 backdrop-blur transition-all"
            >
              <Clock className="w-4 h-4 text-sky-400" />
              <span>Start Study Session</span>
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-96 h-96 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none" />
      </div>

      {/* KPI Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Courses Enrolled</span>
            <BookOpen className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            6 Courses
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            All loaded in semester track
          </p>
        </div>

        {/* Metric 2 */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Study Time (Week {currentWeek})</span>
            <Clock className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {Math.round(totalMinutesStudied / 60)}h {totalMinutesStudied % 60}m
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-1.5 rounded-full transition-all"
              style={{
                width: `${Math.min(100, Math.round((totalMinutesStudied / (totalTargetMinutes || 1)) * 100))}%`,
              }}
            />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Quiz Accuracy</span>
            <HelpCircle className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {avgQuizAccuracy !== null ? `${avgQuizAccuracy}%` : 'No Quizzes'}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {currentWeekAttempts.length} quizzes completed
          </p>
        </div>

        {/* Metric 4 */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Flashcards</span>
            <Layers className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {totalFlashcards} Cards
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Ready for spaced repetition
          </p>
        </div>
      </div>

      {/* Week Attention Alert if any course needs focus */}
      {coursesNeedingAttention.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-900 dark:text-amber-200">
                Action Recommended for Week {currentWeek}:
              </p>
              <p className="text-amber-700 dark:text-amber-300">
                {coursesNeedingAttention.length} of your 6 courses (
                {coursesNeedingAttention.map((c) => c.code).join(', ')}) either need slides
                uploaded or have not completed a quiz attempt yet.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('slides', coursesNeedingAttention[0]?.id)}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg shrink-0 self-start sm:self-center transition-colors"
          >
            Review {coursesNeedingAttention[0]?.code}
          </button>
        </div>
      )}

      {/* 6-Course Semester Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              6-Course Semester Matrix (Week {currentWeek})
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select any course to view lecture slides, launch active-recall quizzes, or read topic summaries.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            6 / 6 Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course, index) => {
            const theme = COURSE_THEMES[course.color] || COURSE_THEMES.blue;
            const Icon = getCourseIcon(course.iconName);
            const weekModule = course.weeks.find((w) => w.weekNumber === currentWeek);

            const hasSlides = Boolean(weekModule?.slidesRaw?.trim());
            const hasSummary = Boolean(weekModule?.summary);
            const quizzesCount = weekModule?.quizzes?.length || 0;
            const flashcardsCount = weekModule?.flashcards?.length || 0;
            const studyMins = weekModule?.studyMinutes || 0;
            const targetMins = (course.targetWeeklyHours || 4) * 60;

            // Course quiz attempts
            const attempts = quizAttempts.filter(
              (a) => a.courseId === course.id && a.weekNumber === currentWeek
            );
            const bestPercentage =
              attempts.length > 0 ? Math.max(...attempts.map((a) => a.percentage)) : null;

            return (
              <div
                key={course.id}
                className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all p-5 shadow-sm hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center ${theme.badge} border`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-sm text-slate-900 dark:text-white">
                            {course.code}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-400">
                            #{index + 1}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                          {course.department}
                        </p>
                      </div>
                    </div>

                    {/* Quiz Score Badge */}
                    {bestPercentage !== null ? (
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          bestPercentage >= 80
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : bestPercentage >= 60
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                        title="Highest Quiz Score This Week"
                      >
                        {bestPercentage}% Quiz
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium text-slate-400 italic">
                        No quiz yet
                      </span>
                    )}
                  </div>

                  {/* Course Name & Weekly Topic */}
                  <div className="mb-4">
                    <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-100 line-clamp-1 mb-1">
                      {course.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/60 p-2 rounded-lg border border-slate-100 dark:border-slate-750 line-clamp-2">
                      <strong className="text-slate-700 dark:text-slate-300">W{currentWeek}:</strong>{' '}
                      {weekModule?.topicTitle || 'No topic assigned'}
                    </p>
                  </div>

                  {/* Module Status Checklist */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] mb-4">
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          hasSlides ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'
                        }`}
                      />
                      <span>{hasSlides ? 'Slides Loaded' : 'No Slides'}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          hasSummary ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'
                        }`}
                      />
                      <span>{hasSummary ? 'Summary Ready' : 'No Summary'}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          quizzesCount > 0 ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-600'
                        }`}
                      />
                      <span>{quizzesCount} Quiz Sets</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          flashcardsCount > 0 ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-600'
                        }`}
                      />
                      <span>{flashcardsCount} Flashcards</span>
                    </div>
                  </div>

                  {/* Study Time Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                      <span>Study Log</span>
                      <span>
                        {Math.round(studyMins / 60)}h {studyMins % 60}m / {course.targetWeeklyHours}h
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full"
                        style={{
                          width: `${Math.min(100, Math.round((studyMins / (targetMins || 1)) * 100))}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-700/80 flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      onSelectCourse(course.id);
                      onNavigateTab('quiz', course.id);
                    }}
                    className="flex-1 py-1.5 px-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/80 dark:text-indigo-300 font-semibold rounded-lg text-xs flex items-center justify-center gap-1 transition-colors"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Quiz</span>
                  </button>

                  <button
                    onClick={() => {
                      onSelectCourse(course.id);
                      onNavigateTab('summary', course.id);
                    }}
                    className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-700/80 dark:hover:bg-slate-700 dark:text-slate-200 font-semibold rounded-lg text-xs flex items-center justify-center gap-1 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Summary</span>
                  </button>

                  <button
                    onClick={() => {
                      onSelectCourse(course.id);
                      onNavigateTab('slides', course.id);
                    }}
                    className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-400 rounded-lg text-xs border border-slate-200 dark:border-slate-700 transition-colors"
                    title="Open Slides"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
