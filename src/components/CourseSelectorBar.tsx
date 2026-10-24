import React from 'react';
import { Course, ActiveTab } from '../types';
import { COURSE_THEMES, getCourseIcon } from '../lib/courseTheme';
import {
  LayoutDashboard,
  Presentation,
  FileText,
  HelpCircle,
  Layers,
  BarChart2,
  Settings2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface CourseSelectorBarProps {
  courses: Course[];
  activeCourseId: string;
  onSelectCourse: (courseId: string) => void;
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  currentWeek: number;
  onOpenCourseManager: () => void;
}

export const CourseSelectorBar: React.FC<CourseSelectorBarProps> = ({
  courses,
  activeCourseId,
  onSelectCourse,
  activeTab,
  onSelectTab,
  currentWeek,
  onOpenCourseManager,
}) => {
  const activeCourse = courses.find((c) => c.id === activeCourseId) || courses[0];

  const tabs: { id: ActiveTab; label: string; icon: React.ElementType; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'slides', label: 'Lecture Slides', icon: Presentation },
    { id: 'summary', label: 'Topic Summary', icon: FileText },
    { id: 'quiz', label: 'Slide Quiz', icon: HelpCircle },
    { id: 'flashcards', label: 'Flashcards', icon: Layers },
    { id: 'reports', label: 'Weekly Performance', icon: BarChart2 },
  ];

  return (
    <div className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-0">
        {/* 6-Course Pills Ribbon */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none flex-1">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mr-1 hidden sm:inline">
              Courses:
            </span>
            {courses.map((course, idx) => {
              const theme = COURSE_THEMES[course.color] || COURSE_THEMES.blue;
              const Icon = getCourseIcon(course.iconName);
              const isActive = course.id === activeCourseId;
              const weekModule = course.weeks.find((w) => w.weekNumber === currentWeek);
              const hasSlides = Boolean(weekModule?.slidesRaw?.trim());
              const hasQuiz = Boolean(weekModule?.quizzes && weekModule.quizzes.length > 0);

              return (
                <button
                  key={course.id}
                  onClick={() => onSelectCourse(course.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap border ${
                    isActive
                      ? `${theme.activeTab} border-transparent ring-2 ring-offset-1 ring-slate-400 dark:ring-offset-slate-900`
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750'
                  }`}
                  title={`${course.code}: ${course.name} (Prof. ${course.professor})`}
                >
                  <span className="font-bold opacity-75">{idx + 1}.</span>
                  <Icon className="w-3.5 h-3.5" />
                  <span className="font-semibold">{course.code}</span>
                  {/* Status dot */}
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      hasQuiz
                        ? 'bg-emerald-400 ring-2 ring-emerald-200 dark:ring-emerald-900'
                        : hasSlides
                        ? 'bg-amber-400'
                        : 'bg-slate-300 dark:bg-slate-600'
                    }`}
                    title={
                      hasQuiz
                        ? `Week ${currentWeek}: Quizzes ready`
                        : hasSlides
                        ? `Week ${currentWeek}: Slides uploaded`
                        : `Week ${currentWeek}: Needs slides`
                    }
                  />
                </button>
              );
            })}
          </div>

          <button
            onClick={onOpenCourseManager}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 transition-colors shadow-sm"
            title="Edit 6-Course Semester Setup"
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Manage 6 Courses</span>
          </button>
        </div>

        {/* Selected Course Context Banner & View Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-slate-200/60 dark:border-slate-800/60">
          {/* Active Course Title */}
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-slate-900 dark:text-white">
              {activeCourse?.code}
            </span>
            <span className="text-slate-400">&bull;</span>
            <span className="text-slate-600 dark:text-slate-300 truncate max-w-[280px]">
              {activeCourse?.name}
            </span>
            <span className="hidden md:inline text-slate-400">&bull;</span>
            <span className="hidden md:inline text-slate-500 dark:text-slate-400 italic">
              {activeCourse?.professor}
            </span>
          </div>

          {/* Navigation View Tabs */}
          <nav className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-1 sm:pb-0" aria-label="Views">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              const isCurrent = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onSelectTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 whitespace-nowrap ${
                    isCurrent
                      ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800'
                      : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <TabIcon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
};
