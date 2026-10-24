import React, { useState, useEffect } from 'react';
import { X, Play, Pause, RotateCcw, Check, Clock, BookOpen, Sparkles } from 'lucide-react';
import { Course } from '../types';

interface StudyTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: Course[];
  activeCourseId: string;
  currentWeek: number;
  onLogStudyTime: (courseId: string, weekNumber: number, minutes: number) => void;
  secondsRemaining: number;
  setSecondsRemaining: React.Dispatch<React.SetStateAction<number>>;
  isRunning: boolean;
  setIsRunning: React.Dispatch<React.SetStateAction<boolean>>;
}

export const StudyTimerModal: React.FC<StudyTimerModalProps> = ({
  isOpen,
  onClose,
  courses,
  activeCourseId,
  currentWeek,
  onLogStudyTime,
  secondsRemaining,
  setSecondsRemaining,
  isRunning,
  setIsRunning,
}) => {
  const [selectedCourseId, setSelectedCourseId] = useState(activeCourseId);
  const [selectedWeek, setSelectedWeek] = useState(currentWeek);
  const [timerMode, setTimerMode] = useState<'pomodoro' | 'shortBreak' | 'stopwatch'>('pomodoro');
  const [sessionElapsedSeconds, setSessionElapsedSeconds] = useState(0);

  useEffect(() => {
    setSelectedCourseId(activeCourseId);
    setSelectedWeek(currentWeek);
  }, [activeCourseId, currentWeek]);

  // Keep track of elapsed time while running to log accurately
  useEffect(() => {
    let interval: any = null;
    if (isRunning) {
      interval = setInterval(() => {
        setSessionElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  if (!isOpen) return null;

  const handleSelectMode = (mode: 'pomodoro' | 'shortBreak' | 'stopwatch') => {
    setTimerMode(mode);
    setIsRunning(false);
    if (mode === 'pomodoro') setSecondsRemaining(25 * 60);
    else if (mode === 'shortBreak') setSecondsRemaining(5 * 60);
    else setSecondsRemaining(0);
  };

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(Math.abs(totalSecs) / 60);
    const secs = Math.abs(totalSecs) % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleLogAndClose = () => {
    const minutesToLog = Math.max(1, Math.round(sessionElapsedSeconds / 60));
    onLogStudyTime(selectedCourseId, selectedWeek, minutesToLog);
    setIsRunning(false);
    setSessionElapsedSeconds(0);
    onClose();
  };

  const activeCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 max-w-md w-full p-6 text-slate-900 dark:text-white transition-all">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-500" />
            <h3 className="font-bold text-lg">Focus Study Session</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Course & Week Target */}
        <div className="grid grid-cols-2 gap-3 my-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Course To Credit
            </label>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-2 focus:ring-2 focus:ring-blue-500"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} - {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Semester Week
            </label>
            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(Number(e.target.value))}
              className="w-full text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-2 focus:ring-2 focus:ring-blue-500"
            >
              {Array.from({ length: 14 }, (_, i) => i + 1).map((w) => (
                <option key={w} value={w}>
                  Week {w}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex rounded-lg bg-slate-100 dark:bg-slate-900 p-1 mb-6 text-xs font-semibold">
          <button
            onClick={() => handleSelectMode('pomodoro')}
            className={`flex-1 py-1.5 rounded-md transition-all ${
              timerMode === 'pomodoro'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            25m Pomodoro
          </button>
          <button
            onClick={() => handleSelectMode('shortBreak')}
            className={`flex-1 py-1.5 rounded-md transition-all ${
              timerMode === 'shortBreak'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            5m Break
          </button>
          <button
            onClick={() => handleSelectMode('stopwatch')}
            className={`flex-1 py-1.5 rounded-md transition-all ${
              timerMode === 'stopwatch'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Stopwatch
          </button>
        </div>

        {/* Timer Display */}
        <div className="text-center py-6">
          <div className="text-6xl font-black font-mono tracking-tighter text-slate-900 dark:text-white mb-2">
            {formatTime(secondsRemaining)}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isRunning ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center justify-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Studying {activeCourse?.code} for Week {selectedWeek}
              </span>
            ) : (
              `Session elapsed: ${Math.round(sessionElapsedSeconds / 60)} minutes`
            )}
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 text-white shadow-lg transition-transform active:scale-95 ${
              isRunning
                ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/30'
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/30'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                <span>Start Focus</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              setIsRunning(false);
              if (timerMode === 'pomodoro') setSecondsRemaining(25 * 60);
              else if (timerMode === 'shortBreak') setSecondsRemaining(5 * 60);
              else setSecondsRemaining(0);
            }}
            className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 transition-colors"
            title="Reset Clock"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

        {/* Footer: Log Session Button */}
        {sessionElapsedSeconds > 0 && (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Unsaved time: {Math.max(1, Math.round(sessionElapsedSeconds / 60))} min
            </span>
            <button
              onClick={handleLogAndClose}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
            >
              <Check className="w-4 h-4" />
              <span>Log {Math.max(1, Math.round(sessionElapsedSeconds / 60))}m to {activeCourse?.code}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
