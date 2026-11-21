import { useState } from 'react';
import {
  Award,
  CheckCircle2,
  Home,
  MinusCircle,
  RefreshCw,
  RotateCcw,
  UserCheck,
  XCircle,
} from 'lucide-react';
import {
  AUTHOR_NAME,
  EXAM_TITLE,
  SECTION_LABELS,
  TOPIC_SHORT_LABELS,
} from '../data/questions';
import type { Question, UserAnswerMap } from '../types/quiz';
import {
  computeQuizSummary,
  getCorrectAnswerDisplay,
  getUserAnswerDisplay,
} from '../utils/quizEngine';
import { MathText } from './MathText';

type ReviewFilter = 'all' | 'wrong' | 'correct' | 'unanswered';

interface ResultsViewProps {
  questions: readonly Question[];
  answers: UserAnswerMap;
  scopeLabel: string;
  onRetryAll: () => void;
  onRetryMistakes: () => void;
  onReturnToQuiz: () => void;
  onGoHome: () => void;
}

export function ResultsView({
  questions,
  answers,
  scopeLabel,
  onRetryAll,
  onRetryMistakes,
  onReturnToQuiz,
  onGoHome,
}: ResultsViewProps) {
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>(
    questions.some((q) => answers[q.id] && !answers[q.id].isCorrect) ? 'wrong' : 'all',
  );

  const summary = computeQuizSummary(questions, answers);
  const ringRadius = 52;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset =
    ringCircumference - (summary.scorePercentage / 100) * ringCircumference;

  const reviewedItems = questions
    .map((question, index) => ({
      question,
      index,
      record: answers[question.id],
    }))
    .filter(({ record }) => {
      if (reviewFilter === 'wrong') return Boolean(record && !record.isCorrect);
      if (reviewFilter === 'correct') return Boolean(record && record.isCorrect);
      if (reviewFilter === 'unanswered') return !record;
      return true;
    });

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* Top Score Report Card */}
      <section className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 lg:p-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Ring + Grade */}
          <div className="lg:col-span-4 flex flex-col items-center text-center">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg
                className="w-full h-full -rotate-90"
                viewBox="0 0 128 128"
                aria-hidden="true"
              >
                <circle
                  cx="64"
                  cy="64"
                  r={ringRadius}
                  fill="none"
                  stroke="#E2E8F0"
                  strokeWidth="10"
                />
                <circle
                  cx="64"
                  cy="64"
                  r={ringRadius}
                  fill="none"
                  stroke={summary.scorePercentage >= 60 ? '#0F4C81' : '#B91C1C'}
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={ringCircumference}
                  strokeDashoffset={ringOffset}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-slate-900 tabular-nums">
                  {summary.scorePercentage}%
                </span>
                <span className="text-xs font-medium text-slate-500 mt-0.5">
                  {summary.gradeLabel}
                </span>
              </div>
            </div>
            <p className="mt-3 text-sm font-semibold text-slate-700 tabular-nums">
              {summary.correct} إجابة صحيحة من أصل {summary.total}
            </p>
          </div>

          {/* Details, Metrics & Author Seal */}
          <div className="lg:col-span-8 space-y-6">
            <div className="space-y-1.5">
              <p className="text-xs sm:text-sm font-medium text-slate-500">
                تقرير الأداء النهائي · {scopeLabel}
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                ملخص نتيجتك في {EXAM_TITLE}
              </h1>
            </div>

            {/* 4 Clean Numeric Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-[#ECFDF5] border border-[#A7F3D0]/80 rounded-xl p-3.5">
                <p className="text-xs text-[#065F46] font-medium">صحيحة</p>
                <p className="text-2xl font-bold text-[#047857] tabular-nums mt-1">
                  {summary.correct}
                </p>
              </div>
              <div className="bg-[#FEF2F2] border border-[#FECACA]/80 rounded-xl p-3.5">
                <p className="text-xs text-[#991B1B] font-medium">خاطئة</p>
                <p className="text-2xl font-bold text-[#B91C1C] tabular-nums mt-1">
                  {summary.wrong}
                </p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                <p className="text-xs text-slate-600 font-medium">غير مجابة</p>
                <p className="text-2xl font-bold text-slate-800 tabular-nums mt-1">
                  {summary.unanswered}
                </p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                <p className="text-xs text-slate-600 font-medium">دقة الحل</p>
                <p className="text-2xl font-bold text-[#0F4C81] tabular-nums mt-1">
                  {summary.accuracyOfAnswered}%
                </p>
              </div>
            </div>

            {/* Author Attribution Line */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2.5 text-sm text-slate-600">
                <UserCheck className="w-4 h-4 text-[#0F4C81]" aria-hidden="true" />
                <span>
                  إعداد الاختبار:{' '}
                  <strong className="font-bold text-slate-900">{AUTHOR_NAME}</strong>
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                {summary.wrong > 0 && (
                  <button
                    type="button"
                    onClick={onRetryMistakes}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2.5 text-sm font-semibold text-white bg-[#0F4C81] hover:bg-[#0B3B66] rounded-xl transition-colors whitespace-nowrap"
                  >
                    <RefreshCw className="w-4 h-4" aria-hidden="true" />
                    <span>اختبار الأخطاء فقط ({summary.wrong})</span>
                  </button>
                )}
                {summary.unanswered > 0 && (
                  <button
                    type="button"
                    onClick={onReturnToQuiz}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2.5 text-sm font-semibold text-[#0F4C81] bg-[#0F4C81]/10 hover:bg-[#0F4C81]/15 rounded-xl transition-colors whitespace-nowrap"
                  >
                    <span>متابعة الأسئلة المتبقية</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={onRetryAll}
                  className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-colors whitespace-nowrap"
                >
                  <RotateCcw className="w-4 h-4" aria-hidden="true" />
                  <span>إعادة الاختبار</span>
                </button>
                <button
                  type="button"
                  onClick={onGoHome}
                  className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl transition-colors whitespace-nowrap"
                >
                  <Home className="w-4 h-4" aria-hidden="true" />
                  <span>الرئيسية</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section & Topic Breakdown Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {summary.bySection.length > 0 && (
          <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-6">
            <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Award className="w-4 h-4 text-[#0F4C81]" aria-hidden="true" />
              <span>الأداء حسب القسم</span>
            </h2>
            <div className="space-y-4">
              {summary.bySection.map((sec) => (
                <div key={sec.section} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-slate-800">{sec.label}</span>
                    <span className="text-slate-600 tabular-nums">
                      {sec.correct} / {sec.total} ({sec.accuracy}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#0F4C81] rounded-full"
                      style={{ width: `${sec.accuracy}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div
          className={`${
            summary.bySection.length > 0 ? 'lg:col-span-7' : 'lg:col-span-12'
          } bg-white border border-slate-200/90 rounded-2xl p-6`}
        >
          <h2 className="text-base font-bold text-slate-900 mb-4">
            الأداء حسب المحور الدراسي
          </h2>
          <div className="space-y-4">
            {summary.byTopic.map((item) => (
              <div key={item.topic} className="space-y-1.5">
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="font-medium text-slate-800 truncate">
                    <MathText
                      text={item.label}
                      monoClassName="font-sans font-medium text-inherit"
                    />
                  </span>
                  <span className="text-slate-600 tabular-nums shrink-0">
                    {item.correct} / {item.total} ({item.accuracy}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      item.accuracy >= 70 ? 'bg-[#047857]' : 'bg-[#0F4C81]'
                    }`}
                    style={{ width: `${item.accuracy}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed Answer Review Section */}
      <section className="mt-8" aria-labelledby="review-heading">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h2 id="review-heading" className="text-lg sm:text-xl font-bold text-slate-900">
            مراجعة الإجابات والتصحيح
          </h2>

          {/* Interactive Filter Segmented Control */}
          <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-xl overflow-x-auto">
            {(
              [
                { id: 'all', label: `الكل (${summary.total})` },
                { id: 'wrong', label: `الأخطاء (${summary.wrong})` },
                { id: 'correct', label: `الصحيحة (${summary.correct})` },
                { id: 'unanswered', label: `غير مجابة (${summary.unanswered})` },
              ] as { id: ReviewFilter; label: string }[]
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setReviewFilter(tab.id)}
                className={`min-h-[36px] px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 tabular-nums ${
                  reviewFilter === tab.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {reviewedItems.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500 text-sm">
            لا توجد أسئلة في هذا التصنيف.
          </div>
        ) : (
          <div className="space-y-3">
            {reviewedItems.map(({ question, index, record }) => {
              const isCorrect = record?.isCorrect === true;
              const isWrong = record?.isCorrect === false;

              return (
                <article
                  key={question.id}
                  className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                    <span className="tabular-nums">
                      السؤال {index + 1} · {SECTION_LABELS[question.section]} ·{' '}
                      {TOPIC_SHORT_LABELS[question.topic]}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 font-semibold ${
                        isCorrect
                          ? 'text-[#047857]'
                          : isWrong
                            ? 'text-[#B91C1C]'
                            : 'text-slate-500'
                      }`}
                    >
                      {isCorrect ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                          <span>إجابة صحيحة</span>
                        </>
                      ) : isWrong ? (
                        <>
                          <XCircle className="w-4 h-4" aria-hidden="true" />
                          <span>إجابة خاطئة</span>
                        </>
                      ) : (
                        <>
                          <MinusCircle className="w-4 h-4" aria-hidden="true" />
                          <span>لم تتم الإجابة</span>
                        </>
                      )}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-relaxed">
                    <MathText text={question.prompt} />
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-sm">
                    <div
                      className={`rounded-xl border px-3.5 py-2.5 ${
                        isCorrect
                          ? 'bg-[#ECFDF5] border-[#A7F3D0] text-[#064E3B]'
                          : isWrong
                            ? 'bg-[#FEF2F2] border-[#FECACA] text-[#7F1D1D]'
                            : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      <span className="text-xs opacity-75 block mb-0.5">إجابتك</span>
                      <span className="font-semibold">
                        <MathText
                          text={getUserAnswerDisplay(question, record)}
                          monoClassName="font-mono font-semibold text-inherit tabular-nums"
                        />
                      </span>
                    </div>

                    <div className="rounded-xl border bg-[#F8FAFC] border-slate-200 text-slate-900 px-3.5 py-2.5">
                      <span className="text-xs text-slate-500 block mb-0.5">
                        الإجابة الصحيحة
                      </span>
                      <span className="font-semibold text-[#047857]">
                        <MathText
                          text={getCorrectAnswerDisplay(question)}
                          monoClassName="font-mono font-semibold text-inherit tabular-nums"
                        />
                      </span>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1">
                    <strong className="text-slate-800">التوضيح: </strong>
                    <MathText
                      text={question.explanation}
                      monoClassName="font-mono font-semibold text-[#0F4C81] tabular-nums"
                    />
                  </p>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
