import { Course, QuizAttempt, WeeklyInsightReport } from '../types';
import { INITIAL_COURSES, INITIAL_QUIZ_ATTEMPTS, INITIAL_WEEKLY_REPORT } from '../data/initialData';

const STORAGE_KEYS = {
  COURSES: 'septemstudy_courses_v3',
  QUIZ_ATTEMPTS: 'septemstudy_quiz_attempts_v3',
  WEEKLY_REPORTS: 'septemstudy_weekly_reports_v3',
  CURRENT_WEEK: 'septemstudy_current_week_v3',
  ACTIVE_COURSE: 'septemstudy_active_course_v3',
};

export function loadCourses(): Course[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.COURSES);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length >= 6) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load courses from localStorage', e);
  }
  return INITIAL_COURSES;
}

export function saveCourses(courses: Course[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
  } catch (e) {
    console.error('Failed to save courses to localStorage', e);
  }
}

export function loadQuizAttempts(): QuizAttempt[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.QUIZ_ATTEMPTS);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Failed to load quiz attempts', e);
  }
  return INITIAL_QUIZ_ATTEMPTS;
}

export function saveQuizAttempts(attempts: QuizAttempt[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.QUIZ_ATTEMPTS, JSON.stringify(attempts));
  } catch (e) {
    console.error('Failed to save quiz attempts', e);
  }
}

export function loadWeeklyReports(): Record<number, WeeklyInsightReport> {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.WEEKLY_REPORTS);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Failed to load weekly reports', e);
  }
  return { 1: INITIAL_WEEKLY_REPORT };
}

export function saveWeeklyReports(reports: Record<number, WeeklyInsightReport>): void {
  try {
    localStorage.setItem(STORAGE_KEYS.WEEKLY_REPORTS, JSON.stringify(reports));
  } catch (e) {
    console.error('Failed to save weekly reports', e);
  }
}

export function loadCurrentWeek(): number {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_WEEK);
    if (data) {
      return Number(data) || 1;
    }
  } catch (e) {
    console.error(e);
  }
  return 1;
}

export function saveCurrentWeek(week: number): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_WEEK, String(week));
  } catch (e) {
    console.error(e);
  }
}

export function exportStudyData(): string {
  const exportPayload = {
    courses: loadCourses(),
    quizAttempts: loadQuizAttempts(),
    weeklyReports: loadWeeklyReports(),
    currentWeek: loadCurrentWeek(),
    exportedAt: new Date().toISOString(),
  };
  return JSON.stringify(exportPayload, null, 2);
}

export function importStudyData(jsonString: string): boolean {
  try {
    const parsed = JSON.parse(jsonString);
    if (parsed.courses && Array.isArray(parsed.courses)) {
      saveCourses(parsed.courses);
      if (parsed.quizAttempts) saveQuizAttempts(parsed.quizAttempts);
      if (parsed.weeklyReports) saveWeeklyReports(parsed.weeklyReports);
      if (parsed.currentWeek) saveCurrentWeek(parsed.currentWeek);
      return true;
    }
  } catch (e) {
    console.error('Failed to import data', e);
  }
  return false;
}

export function resetToDefaults(): void {
  saveCourses(INITIAL_COURSES);
  saveQuizAttempts(INITIAL_QUIZ_ATTEMPTS);
  saveWeeklyReports({ 1: INITIAL_WEEKLY_REPORT });
  saveCurrentWeek(1);
}
