import React, { useState, useMemo } from 'react';
import { Course, TopicSummary } from '../types';
import { COURSE_THEMES, getCourseIcon } from '../lib/courseTheme';
import {
  Presentation,
  Upload,
  Sparkles,
  FileText,
  HelpCircle,
  Layers,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Edit3,
  Check,
  RotateCcw,
  BookOpen,
  Info
} from 'lucide-react';

interface SlidesViewProps {
  course: Course;
  currentWeek: number;
  onUpdateSlides: (courseId: string, weekNumber: number, slidesRaw: string, topicTitle?: string) => void;
  onGenerateSummary: () => Promise<void>;
  onGenerateQuiz: (count: number, difficulty: any) => Promise<void>;
  onGenerateFlashcards: (count: number) => Promise<void>;
  isGeneratingSummary: boolean;
  isGeneratingQuiz: boolean;
  isGeneratingCards: boolean;
  onNavigateTab: (tab: any) => void;
}

export const SlidesView: React.FC<SlidesViewProps> = ({
  course,
  currentWeek,
  onUpdateSlides,
  onGenerateSummary,
  onGenerateQuiz,
  onGenerateFlashcards,
  isGeneratingSummary,
  isGeneratingQuiz,
  isGeneratingCards,
  onNavigateTab,
}) => {
  const theme = COURSE_THEMES[course.color] || COURSE_THEMES.blue;
  const Icon = getCourseIcon(course.iconName);
  const weekModule = course.weeks.find((w) => w.weekNumber === currentWeek);

  const [isEditing, setIsEditing] = useState(false);
  const [topicInput, setTopicInput] = useState(weekModule?.topicTitle || '');
  const [slidesInput, setSlidesInput] = useState(weekModule?.slidesRaw || '');
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  // Sync state when course or week changes
  React.useEffect(() => {
    setTopicInput(weekModule?.topicTitle || `Week ${currentWeek} Lecture Topic`);
    setSlidesInput(weekModule?.slidesRaw || '');
    setActiveSlideIndex(0);
    setIsEditing(false);
  }, [course.id, currentWeek, weekModule?.slidesRaw, weekModule?.topicTitle]);

  // Parse slides into distinct cards
  const parsedSlides = useMemo(() => {
    const raw = (weekModule?.slidesRaw || '').trim();
    if (!raw) return [];

    // Split by common slide delimiters
    const parts = raw.split(/(?:^|\n)(?=---\s*Slide|\nSlide\s+\d+:|#\s+Slide\s+\d+|===\s*Slide)/i);
    const cleaned = parts
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    return cleaned.length > 0 ? cleaned : [raw];
  }, [weekModule?.slidesRaw]);

  const handleSave = () => {
    onUpdateSlides(course.id, currentWeek, slidesInput, topicInput);
    setIsEditing(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setSlidesInput(content);
        const guessedTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        if (!topicInput || topicInput.startsWith('Week ')) {
          setTopicInput(guessedTitle);
        }
        onUpdateSlides(course.id, currentWeek, content, guessedTitle);
        setIsEditing(false);
      }
    };
    reader.readAsText(file);
  };

  const currentSlideText = parsedSlides[activeSlideIndex] || '';

  return (
    <div className="space-y-6 pb-12">
      {/* Course Context Header */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${theme.badge} border shadow-sm`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base text-slate-900 dark:text-white">
                  {course.code} &bull; Week {currentWeek} Slides
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                  {course.department}
                </span>
              </div>
              <h1 className="text-lg font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                {weekModule?.topicTitle || `Week ${currentWeek} Lecture Material`}
              </h1>
            </div>
          </div>

          {/* Quick AI Trigger Ribbon */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onGenerateSummary()}
              disabled={isGeneratingSummary || !parsedSlides.length}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isGeneratingSummary ? 'Summarizing...' : 'Summarize Topic'}</span>
            </button>

            <button
              onClick={() => onGenerateQuiz(5, 'Balanced')}
              disabled={isGeneratingQuiz || !parsedSlides.length}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{isGeneratingQuiz ? 'Creating Quiz...' : 'Quiz Me on Slides'}</span>
            </button>

            <button
              onClick={() => onGenerateFlashcards(8)}
              disabled={isGeneratingCards || !parsedSlides.length}
              className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{isGeneratingCards ? 'Generating Cards...' : 'Make Flashcards'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Slide Deck Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Slide Reader / Editor */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
            {/* Top Toolbar */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 bg-slate-50/70 dark:bg-slate-850">
              <div className="flex items-center gap-2">
                <Presentation className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  {isEditing ? 'Editing Slide Deck Source' : `Slide ${activeSlideIndex + 1} of ${parsedSlides.length || 1}`}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {!isEditing && (
                  <label className="cursor-pointer px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg flex items-center gap-1.5 transition-colors border border-slate-200 dark:border-slate-700">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Slide File</span>
                    <input
                      type="file"
                      accept=".txt,.md,.text,.pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                )}

                <button
                  onClick={() => {
                    if (isEditing) handleSave();
                    else setIsEditing(true);
                  }}
                  className={`px-3 py-1 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors ${
                    isEditing
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                      : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  {isEditing ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Save Slides</span>
                    </>
                  ) : (
                    <>
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Slides Text</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Slide Body */}
            {isEditing ? (
              <div className="p-4 flex-1 flex flex-col space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">
                    Weekly Topic Title
                  </label>
                  <input
                    type="text"
                    value={topicInput}
                    onChange={(e) => setTopicInput(e.target.value)}
                    placeholder="e.g. Electrophilic Addition & Carbocation Stability"
                    className="w-full text-sm font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-2.5 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-500">
                      Slide Notes / Outline / Transcripts
                    </label>
                    <span className="text-[11px] text-slate-400">
                      Tip: Separate slides using `--- Slide 1 ---`
                    </span>
                  </div>
                  <textarea
                    value={slidesInput}
                    onChange={(e) => setSlidesInput(e.target.value)}
                    rows={16}
                    placeholder={`Paste lecture slide notes or bullet points here...\n\n--- Slide 1: Introduction ---\nKey concepts...\n\n--- Slide 2: Theorems & Mechanisms ---\nDetails...`}
                    className="w-full flex-1 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-3 leading-relaxed focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            ) : parsedSlides.length > 0 ? (
              <div className="p-6 flex-1 flex flex-col justify-between">
                {/* Active Slide Presentation Canvas */}
                <div className="bg-slate-50/80 dark:bg-slate-900/50 rounded-xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-inner min-h-[360px]">
                  <div className="prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-100 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                    {currentSlideText}
                  </div>
                </div>

                {/* Slide Pagination Navigator */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700 mt-4">
                  <button
                    disabled={activeSlideIndex === 0}
                    onClick={() => setActiveSlideIndex((prev) => Math.max(0, prev - 1))}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-750 text-xs font-semibold flex items-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous Slide</span>
                  </button>

                  {/* Slide Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto max-w-xs scrollbar-none px-2">
                    {parsedSlides.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveSlideIndex(idx)}
                        className={`w-6 h-6 rounded-full text-xs font-bold transition-all ${
                          idx === activeSlideIndex
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    ))}
                  </div>

                  <button
                    disabled={activeSlideIndex >= parsedSlides.length - 1}
                    onClick={() =>
                      setActiveSlideIndex((prev) => Math.min(parsedSlides.length - 1, prev + 1))
                    }
                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-750 text-xs font-semibold flex items-center gap-1"
                  >
                    <span>Next Slide</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center flex-1 flex flex-col items-center justify-center">
                <Presentation className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
                <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-1">
                  No Slides Uploaded for Week {currentWeek}
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mb-4">
                  Paste your professor's lecture slides or drag-and-drop a text file to enable AI active recall quizzes, summaries, and flashcards.
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Paste Slide Text</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Slide Insights & Study Workflow Sidebar */}
        <div className="space-y-4">
          {/* Card: Ready Artifacts for this week */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-500" />
              <span>Week {currentWeek} Study Artifacts</span>
            </h3>

            <div className="space-y-3 text-xs">
              {/* Summary Status */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-750 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    Topic Summary
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {weekModule?.summary
                      ? `${weekModule.summary.coreDefinitions?.length || 0} terms & formulas`
                      : 'Not yet generated'}
                  </p>
                </div>
                {weekModule?.summary ? (
                  <button
                    onClick={() => onNavigateTab('summary')}
                    className="px-2.5 py-1 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-bold rounded-lg text-[11px] hover:bg-blue-100"
                  >
                    View
                  </button>
                ) : (
                  <button
                    onClick={() => onGenerateSummary()}
                    disabled={isGeneratingSummary || !parsedSlides.length}
                    className="px-2.5 py-1 bg-blue-600 text-white font-bold rounded-lg text-[11px] hover:bg-blue-700 disabled:opacity-50"
                  >
                    Generate
                  </button>
                )}
              </div>

              {/* Quizzes Status */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-750 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      Question Bank
                    </p>
                    {weekModule?.quizzes?.some((q) => q.questions.length >= 60) && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        60+ Qs
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {(() => {
                      const totalQs = weekModule?.quizzes?.reduce((s, q) => s + q.questions.length, 0) || 0;
                      return totalQs > 0 ? `${totalQs} questions available` : 'None created';
                    })()}
                  </p>
                </div>
                {weekModule?.quizzes?.length ? (
                  <button
                    onClick={() => onNavigateTab('quiz')}
                    className="px-2.5 py-1 bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-bold rounded-lg text-[11px] hover:bg-indigo-100"
                  >
                    Quiz Bank
                  </button>
                ) : (
                  <button
                    onClick={() => onGenerateQuiz(10, 'Balanced')}
                    disabled={isGeneratingQuiz || !parsedSlides.length}
                    className="px-2.5 py-1 bg-indigo-600 text-white font-bold rounded-lg text-[11px] hover:bg-indigo-700 disabled:opacity-50"
                  >
                    Generate
                  </button>
                )}
              </div>

              {/* Flashcards Status */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-750 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    Spaced Flashcards
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {weekModule?.flashcards?.length
                      ? `${weekModule.flashcards.length} cards in Leitner deck`
                      : 'No flashcards'}
                  </p>
                </div>
                {weekModule?.flashcards?.length ? (
                  <button
                    onClick={() => onNavigateTab('flashcards')}
                    className="px-2.5 py-1 bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 font-bold rounded-lg text-[11px] hover:bg-amber-100"
                  >
                    Review
                  </button>
                ) : (
                  <button
                    onClick={() => onGenerateFlashcards(8)}
                    disabled={isGeneratingCards || !parsedSlides.length}
                    className="px-2.5 py-1 bg-amber-600 text-white font-bold rounded-lg text-[11px] hover:bg-amber-700 disabled:opacity-50"
                  >
                    Generate
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Educational Best Practices Callout */}
          <div className="bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl p-4 text-xs">
            <div className="flex items-start gap-2 text-indigo-900 dark:text-indigo-200 mb-1.5 font-bold">
              <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <span>Effective Slide Quizzing Strategy</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
              Don't just passively read lecture slides. Generate a 5-question active-recall quiz immediately after lecture, then review flashcards 2 days later to lock in long-term memory.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
