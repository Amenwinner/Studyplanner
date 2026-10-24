import React, { useState, useEffect } from 'react';
import { Course, Flashcard } from '../types';
import { COURSE_THEMES, getCourseIcon } from '../lib/courseTheme';
import {
  Layers,
  Sparkles,
  RotateCw,
  Star,
  ChevronLeft,
  ChevronRight,
  Volume2,
  Plus,
  Trash2,
  Check,
  BookOpen,
  Filter,
  CheckCircle2,
  Shuffle
} from 'lucide-react';

interface FlashcardsViewProps {
  courses: Course[];
  activeCourseId: string;
  currentWeek: number;
  onGenerateFlashcards: (count: number) => Promise<void>;
  isGeneratingCards: boolean;
  onUpdateFlashcards: (courseId: string, weekNumber: number, cards: Flashcard[]) => void;
  onNavigateTab: (tab: any) => void;
}

export const FlashcardsView: React.FC<FlashcardsViewProps> = ({
  courses,
  activeCourseId,
  currentWeek,
  onGenerateFlashcards,
  isGeneratingCards,
  onUpdateFlashcards,
  onNavigateTab,
}) => {
  const activeCourse = courses.find((c) => c.id === activeCourseId) || courses[0];
  const theme = COURSE_THEMES[activeCourse.color] || COURSE_THEMES.blue;
  const Icon = getCourseIcon(activeCourse.iconName);

  const [viewScope, setViewScope] = useState<'currentCourse' | 'allCourses'>('currentCourse');
  const [weekScope, setWeekScope] = useState<'currentWeek' | 'allWeeks'>('currentWeek');
  const [filterStarredOnly, setFilterStarredOnly] = useState(false);

  // Collect flashcards based on filters
  const allFilteredCards: Flashcard[] = React.useMemo(() => {
    let result: Flashcard[] = [];

    const targetCourses =
      viewScope === 'currentCourse' ? [activeCourse] : courses;

    targetCourses.forEach((c) => {
      c.weeks.forEach((w) => {
        if (weekScope === 'allWeeks' || w.weekNumber === currentWeek) {
          if (w.flashcards && w.flashcards.length > 0) {
            result.push(...w.flashcards);
          }
        }
      });
    });

    if (filterStarredOnly) {
      result = result.filter((fc) => fc.isStarred);
    }

    return result;
  }, [courses, activeCourse, viewScope, weekScope, currentWeek, filterStarredOnly]);

  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Manual card form
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');
  const [newCategory, setNewCategory] = useState('Core Definition');

  const currentCard: Flashcard | undefined = allFilteredCards[cardIndex];

  // Reset index when cards change
  useEffect(() => {
    setCardIndex(0);
    setIsFlipped(false);
  }, [viewScope, weekScope, filterStarredOnly, activeCourseId]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleNextCard();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrevCard();
      } else if (e.key === '1') {
        handleSpacedRating(1);
      } else if (e.key === '2') {
        handleSpacedRating(2);
      } else if (e.key === '3') {
        handleSpacedRating(3);
      } else if (e.key === '4') {
        handleSpacedRating(4);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cardIndex, isFlipped, currentCard]);

  const handleNextCard = () => {
    setIsFlipped(false);
    setCardIndex((prev) => (prev < allFilteredCards.length - 1 ? prev + 1 : 0));
  };

  const handlePrevCard = () => {
    setIsFlipped(false);
    setCardIndex((prev) => (prev > 0 ? prev - 1 : allFilteredCards.length - 1));
  };

  const handleSpacedRating = (rating: 1 | 2 | 3 | 4) => {
    if (!currentCard) return;

    // Calculate new Leitner box: 1 = Again (Box 1), 2 = Hard (stay or box 2), 3 = Good (box + 1), 4 = Easy (box + 2)
    let newBox = currentCard.box || 1;
    if (rating === 1) newBox = 1;
    else if (rating === 2) newBox = Math.max(1, newBox);
    else if (rating === 3) newBox = Math.min(5, newBox + 1);
    else if (rating === 4) newBox = Math.min(5, newBox + 2);

    const updatedCard: Flashcard = {
      ...currentCard,
      box: newBox,
      reviewCount: (currentCard.reviewCount || 0) + 1,
      nextReviewDate: new Date(Date.now() + newBox * 86400000).toISOString(),
    };

    // Save updated card into course structure
    saveCardUpdate(updatedCard);

    // Auto advance
    handleNextCard();
  };

  const handleToggleStar = () => {
    if (!currentCard) return;
    const updatedCard: Flashcard = {
      ...currentCard,
      isStarred: !currentCard.isStarred,
    };
    saveCardUpdate(updatedCard);
  };

  const saveCardUpdate = (card: Flashcard) => {
    const courseId = card.courseId || activeCourse.id;
    const courseToUpdate = courses.find((c) => c.id === courseId);
    if (!courseToUpdate) return;

    const weekMod = courseToUpdate.weeks.find((w) => w.weekNumber === card.weekNumber);
    if (!weekMod) return;

    const newCards = (weekMod.flashcards || []).map((fc) =>
      fc.id === card.id ? card : fc
    );

    onUpdateFlashcards(courseId, card.weekNumber, newCards);
  };

  const handleAddManualCard = () => {
    if (!newFront.trim() || !newBack.trim()) return;

    const newCard: Flashcard = {
      id: `fc-manual-${Date.now()}`,
      courseId: activeCourse.id,
      weekNumber: currentWeek,
      front: newFront.trim(),
      back: newBack.trim(),
      category: newCategory,
      difficulty: 'Medium',
      box: 1,
      nextReviewDate: new Date().toISOString(),
      reviewCount: 0,
      isStarred: false,
    };

    const weekMod = activeCourse.weeks.find((w) => w.weekNumber === currentWeek);
    const updatedCards = [...(weekMod?.flashcards || []), newCard];

    onUpdateFlashcards(activeCourse.id, currentWeek, updatedCards);

    setNewFront('');
    setNewBack('');
    setShowAddModal(false);
  };

  const handleSpeakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Leitner box count distribution for current scope
  const boxCounts = [1, 2, 3, 4, 5].map(
    (b) => allFilteredCards.filter((fc) => (fc.box || 1) === b).length
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header bar */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${theme.badge} border shadow-sm`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base text-slate-900 dark:text-white">
                  Spaced Repetition Flashcards
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                  Leitner System
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Active Deck: {viewScope === 'currentCourse' ? activeCourse.code : 'All 7 Courses'} &bull;{' '}
                {weekScope === 'currentWeek' ? `Week ${currentWeek}` : 'Entire Semester'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Card</span>
            </button>

            <button
              onClick={() => onGenerateFlashcards(8)}
              disabled={
                isGeneratingCards ||
                !activeCourse.weeks.find((w) => w.weekNumber === currentWeek)?.slidesRaw?.trim()
              }
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isGeneratingCards ? 'Generating Cards...' : 'Create AI Flashcards from Slides'}</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filter:
            </span>

            {/* Scope Course */}
            <div className="inline-flex rounded-lg bg-slate-100 dark:bg-slate-700 p-0.5 font-medium">
              <button
                onClick={() => setViewScope('currentCourse')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  viewScope === 'currentCourse'
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-bold shadow-sm'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                {activeCourse.code} Only
              </button>
              <button
                onClick={() => setViewScope('allCourses')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  viewScope === 'allCourses'
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-bold shadow-sm'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                All 7 Courses
              </button>
            </div>

            {/* Scope Week */}
            <div className="inline-flex rounded-lg bg-slate-100 dark:bg-slate-700 p-0.5 font-medium">
              <button
                onClick={() => setWeekScope('currentWeek')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  weekScope === 'currentWeek'
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-bold shadow-sm'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                Week {currentWeek}
              </button>
              <button
                onClick={() => setWeekScope('allWeeks')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  weekScope === 'allWeeks'
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-bold shadow-sm'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                All Weeks
              </button>
            </div>

            <button
              onClick={() => setFilterStarredOnly(!filterStarredOnly)}
              className={`px-2.5 py-1 rounded-lg border flex items-center gap-1 font-semibold transition-colors ${
                filterStarredOnly
                  ? 'bg-amber-100 border-amber-300 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${filterStarredOnly ? 'fill-amber-500' : ''}`} />
              <span>Starred Only</span>
            </button>
          </div>

          {/* Leitner Box Visuals */}
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
            <span>Leitner Boxes:</span>
            {boxCounts.map((count, idx) => (
              <span
                key={idx}
                className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600"
                title={`Box ${idx + 1}: ${count} cards`}
              >
                B{idx + 1}: <strong>{count}</strong>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Main Flashcard Interactive Stage */}
      {currentCard ? (
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Card Meta & Pagination */}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 dark:text-white">
                Card {cardIndex + 1} of {allFilteredCards.length}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-[10px] font-semibold">
                {currentCard.category}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-semibold">
                Box {currentCard.box || 1}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleStar}
                className={`p-1.5 rounded-lg border transition-colors ${
                  currentCard.isStarred
                    ? 'bg-amber-50 border-amber-300 text-amber-500 fill-amber-500'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600'
                }`}
                title="Star this card for quick review"
              >
                <Star className={`w-4 h-4 ${currentCard.isStarred ? 'fill-amber-500' : ''}`} />
              </button>

              <button
                onClick={() => handleSpeakText(isFlipped ? currentCard.back : currentCard.front)}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                title="Read card aloud"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 3D Flip Card Container */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="cursor-pointer group relative min-h-[320px] sm:min-h-[360px] rounded-3xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-amber-400 dark:hover:border-amber-500 transition-all shadow-lg hover:shadow-xl p-8 flex flex-col justify-between select-none"
          >
            {/* Top Indicator */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <RotateCw className="w-3.5 h-3.5 text-amber-500 group-hover:rotate-180 transition-transform duration-500" />
                <span>{isFlipped ? 'Answer / Insight' : 'Active Recall Prompt'}</span>
              </span>
              <span className="text-[11px] text-slate-400">
                Click or Space to Flip
              </span>
            </div>

            {/* Prompt or Answer Content */}
            <div className="py-8 text-center">
              <div
                className={`text-lg sm:text-xl font-bold leading-relaxed transition-opacity duration-200 ${
                  isFlipped
                    ? 'text-indigo-900 dark:text-indigo-100 font-sans'
                    : 'text-slate-900 dark:text-white'
                }`}
              >
                {isFlipped ? currentCard.back : currentCard.front}
              </div>
            </div>

            {/* Bottom Tag */}
            <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-100 dark:border-slate-700/80 pt-3">
              <span>Reviewed {currentCard.reviewCount || 0} times</span>
              <span className="text-amber-600 dark:text-amber-400 font-semibold">
                {isFlipped ? 'Rating bar below' : 'Flip to see explanation'}
              </span>
            </div>
          </div>

          {/* Spaced Repetition Rating Buttons */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
            <div className="text-center text-xs font-semibold text-slate-500 mb-3">
              Rate your recall (press keys 1, 2, 3, or 4):
            </div>
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={() => handleSpacedRating(1)}
                className="py-2.5 px-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 font-bold text-xs flex flex-col items-center gap-1 transition-all"
              >
                <span>[1] Again</span>
                <span className="text-[10px] font-normal opacity-75">&lt; 10m (Box 1)</span>
              </button>

              <button
                onClick={() => handleSpacedRating(2)}
                className="py-2.5 px-2 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-bold text-xs flex flex-col items-center gap-1 transition-all"
              >
                <span>[2] Hard</span>
                <span className="text-[10px] font-normal opacity-75">1 day (Box 2)</span>
              </button>

              <button
                onClick={() => handleSpacedRating(3)}
                className="py-2.5 px-2 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-bold text-xs flex flex-col items-center gap-1 transition-all"
              >
                <span>[3] Good</span>
                <span className="text-[10px] font-normal opacity-75">3 days (+1 Box)</span>
              </button>

              <button
                onClick={() => handleSpacedRating(4)}
                className="py-2.5 px-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold text-xs flex flex-col items-center gap-1 transition-all"
              >
                <span>[4] Easy</span>
                <span className="text-[10px] font-normal opacity-75">7 days (+2 Box)</span>
              </button>
            </div>
          </div>

          {/* Previous / Next Arrow Controls */}
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevCard}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1 hover:bg-slate-100 dark:hover:bg-slate-750"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous (←)</span>
            </button>

            <button
              onClick={handleNextCard}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1 hover:bg-slate-100 dark:hover:bg-slate-750"
            >
              <span>Next (→)</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center shadow-sm max-w-md mx-auto">
          <Layers className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-1">
            No Flashcards in this Selection
          </h3>
          <p className="text-xs text-slate-500 mb-6">
            Generate smart flashcards directly from your lecture slides using Gemini, or create cards manually.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
            <button
              onClick={() => onGenerateFlashcards(8)}
              disabled={isGeneratingCards}
              className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate AI Flashcards</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Manually</span>
            </button>
          </div>
        </div>
      )}

      {/* Add Card Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 max-w-lg w-full p-6 text-slate-900 dark:text-white">
            <h3 className="font-bold text-base mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-amber-500" />
              <span>Add Custom Flashcard to {activeCourse.code} (Week {currentWeek})</span>
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Card Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-2.5"
                >
                  <option value="Core Definition">Core Definition</option>
                  <option value="Formula / Theorem">Formula / Theorem</option>
                  <option value="Mechanism / Process">Mechanism / Process</option>
                  <option value="Exam Trap">Exam Trap</option>
                  <option value="Application">Application</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Front (Active Recall Prompt)
                </label>
                <textarea
                  value={newFront}
                  onChange={(e) => setNewFront(e.target.value)}
                  rows={3}
                  placeholder="e.g. Under what conditions does the Rank-Nullity Theorem guarantee an invertible square matrix?"
                  className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-2.5"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Back (Key Concept / Solution)
                </label>
                <textarea
                  value={newBack}
                  onChange={(e) => setNewBack(e.target.value)}
                  rows={4}
                  placeholder="e.g. When Nullity = 0, which implies Rank(A) = n (full column rank)."
                  className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-2.5"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleAddManualCard}
                disabled={!newFront.trim() || !newBack.trim()}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-md"
              >
                Save Flashcard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
