import React, { useState } from 'react';
import { Course, CourseColor } from '../types';
import { COURSE_THEMES } from '../lib/courseTheme';
import { X, Plus, Trash2, Check, RotateCcw, Settings2 } from 'lucide-react';
import { INITIAL_COURSES } from '../data/initialData';

interface CourseManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: Course[];
  onSaveCourses: (updated: Course[]) => void;
}

export const CourseManagerModal: React.FC<CourseManagerModalProps> = ({
  isOpen,
  onClose,
  courses,
  onSaveCourses,
}) => {
  const [editingCourses, setEditingCourses] = useState<Course[]>(courses);
  const [selectedIdx, setSelectedIdx] = useState(0);

  if (!isOpen) return null;

  const current = editingCourses[selectedIdx] || editingCourses[0];

  const handleUpdateCurrent = (field: keyof Course, val: any) => {
    const updated = [...editingCourses];
    updated[selectedIdx] = {
      ...updated[selectedIdx],
      [field]: val,
    };
    setEditingCourses(updated);
  };

  const handleSave = () => {
    onSaveCourses(editingCourses);
    onClose();
  };

  const handleResetDefaults = () => {
    if (confirm('Reset to standard 6-course university curriculum?')) {
      setEditingCourses(INITIAL_COURSES);
    }
  };

  const colors: CourseColor[] = ['blue', 'emerald', 'amber', 'violet', 'rose', 'cyan', 'orange'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 max-w-2xl w-full p-6 text-slate-900 dark:text-white flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-indigo-500" />
            <h3 className="font-bold text-lg">Manage 6 Semester Courses</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto py-4 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Course List */}
          <div className="space-y-1.5 md:border-r border-slate-100 dark:border-slate-700 pr-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Courses ({editingCourses.length})
            </span>
            {editingCourses.map((c, idx) => {
              const theme = COURSE_THEMES[c.color] || COURSE_THEMES.blue;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedIdx(idx)}
                  className={`w-full text-left p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                    idx === selectedIdx
                      ? 'bg-slate-100 dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 ring-1 ring-slate-300 dark:ring-slate-600'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-750'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.barColor }} />
                    <span>{c.code}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 truncate max-w-[80px]">
                    {c.targetWeeklyHours}h/wk
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right Editor Form */}
          {current && (
            <div className="md:col-span-2 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Course Code
                </label>
                <input
                  type="text"
                  value={current.code}
                  onChange={(e) => handleUpdateCurrent('code', e.target.value)}
                  className="w-full text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-2.5"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Course Full Title
                </label>
                <input
                  type="text"
                  value={current.name}
                  onChange={(e) => handleUpdateCurrent('name', e.target.value)}
                  className="w-full text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-2.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={current.department}
                    onChange={(e) => handleUpdateCurrent('department', e.target.value)}
                    className="w-full text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-2.5"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Target Weekly Hours
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="15"
                    value={current.targetWeeklyHours}
                    onChange={(e) => handleUpdateCurrent('targetWeeklyHours', Number(e.target.value))}
                    className="w-full text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-2.5"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Instructor / Professor
                </label>
                <input
                  type="text"
                  value={current.professor}
                  onChange={(e) => handleUpdateCurrent('professor', e.target.value)}
                  className="w-full text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-2.5"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                  Color Theme Badge
                </label>
                <div className="flex items-center gap-2">
                  {colors.map((c) => {
                    const theme = COURSE_THEMES[c];
                    return (
                      <button
                        key={c}
                        onClick={() => handleUpdateCurrent('color', c)}
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                          current.color === c ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110' : ''
                        }`}
                        style={{ backgroundColor: theme.barColor }}
                      >
                        {current.color === c && <Check className="w-3.5 h-3.5 text-white" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <button
            onClick={handleResetDefaults}
            className="text-xs text-rose-500 hover:text-rose-600 flex items-center gap-1 font-semibold"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Default 6 Courses</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md"
            >
              Save Course Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
