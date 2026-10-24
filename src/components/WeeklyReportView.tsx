import React, { useState } from 'react';
import { Course, QuizAttempt, WeeklyInsightReport } from '../types';
import { COURSE_THEMES, getCourseIcon } from '../lib/courseTheme';
import {
  BarChart2,
  Sparkles,
  Printer,
  TrendingUp,
  Award,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  PieChart,
  Calendar,
  Layers,
  HelpCircle,
  Lightbulb
} from 'lucide-react';

interface WeeklyReportViewProps {
  courses: Course[];
  currentWeek: number;
  onWeekChange: (week: number) => void;
  quizAttempts: QuizAttempt[];
  weeklyReports: Record<number, WeeklyInsightReport>;
  onGenerateReport: (week: number) => Promise<void>;
  isGeneratingReport: boolean;
  onNavigateTab: (tab: any, courseId?: string) => void;
}

export const WeeklyReportView: React.FC<WeeklyReportViewProps> = ({
  courses,
  currentWeek,
  onWeekChange,
  quizAttempts,
  weeklyReports,
  onGenerateReport,
  isGeneratingReport,
  onNavigateTab,
}) => {
  const [selectedReportWeek, setSelectedReportWeek] = useState(currentWeek);

  // Filter attempts for the selected week
  const weekAttempts = quizAttempts.filter((a) => a.weekNumber === selectedReportWeek);

  // Compute metrics for each course for the selected week
  const courseMetrics = courses.map((course) => {
    const wm = course.weeks.find((w) => w.weekNumber === selectedReportWeek);
    const attempts = weekAttempts.filter((a) => a.courseId === course.id);
    const totalQuizQuestions = attempts.reduce((sum, a) => sum + a.totalQuestions, 0);
    const totalCorrect = attempts.reduce((sum, a) => sum + a.score, 0);
    const avgAccuracy =
      totalQuizQuestions > 0 ? Math.round((totalCorrect / totalQuizQuestions) * 100) : null;

    const studyMinutes = wm?.studyMinutes || 0;
    const targetMinutes = (course.targetWeeklyHours || 4) * 60;
    const hasSlides = Boolean(wm?.slidesRaw?.trim());
    const flashcardCount = wm?.flashcards?.length || 0;

    let status: 'Mastered' | 'On Track' | 'Needs Attention' | 'Unstudied' = 'Unstudied';
    if (avgAccuracy !== null && avgAccuracy >= 85 && studyMinutes >= targetMinutes * 0.7) {
      status = 'Mastered';
    } else if (studyMinutes >= targetMinutes * 0.5 || (avgAccuracy !== null && avgAccuracy >= 70)) {
      status = 'On Track';
    } else if (studyMinutes > 0 || avgAccuracy !== null) {
      status = 'Needs Attention';
    }

    return {
      course,
      studyMinutes,
      targetMinutes,
      attemptsCount: attempts.length,
      avgAccuracy,
      hasSlides,
      flashcardCount,
      status,
    };
  });

  const totalStudyMinutes = courseMetrics.reduce((sum, cm) => sum + cm.studyMinutes, 0);
  const totalTargetMinutes = courseMetrics.reduce((sum, cm) => sum + cm.targetMinutes, 0);
  const coursesWithQuizzes = courseMetrics.filter((cm) => cm.avgAccuracy !== null);
  const overallAvgAccuracy =
    coursesWithQuizzes.length > 0
      ? Math.round(
          coursesWithQuizzes.reduce((sum, cm) => sum + (cm.avgAccuracy || 0), 0) /
            coursesWithQuizzes.length
        )
      : null;

  // Grade estimate
  const overallGrade =
    overallAvgAccuracy === null
      ? 'Pending'
      : overallAvgAccuracy >= 93
      ? 'A'
      : overallAvgAccuracy >= 88
      ? 'A-'
      : overallAvgAccuracy >= 82
      ? 'B+'
      : overallAvgAccuracy >= 75
      ? 'B'
      : 'C+';

  const report = weeklyReports[selectedReportWeek];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12 print:p-0">
      {/* Header bar */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-slate-900 dark:text-white">
                Semester Weekly Performance Report
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                {courses.length} Courses Analyzed
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Comprehensive active recall mastery, time distribution balance, and AI advisor feedback.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Week Picker */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
              <span className="text-xs font-semibold text-slate-500 px-2">Report Week:</span>
              <select
                value={selectedReportWeek}
                onChange={(e) => {
                  const w = Number(e.target.value);
                  setSelectedReportWeek(w);
                  onWeekChange(w);
                }}
                className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold rounded px-2.5 py-1 border border-slate-200 dark:border-slate-600 focus:outline-none"
              >
                {Array.from({ length: 14 }, (_, i) => i + 1).map((w) => (
                  <option key={w} value={w}>
                    Week {w}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handlePrint}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
              title="Print Performance Report"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>

            <button
              onClick={() => onGenerateReport(selectedReportWeek)}
              disabled={isGeneratingReport}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isGeneratingReport ? 'Analyzing Week...' : 'Generate AI Weekly Report'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Printable Report Header */}
      <div className="hidden print:block border-b-2 border-slate-900 pb-4 mb-6">
        <h1 className="text-2xl font-black">SeptemStudy - Weekly Performance Evaluation</h1>
        <p className="text-sm text-slate-600">
          Semester Academic Report &bull; Week {selectedReportWeek} &bull; Generated for University {courses.length}-Course Track
        </p>
      </div>

      {/* High-Level Semester Scorecard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Overall Week Grade</span>
            <Award className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {report?.overallScoreGrade || overallGrade}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Based on active quiz performance
          </p>
        </div>

        {/* Metric 2 */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Time Studied</span>
            <Clock className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {Math.round(totalStudyMinutes / 60)}h {totalStudyMinutes % 60}m
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Target: {Math.round(totalTargetMinutes / 60)}h across {courses.length} classes
          </p>
        </div>

        {/* Metric 3 */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Average Quiz Score</span>
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {overallAvgAccuracy !== null ? `${overallAvgAccuracy}%` : 'N/A'}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {weekAttempts.length} quizzes recorded
          </p>
        </div>

        {/* Metric 4 */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Course Balance Health</span>
            <PieChart className="w-4 h-4 text-amber-500" />
          </div>
          {(() => {
            const activeCount = courseMetrics.filter((c) => c.studyMinutes > 0).length;
            const balancePct = Math.round((activeCount / (courses.length || 6)) * 100);
            return (
              <>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {activeCount} / {courses.length} Active
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {balancePct >= 85 ? 'Excellent balance' : 'Some courses need time'}
                </p>
              </>
            );
          })()}
        </div>
      </div>

      {/* AI Performance Coach Insights Card */}
      {report && (
        <div className="bg-gradient-to-br from-indigo-50/80 via-white to-blue-50/60 dark:from-slate-800 dark:via-slate-800 dark:to-indigo-950/40 rounded-2xl border border-indigo-200 dark:border-indigo-800/80 p-6 shadow-sm">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
                <Sparkles className="w-4 h-4" />
              </div>
              <h2 className="font-bold text-base text-slate-900 dark:text-white">
                AI Academic Performance Advisor
              </h2>
            </div>
            <span className="text-xs text-slate-400">
              Evaluated for Week {selectedReportWeek}
            </span>
          </div>

          <h3 className="text-sm sm:text-base font-extrabold text-indigo-950 dark:text-indigo-200 mb-2">
            "{report.weeklyHeadline}"
          </h3>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
            {report.summary}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Top Strengths */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80">
              <h4 className="font-bold text-emerald-700 dark:text-emerald-400 mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Demonstrated Course Strengths</span>
              </h4>
              <ul className="space-y-1.5 text-slate-700 dark:text-slate-300">
                {report.strongestCourses?.map((course, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>{course}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Priority Weak Spots & Actionable Fixes */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80">
              <h4 className="font-bold text-amber-700 dark:text-amber-400 mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>Priority Review & Weak Spots</span>
              </h4>
              <div className="space-y-2">
                {report.atRiskCourses?.map((item, idx) => (
                  <div key={idx} className="text-[11px] leading-relaxed">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {item.courseName}:
                    </span>{' '}
                    <span className="text-slate-600 dark:text-slate-400">{item.reason}</span>
                    <p className="text-indigo-600 dark:text-indigo-400 font-semibold mt-0.5">
                      &rarr; Fix: {item.actionableNextStep}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Cognitive Science Study Tip */}
          {report.weeklyStudyTip && (
            <div className="mt-4 p-3 rounded-xl bg-indigo-100/60 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900 flex items-start gap-2.5 text-xs">
              <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-indigo-950 dark:text-indigo-200">
                  Weekly Retention Strategy:{' '}
                </span>
                <span className="text-slate-700 dark:text-slate-300">
                  {report.weeklyStudyTip}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Course Performance Matrix Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {courses.length}-Course Performance Matrix (Week {selectedReportWeek})
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Detailed tracking of time spent, quiz mastery, and slide completion across all {courses.length} courses.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-850 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-4">Course</th>
                <th className="py-3 px-4">Time Studied / Target</th>
                <th className="py-3 px-4">Quizzes Taken</th>
                <th className="py-3 px-4">Avg Accuracy</th>
                <th className="py-3 px-4">Flashcards</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right print:hidden">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {courseMetrics.map((cm) => {
                const theme = COURSE_THEMES[cm.course.color] || COURSE_THEMES.blue;
                const Icon = getCourseIcon(cm.course.iconName);
                const targetPct = Math.min(
                  100,
                  Math.round((cm.studyMinutes / (cm.targetMinutes || 1)) * 100)
                );

                return (
                  <tr key={cm.course.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-750 transition-colors">
                    {/* Course */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center ${theme.badge} border shrink-0`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white">
                            {cm.course.code}
                          </span>
                          <p className="text-[11px] text-slate-500 truncate max-w-[160px]">
                            {cm.course.name}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Time */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-1 max-w-[130px]">
                        <div className="flex justify-between text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                          <span>
                            {Math.round(cm.studyMinutes / 60)}h {cm.studyMinutes % 60}m
                          </span>
                          <span className="text-slate-400">
                            {cm.course.targetWeeklyHours}h
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-500 h-1.5 rounded-full"
                            style={{ width: `${targetPct}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Quizzes Taken */}
                    <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">
                      {cm.attemptsCount} quizzes
                    </td>

                    {/* Accuracy */}
                    <td className="py-3.5 px-4">
                      {cm.avgAccuracy !== null ? (
                        <span
                          className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                            cm.avgAccuracy >= 85
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : cm.avgAccuracy >= 70
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          }`}
                        >
                          {cm.avgAccuracy}%
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">None</span>
                      )}
                    </td>

                    {/* Flashcards */}
                    <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">
                      {cm.flashcardCount} cards
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          cm.status === 'Mastered'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : cm.status === 'On Track'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : cm.status === 'Needs Attention'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                        }`}
                      >
                        {cm.status}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right print:hidden">
                      <button
                        onClick={() => onNavigateTab('quiz', cm.course.id)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded font-semibold text-[11px] transition-colors"
                      >
                        Quiz
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visual Analytics Comparison Bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Chart 1: Study Time Distribution across 7 Courses */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-500" />
            <span>Study Hours Allocation (Week {selectedReportWeek})</span>
          </h3>
          <div className="space-y-3 text-xs">
            {courseMetrics.map((cm) => {
              const hours = (cm.studyMinutes / 60).toFixed(1);
              const maxTarget = 6;
              const barWidth = Math.min(100, Math.round(((cm.studyMinutes / 60) / maxTarget) * 100));

              return (
                <div key={cm.course.id} className="space-y-1">
                  <div className="flex justify-between font-semibold text-[11px]">
                    <span className="text-slate-800 dark:text-slate-200">
                      {cm.course.code}
                    </span>
                    <span className="text-slate-500">
                      {hours} hrs / {cm.course.targetWeeklyHours}h
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-2 rounded-full transition-all"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Quiz Accuracy across 7 Courses */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Award className="w-4 h-4 text-indigo-500" />
            <span>Active Recall Quiz Accuracy by Course</span>
          </h3>
          <div className="space-y-3 text-xs">
            {courseMetrics.map((cm) => {
              const accuracy = cm.avgAccuracy ?? 0;
              const hasScore = cm.avgAccuracy !== null;

              return (
                <div key={cm.course.id} className="space-y-1">
                  <div className="flex justify-between font-semibold text-[11px]">
                    <span className="text-slate-800 dark:text-slate-200">
                      {cm.course.code}
                    </span>
                    <span className="text-slate-500">
                      {hasScore ? `${accuracy}%` : 'No quiz taken'}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        accuracy >= 80
                          ? 'bg-indigo-600'
                          : accuracy >= 60
                          ? 'bg-amber-500'
                          : hasScore
                          ? 'bg-rose-500'
                          : 'bg-transparent'
                      }`}
                      style={{ width: `${accuracy}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
