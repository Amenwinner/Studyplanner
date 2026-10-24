import React, { useState } from 'react';
import {
  GraduationCap,
  Calendar,
  Clock,
  Sparkles,
  Download,
  Upload,
  RotateCcw,
  BookOpen,
  HelpCircle,
  Play
} from 'lucide-react';
import { exportStudyData, importStudyData, resetToDefaults } from '../lib/storage';

interface NavbarProps {
  currentWeek: number;
  onWeekChange: (week: number) => void;
  onOpenTimer: () => void;
  activeTimerSeconds: number | null;
  isTimerRunning: boolean;
  totalStudyMinutesThisWeek: number;
  totalQuizzesTakenThisWeek: number;
  onRefreshData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentWeek,
  onWeekChange,
  onOpenTimer,
  activeTimerSeconds,
  isTimerRunning,
  totalStudyMinutesThisWeek,
  totalQuizzesTakenThisWeek,
  onRefreshData,
}) => {
  const [showDataMenu, setShowDataMenu] = useState(false);

  const handleExport = () => {
    const json = exportStudyData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `septemstudy-backup-week${currentWeek}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setShowDataMenu(false);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content && importStudyData(content)) {
        onRefreshData();
      }
    };
    reader.readAsText(file);
    setShowDataMenu(false);
  };

  const handleReset = () => {
    if (confirm('Reset to initial 6-course sample dataset? This will reload pre-built slides, summaries, and quizzes.')) {
      resetToDefaults();
      onRefreshData();
      setShowDataMenu(false);
    }
  };

  const formatTimerDisplay = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">
                SeptemStudy
              </span>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                6 Courses
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              Weekly Slide Quizzes, Flashcards & Performance Analytics
            </p>
          </div>
        </div>

        {/* Center: Week Selector & Metrics */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 px-2 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Semester</span> Week:
            </span>
            <select
              value={currentWeek}
              onChange={(e) => onWeekChange(Number(e.target.value))}
              aria-label="Select Semester Week"
              className="bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm font-semibold rounded px-2.5 py-1 border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm"
            >
              {Array.from({ length: 14 }, (_, i) => i + 1).map((w) => (
                <option key={w} value={w}>
                  Week {w}
                </option>
              ))}
            </select>
          </div>

          {/* Quick stats pill */}
          <div className="hidden lg:flex items-center gap-3 px-3 py-1.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200/80 dark:border-slate-700/80 text-xs">
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <Clock className="w-3.5 h-3.5 text-blue-500" />
              <span className="font-semibold text-slate-900 dark:text-white">
                {Math.round(totalStudyMinutesThisWeek / 60)}h {totalStudyMinutesThisWeek % 60}m
              </span>
              <span className="text-slate-400">studied</span>
            </div>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span className="font-semibold text-slate-900 dark:text-white">
                {totalQuizzesTakenThisWeek}
              </span>
              <span className="text-slate-400">quizzes taken</span>
            </div>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Study Timer Quick Button */}
          <button
            onClick={onOpenTimer}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm ${
              isTimerRunning
                ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 animate-pulse'
                : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/80 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
            }`}
            title="Open Focus Study Timer"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>
              {activeTimerSeconds !== null && isTimerRunning
                ? formatTimerDisplay(activeTimerSeconds)
                : 'Study Timer'}
            </span>
          </button>

          {/* Backup / Data Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDataMenu(!showDataMenu)}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Data & Backup Options"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {showDataMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50 text-xs">
                <div className="px-3 py-1.5 font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
                  Study Data Management
                </div>
                <button
                  onClick={handleExport}
                  className="w-full px-3 py-2 text-left flex items-center gap-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <Download className="w-3.5 h-3.5 text-blue-500" />
                  <span>Export Study Backup (JSON)</span>
                </button>
                <label className="w-full px-3 py-2 text-left flex items-center gap-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer">
                  <Upload className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Import Study Backup</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    className="hidden"
                  />
                </label>
                <div className="border-t border-slate-200 dark:border-slate-700 my-1" />
                <button
                  onClick={handleReset}
                  className="w-full px-3 py-2 text-left flex items-center gap-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-rose-500" />
                  <span>Reset to 6 Pre-loaded Courses</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
