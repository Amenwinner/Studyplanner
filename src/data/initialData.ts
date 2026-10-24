import { Course, QuizAttempt, WeeklyInsightReport, WeeklyModule } from '../types';

function createEmptyWeeks(totalWeeks = 14): WeeklyModule[] {
  return Array.from({ length: totalWeeks }, (_, i) => ({
    weekNumber: i + 1,
    topicTitle: `Week ${i + 1} Lecture Material`,
    slidesRaw: '',
    slidesCount: 0,
    quizzes: [],
    flashcards: [],
    studyMinutes: 0,
  }));
}

export const INITIAL_COURSES: Course[] = [
  {
    id: 'course-1',
    code: 'CRS 101',
    name: 'Course 1 (Click to Customize)',
    department: 'Core Subject',
    color: 'blue',
    iconName: 'BookOpen',
    professor: 'Professor',
    targetWeeklyHours: 4,
    weeks: createEmptyWeeks(14),
  },
  {
    id: 'course-2',
    code: 'CRS 102',
    name: 'Course 2 (Click to Customize)',
    department: 'Elective',
    color: 'emerald',
    iconName: 'Code',
    professor: 'Professor',
    targetWeeklyHours: 4,
    weeks: createEmptyWeeks(14),
  },
  {
    id: 'course-3',
    code: 'CRS 103',
    name: 'Course 3 (Click to Customize)',
    department: 'Quantitative',
    color: 'amber',
    iconName: 'TrendingUp',
    professor: 'Professor',
    targetWeeklyHours: 4,
    weeks: createEmptyWeeks(14),
  },
  {
    id: 'course-4',
    code: 'CRS 104',
    name: 'Course 4 (Click to Customize)',
    department: 'Theory / Lab',
    color: 'violet',
    iconName: 'Cpu',
    professor: 'Professor',
    targetWeeklyHours: 3,
    weeks: createEmptyWeeks(14),
  },
  {
    id: 'course-5',
    code: 'CRS 105',
    name: 'Course 5 (Click to Customize)',
    department: 'Seminar',
    color: 'rose',
    iconName: 'Layers',
    professor: 'Professor',
    targetWeeklyHours: 3,
    weeks: createEmptyWeeks(14),
  },
  {
    id: 'course-6',
    code: 'CRS 106',
    name: 'Course 6 (Click to Customize)',
    department: 'Applied Project',
    color: 'cyan',
    iconName: 'Award',
    professor: 'Professor',
    targetWeeklyHours: 3,
    weeks: createEmptyWeeks(14),
  },
];

export const INITIAL_QUIZ_ATTEMPTS: QuizAttempt[] = [];

export const INITIAL_WEEKLY_REPORT: WeeklyInsightReport = {
  overallScoreGrade: 'Pending',
  weeklyHeadline: 'Ready for your weekly slide uploads and revision!',
  summary: 'Upload or paste your lecture slides for any course this week. All quiz questions, flashcards, and topic summaries will be generated dynamically and strictly derived from the slides you provide.',
  strongestCourses: [],
  atRiskCourses: [],
  recommendedStudySplit: [],
  weeklyStudyTip: 'Active recall: Testing yourself immediately after reading slides yields higher retention than passive re-reading.',
  generatedAt: new Date().toISOString(),
};
