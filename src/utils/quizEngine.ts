import {
  ALL_QUESTIONS,
  SECTION_LABELS,
  TOPIC_LABELS,
  TOPIC_ORDER,
} from '../data/questions';
import type {
  Question,
  QuestionSection,
  QuizScope,
  QuizSummaryStats,
  SectionBreakdown,
  TopicBreakdown,
  UserAnswerMap,
  UserAnswerRecord,
  UserAnswerValue,
} from '../types/quiz';

export const ARABIC_OPTION_LETTERS = ['أ', 'ب', 'ج', 'د'] as const;

export const STORAGE_KEY = 'it_fundamentals_exam_aboghaffa_v1';

export interface PersistedExamState {
  scope: QuizScope;
  shuffle: boolean;
  questionIds: number[];
  currentIndex: number;
  answers: UserAnswerMap;
}

export function evaluateAnswer(question: Question, value: UserAnswerValue): boolean {
  if (question.section === 'true_false') {
    return typeof value === 'boolean' && value === question.correctAnswer;
  }
  return typeof value === 'number' && value === question.correctIndex;
}

export function getCorrectAnswerDisplay(question: Question): string {
  if (question.section === 'true_false') {
    return question.correctAnswer ? 'صح' : 'خطأ';
  }
  const letter = ARABIC_OPTION_LETTERS[question.correctIndex];
  return `${letter}) ${question.options[question.correctIndex]}`;
}

export function getUserAnswerDisplay(
  question: Question,
  record: UserAnswerRecord | undefined,
): string {
  if (!record) return 'لم تتم الإجابة';
  if (question.section === 'true_false') {
    return record.value === true ? 'صح' : 'خطأ';
  }
  if (typeof record.value === 'number' && question.options[record.value]) {
    return `${ARABIC_OPTION_LETTERS[record.value]}) ${question.options[record.value]}`;
  }
  return 'لم تتم الإجابة';
}

export function deterministicShuffle<T>(items: readonly T[], seed: number): T[] {
  const result = [...items];
  let state = (seed >>> 0) || 1;
  for (let i = result.length - 1; i > 0; i--) {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    const j = state % (i + 1);
    const tmp = result[i];
    result[i] = result[j];
    result[j] = tmp;
  }
  return result;
}

export function selectQuestionsForScope(
  scope: QuizScope,
  answers?: UserAnswerMap,
  options?: { shuffle?: boolean; seed?: number },
): Question[] {
  let filtered: Question[];

  if (scope === 'all') {
    filtered = [...ALL_QUESTIONS];
  } else if (scope === 'true_false' || scope === 'multiple_choice') {
    filtered = ALL_QUESTIONS.filter((q) => q.section === scope);
  } else if (scope === 'mistakes') {
    const wrongIds = new Set(
      Object.values(answers ?? {})
        .filter((rec) => !rec.isCorrect)
        .map((rec) => rec.questionId),
    );
    filtered = ALL_QUESTIONS.filter((q) => wrongIds.has(q.id));
  } else {
    filtered = ALL_QUESTIONS.filter((q) => q.topic === scope);
  }

  if (options?.shuffle) {
    return deterministicShuffle(filtered, options.seed ?? Date.now());
  }
  return filtered;
}

export function getGradeLabel(scorePercentage: number): string {
  if (scorePercentage >= 90) return 'ممتاز';
  if (scorePercentage >= 80) return 'جيد جداً';
  if (scorePercentage >= 70) return 'جيد';
  if (scorePercentage >= 60) return 'مقبول';
  return 'يحتاج إلى مراجعة';
}

