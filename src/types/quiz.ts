export type QuestionSection = 'true_false' | 'multiple_choice';

export type QuestionTopic =
  | 'arithmetic'
  | 'complements'
  | 'mul_div'
  | 'conversions';

export type QuizScope =
  | 'all'
  | 'true_false'
  | 'multiple_choice'
  | 'arithmetic'
  | 'complements'
  | 'mul_div'
  | 'conversions'
  | 'mistakes';

export interface TrueFalseQuestion {
  id: number;
  section: 'true_false';
  topic: QuestionTopic;
  prompt: string;
  correctAnswer: boolean;
  explanation: string;
}

export interface MultipleChoiceQuestion {
  id: number;
  section: 'multiple_choice';
  topic: QuestionTopic;
  prompt: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  explanation: string;
}

export type Question = TrueFalseQuestion | MultipleChoiceQuestion;

export type UserAnswerValue = boolean | number;

export interface UserAnswerRecord {
  questionId: number;
  value: UserAnswerValue;
  isCorrect: boolean;
  answeredAt: number;
}

export type UserAnswerMap = Record<number, UserAnswerRecord>;

export interface TopicBreakdown {
  topic: QuestionTopic;
  label: string;
  total: number;
  answered: number;
  correct: number;
  wrong: number;
  accuracy: number;
}

export interface SectionBreakdown {
  section: QuestionSection;
  label: string;
  total: number;
  answered: number;
  correct: number;
  wrong: number;
  accuracy: number;
}

export interface QuizSummaryStats {
  total: number;
  answered: number;
  unanswered: number;
  correct: number;
  wrong: number;
  accuracyOfAnswered: number;
  scorePercentage: number;
  gradeLabel: string;
  bySection: SectionBreakdown[];
  byTopic: TopicBreakdown[];
}

export type AppView = 'home' | 'quiz' | 'results';
