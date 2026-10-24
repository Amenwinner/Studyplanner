import React, { useState } from 'react';
import { Course, TopicSummary } from '../types';
import { COURSE_THEMES, getCourseIcon } from '../lib/courseTheme';
import {
  FileText,
  Sparkles,
  Download,
  Printer,
  Copy,
  Check,
  AlertOctagon,
  BookMarked,
  Sigma,
  Zap,
  ArrowRight
} from 'lucide-react';

interface SummaryViewProps {
  course: Course;
  currentWeek: number;
  onGenerateSummary: () => Promise<void>;
  isGeneratingSummary: boolean;
  onNavigateTab: (tab: any) => void;
}

export const SummaryView: React.FC<SummaryViewProps> = ({
  course,
  currentWeek,
  onGenerateSummary,
  isGeneratingSummary,
  onNavigateTab,
}) => {
  const theme = COURSE_THEMES[course.color] || COURSE_THEMES.blue;
  const Icon = getCourseIcon(course.iconName);
  const weekModule = course.weeks.find((w) => w.weekNumber === currentWeek);
  const summary = weekModule?.summary;

  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopyBullet = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleExportMarkdown = () => {
    if (!summary) return;
    const md = `# ${course.code} - Week ${currentWeek}: ${summary.title}
Course: ${course.name} | Professor: ${course.professor}

## Executive Summary
${summary.executiveSummary}

## Key Takeaways
${summary.keyTakeaways?.map((k) => `- ${k}`).join('\n')}

## Core Definitions
${summary.coreDefinitions?.map((d) => `### ${d.term} (${d.importance})\n${d.definition}`).join('\n\n')}

## Formulas, Theorems & Mechanisms
${summary.formulasOrTheorems?.map((f) => `### ${f.name}\n\`${f.formulaOrRule}\`\n${f.explanation}`).join('\n\n')}

## Exam Watchouts & Pitfalls
${summary.examWatchouts?.map((e) => `- ⚠️ ${e}`).join('\n')}

## Quick Cheat Sheet
${summary.cheatSheetBullets?.map((b) => `- ${b}`).join('\n')}
`;

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${course.code.replace(/\s+/g, '_')}_Week${currentWeek}_Summary.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12 print:p-0">
      {/* Header bar */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${theme.badge} border shadow-sm`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base text-slate-900 dark:text-white">
                  {course.code} &bull; Week {currentWeek} Summary
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                  {course.name}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Topic: {summary?.title || weekModule?.topicTitle || `Week ${currentWeek} Material`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {summary && (
              <>
                <button
                  onClick={handleExportMarkdown}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-650 text-slate-700 dark:text-slate-200 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
                  title="Export Markdown File"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Markdown</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-650 text-slate-700 dark:text-slate-200 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
                  title="Print Summary / Save PDF"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
              </>
            )}

            <button
              onClick={() => onGenerateSummary()}
              disabled={isGeneratingSummary || !weekModule?.slidesRaw?.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isGeneratingSummary ? 'Synthesizing...' : summary ? 'Regenerate Summary' : 'Generate Summary'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {summary ? (
        <div className="space-y-6">
          {/* Executive Summary Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <BookMarked className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>Executive Lecture Synthesis</span>
            </h2>
            <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
              {summary.executiveSummary}
            </div>
          </div>

          {/* Key Takeaways */}
          {summary.keyTakeaways && summary.keyTakeaways.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                <span>High-Yield Core Takeaways</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {summary.keyTakeaways.map((takeaway, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-750 flex items-start justify-between gap-3 text-xs leading-relaxed group"
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center shrink-0 mt-0.5 text-[10px]">
                        {idx + 1}
                      </span>
                      <p className="text-slate-700 dark:text-slate-300 font-medium">{takeaway}</p>
                    </div>
                    <button
                      onClick={() => handleCopyBullet(takeaway, idx)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                      title="Copy Takeaway"
                    >
                      {copiedIndex === idx ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Core Definitions & Vocabulary Glossary */}
          {summary.coreDefinitions && summary.coreDefinitions.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>Definitions & Operational Vocabulary</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {summary.coreDefinitions.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-750 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                          {item.term}
                        </h4>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                            item.importance === 'high'
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                              : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {item.importance} Yield
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {item.definition}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Formulas, Theorems & Mechanisms */}
          {summary.formulasOrTheorems && summary.formulasOrTheorems.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Sigma className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span>Theorems, Formulas & Governing Mechanisms</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {summary.formulasOrTheorems.map((form, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50"
                  >
                    <h4 className="font-bold text-xs text-indigo-900 dark:text-indigo-200 mb-1">
                      {form.name}
                    </h4>
                    <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800/60 font-mono text-xs text-indigo-700 dark:text-indigo-300 font-semibold mb-2 overflow-x-auto">
                      {form.formulaOrRule}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {form.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Exam Watchouts & Common Pitfalls */}
          {summary.examWatchouts && summary.examWatchouts.length > 0 && (
            <div className="bg-rose-50/70 dark:bg-rose-950/20 rounded-2xl border border-rose-200 dark:border-rose-900/50 p-6 shadow-sm">
              <h2 className="text-base font-bold text-rose-900 dark:text-rose-200 mb-3 flex items-center gap-2">
                <AlertOctagon className="w-5 h-5 text-rose-600" />
                <span>Frequent Exam Traps & Conceptual Pitfalls</span>
              </h2>
              <ul className="space-y-2.5 text-xs text-rose-800 dark:text-rose-300">
                {summary.examWatchouts.map((pitfall, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                    <span>{pitfall}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 5-Minute Quick Cheat Sheet */}
          {summary.cheatSheetBullets && summary.cheatSheetBullets.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <Zap className="w-5 h-5 text-indigo-500" />
                <span>5-Minute Quick Exam Cheat Sheet</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {summary.cheatSheetBullets.map((bullet, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-750 flex items-start gap-2 text-slate-700 dark:text-slate-300"
                  >
                    <span className="text-indigo-500 font-bold">&bull;</span>
                    <span>{bullet}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Next Steps CTA */}
          <div className="flex items-center justify-between p-4 bg-slate-100 dark:bg-slate-800/80 rounded-xl print:hidden">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Ready to test your retention on these lecture topics?
            </span>
            <button
              onClick={() => onNavigateTab('quiz')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-sm"
            >
              <span>Take Week {currentWeek} Quiz</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center shadow-sm">
          <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-1">
            No Topic Summary Yet for Week {currentWeek}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
            Click the button below to have Gemini synthesize this week's slides into an executive overview, high-yield takeaways, definitions, and exam traps.
          </p>
          <button
            onClick={() => onGenerateSummary()}
            disabled={isGeneratingSummary || !weekModule?.slidesRaw?.trim()}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs inline-flex items-center gap-2 shadow-md transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isGeneratingSummary ? 'Analyzing Slides...' : 'Generate AI Topic Summary'}</span>
          </button>
        </div>
      )}
    </div>
  );
};