export function computeQuizSummary(
  questions: readonly Question[],
  answers: UserAnswerMap,
): QuizSummaryStats {
  const total = questions.length;
  let answered = 0;
  let correct = 0;
  let wrong = 0;

  for (const q of questions) {
    const rec = answers[q.id];
    if (rec) {
      answered++;
      if (rec.isCorrect) correct++;
      else wrong++;
    }
  }

  const unanswered = Math.max(0, total - answered);
  const accuracyOfAnswered = answered > 0 ? Math.round((correct / answered) * 100) : 0;
  const scorePercentage = total > 0 ? Math.round((correct / total) * 100) : 0;

  const sections: QuestionSection[] = ['true_false', 'multiple_choice'];
  const bySection: SectionBreakdown[] = sections
    .map((sec) => {
      const subset = questions.filter((q) => q.section === sec);
      let sAnswered = 0;
      let sCorrect = 0;
      for (const q of subset) {
        const rec = answers[q.id];
        if (rec) {
          sAnswered++;
          if (rec.isCorrect) sCorrect++;
        }
      }
      return {
        section: sec,
        label: SECTION_LABELS[sec],
        total: subset.length,
        answered: sAnswered,
        correct: sCorrect,
        wrong: sAnswered - sCorrect,
        accuracy: subset.length > 0 ? Math.round((sCorrect / subset.length) * 100) : 0,
      };
    })
    .filter((entry) => entry.total > 0);

  const byTopic: TopicBreakdown[] = TOPIC_ORDER.map((topic) => {
    const subset = questions.filter((q) => q.topic === topic);
    let tAnswered = 0;
    let tCorrect = 0;
    for (const q of subset) {
      const rec = answers[q.id];
      if (rec) {
        tAnswered++;
        if (rec.isCorrect) tCorrect++;
      }
    }
    return {
      topic,
      label: TOPIC_LABELS[topic],
      total: subset.length,
      answered: tAnswered,
      correct: tCorrect,
      wrong: tAnswered - tCorrect,
      accuracy: subset.length > 0 ? Math.round((tCorrect / subset.length) * 100) : 0,
    };
  }).filter((entry) => entry.total > 0);

  return {
    total,
    answered,
    unanswered,
    correct,
    wrong,
    accuracyOfAnswered,
    scorePercentage,
    gradeLabel: getGradeLabel(scorePercentage),
    bySection,
    byTopic,
  };
}

export function getScopeLabel(scope: QuizScope): string {
  switch (scope) {
    case 'all':
      return 'الاختبار الشامل (100 سؤال)';
    case 'true_false':
      return 'القسم الأول: صح وخطأ (50 سؤالاً)';
    case 'multiple_choice':
      return 'القسم الثاني: اختيار من متعدد (50 سؤالاً)';
    case 'mistakes':
      return 'مراجعة الأسئلة الخاطئة';
    default:
      return TOPIC_LABELS[scope];
  }
}

export interface TextSegment {
  text: string;
  isMath: boolean;
}

/**
 * Splits Arabic technical prose into plain Arabic segments and LTR monospace
 * math/binary/hex tokens (e.g., "101 - 10", "11010001", "8D9", "1's", "A15").
 */
export function tokenizeMathSegments(input: string): TextSegment[] {
  // Matches binary/hex/numeric expressions, operators, or English complement terms
  const regex =
    /(?:[12]'s(?:\s+Complement)?|[0-9A-F]{2,}(?:\s*[+\-×÷=^]\s*[0-9A-F]+)*|\b[0-9]+(?:\s*[+\-×÷=^]\s*[0-9]+)+|\([A-F0-9]+\)|\b[A-F]\b)/g;

  const segments: TextSegment[] = [];
  let lastIndex = 0;

  for (const match of input.matchAll(regex)) {
    const idx = match.index ?? 0;
    if (idx > lastIndex) {
      segments.push({ text: input.slice(lastIndex, idx), isMath: false });
    }
    segments.push({ text: match[0], isMath: true });
    lastIndex = idx + match[0].length;
  }

  if (lastIndex < input.length) {
    segments.push({ text: input.slice(lastIndex), isMath: false });
  }

  return segments.length > 0 ? segments : [{ text: input, isMath: false }];
}

export function parsePersistedState(raw: string | null): PersistedExamState | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<PersistedExamState>;
    if (
      !parsed ||
      !Array.isArray(parsed.questionIds) ||
      parsed.questionIds.length === 0 ||
      typeof parsed.currentIndex !== 'number' ||
      typeof parsed.answers !== 'object' ||
      parsed.answers === null
    ) {
      return null;
    }

    const validIdSet = new Set(ALL_QUESTIONS.map((q) => q.id));
    const questionIds = parsed.questionIds.filter(
      (id): id is number => typeof id === 'number' && validIdSet.has(id),
    );
    if (questionIds.length === 0) return null;

    const currentIndex = Math.max(0, Math.min(parsed.currentIndex, questionIds.length - 1));
    return {
      scope: parsed.scope ?? 'all',
      shuffle: Boolean(parsed.shuffle),
      questionIds,
      currentIndex,
      answers: parsed.answers,
    };
  } catch {
    return null;
  }
}

export function resolveQuestionsByIds(ids: readonly number[]): Question[] {
  const map = new Map(ALL_QUESTIONS.map((q) => [q.id, q]));
  return ids.map((id) => map.get(id)).filter((q): q is Question => Boolean(q));
}
