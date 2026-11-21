import { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Flag,
  X,
  XCircle,
} from 'lucide-react';
import {
  AUTHOR_NAME,
  SECTION_LABELS,
  TOPIC_SHORT_LABELS,
} from '../data/questions';
import type { Question, UserAnswerMap, UserAnswerValue } from '../types/quiz';
import {
  ARABIC_OPTION_LETTERS,
  getCorrectAnswerDisplay,
} from '../utils/quizEngine';
import { MathText } from './MathText';
import { QuestionNavigator } from './QuestionNavigator';

interface QuizViewProps {
  questions: readonly Question[];
  currentIndex: number;
  answers: UserAnswerMap;
  scopeLabel: string;
  isNavigatorOpen: boolean;
  onCloseNavigator: () => void;
  onAnswer: (question: Question, value: UserAnswerValue) => void;
  onGoToIndex: (index: number) => void;
  onNext: () => void;
  onPrev: () => void;
  onFinishExam: () => void;
}

export function QuizView({
  questions,
  currentIndex,
  answers,
  scopeLabel,
  isNavigatorOpen,
  onCloseNavigator,
  onAnswer,
  onGoToIndex,
  onNext,
  onPrev,
  onFinishExam,
}: QuizViewProps) {
  const question = questions[currentIndex];
  const record = question ? answers[question.id] : undefined;
  const isAnswered = Boolean(record);
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === questions.length - 1;

  const answeredCount = questions.reduce(
    (acc, q) => acc + (answers[q.id] ? 1 : 0),
    0,
  );
  const progressPercent =
    questions.length > 0 ? Math.round(((currentIndex + 1) / questions.length) * 100) : 0;

  // Keyboard navigation on desktop (Enter / ArrowLeft for next in RTL, ArrowRight for prev)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isNavigatorOpen || !question) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === 'Enter' && isAnswered) {
        e.preventDefault();
        if (isLast) onFinishExam();
        else onNext();
      } else if (e.key === 'ArrowLeft' && !isLast) {
        e.preventDefault();
        onNext();
      } else if (e.key === 'ArrowRight' && !isFirst) {
        e.preventDefault();
        onPrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isNavigatorOpen, question, isAnswered, isFirst, isLast, onNext, onPrev, onFinishExam]);

  if (!question) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-slate-600">لا توجد أسئلة متاحة في هذا القسم.</p>
      </main>
    );
  }

  return (
    <>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-7 pb-24 lg:pb-12">
        {/* Top Progress Track & Unboxed Context Header */}
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center justify-between gap-2 text-xs sm:text-sm text-slate-500 mb-2">
            <span className="truncate font-medium text-slate-600">{scopeLabel}</span>
            <span className="tabular-nums shrink-0 font-semibold text-slate-800">
              السؤال {currentIndex + 1} من {questions.length}
            </span>
          </div>
          <div
            className="w-full h-1.5 bg-slate-200/80 rounded-full overflow-hidden"
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="نسبة التقدم في الاختبار"
          >
            <div
              className="h-full bg-[#0F4C81] rounded-full transition-transform duration-200 origin-right"
              style={{ transform: `scaleX(${progressPercent / 100})` }}
            />
          </div>
        </div>

        {/* 2-Column Desktop Layout / Single-Column Mobile Ergonomic Stage */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Primary Question Stage (Right 8 Cols in RTL) */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait" initial={false}>
              <motion.article
                key={question.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.14, ease: [0.16, 1, 0.3, 1] }}
                className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-8"
              >
                {/* Unboxed Metadata Breadcrumb (Zero Pills) */}
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm text-slate-500 mb-4 pb-3.5 border-b border-slate-100">
                  <span className="font-semibold text-[#0F4C81]">
                    {SECTION_LABELS[question.section]}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{TOPIC_SHORT_LABELS[question.topic]}</span>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">رقم #{question.id}</span>
                </div>

                {/* Question Prompt */}
                <h1 className="text-lg sm:text-2xl font-bold text-slate-900 leading-relaxed mb-6 sm:mb-7">
                  <MathText text={question.prompt} />
                </h1>

                {/* Answer Options — True / False */}
                {question.section === 'true_false' ? (
                  <div
                    className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4"
                    role="group"
                    aria-label="خيارات الإجابة"
                  >
                    {(
                      [
                        { value: true, label: 'صح', hint: 'العبارة صحيحة' },
                        { value: false, label: 'خطأ', hint: 'العبارة غير صحيحة' },
                      ] as const
                    ).map((opt) => {
                      const isSelected = record?.value === opt.value;
                      const isCorrectOption = question.correctAnswer === opt.value;

                      let cardStyle =
                        'bg-white border-slate-200 hover:border-[#0F4C81] hover:bg-slate-50/70 text-slate-900';
                      let iconBg = 'bg-slate-100 text-slate-600';
                      let statusLabel: string | null = null;

                      if (isAnswered) {
                        if (isCorrectOption) {
                          cardStyle =
                            'bg-[#ECFDF5] border-[#047857] text-[#064E3B]';
                          iconBg = 'bg-[#047857] text-white';
                          statusLabel = isSelected ? 'إجابتك الصحيحة' : 'الإجابة الصحيحة';
                        } else if (isSelected && !isCorrectOption) {
                          cardStyle =
                            'bg-[#FEF2F2] border-[#B91C1C] text-[#7F1D1D]';
                          iconBg = 'bg-[#B91C1C] text-white';
                          statusLabel = 'إجابتك';
                        } else {
                          cardStyle =
                            'bg-slate-50/60 border-slate-200/70 text-slate-400';
                          iconBg = 'bg-slate-100 text-slate-400';
                        }
                      }

                      return (
                        <button
                          key={String(opt.value)}
                          type="button"
                          disabled={isAnswered}
                          onClick={() => onAnswer(question, opt.value)}
                          className={`min-h-[72px] sm:min-h-[84px] p-4 sm:p-5 rounded-2xl border-2 text-right flex items-center justify-between gap-3 transition-transform active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F4C81] focus-visible:ring-offset-2 ${cardStyle} ${
                            isAnswered ? 'cursor-default' : 'cursor-pointer'
                          }`}
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <span
                              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}
                              aria-hidden="true"
                            >
                              {opt.value ? (
                                <Check className="w-5 h-5 stroke-[2.5]" />
                              ) : (
                                <X className="w-5 h-5 stroke-[2.5]" />
                              )}
                            </span>
                            <div className="min-w-0">
                              <span className="block text-lg font-bold leading-tight">
                                {opt.label}
                              </span>
                              <span className="block text-xs opacity-75 mt-0.5">
                                {statusLabel ?? opt.hint}
                              </span>
                            </div>
                          </div>

                          {isAnswered && isCorrectOption && (
                            <CheckCircle2
                              className="w-6 h-6 text-[#047857] shrink-0"
                              aria-hidden="true"
                            />
                          )}
                          {isAnswered && isSelected && !isCorrectOption && (
                            <XCircle
                              className="w-6 h-6 text-[#B91C1C] shrink-0"
                              aria-hidden="true"
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  /* Answer Options — Multiple Choice */
                  <div
                    className="space-y-3"
                    role="group"
                    aria-label="خيارات الاختيار من متعدد"
                  >
                    {question.options.map((optionText, idx) => {
                      const isSelected = record?.value === idx;
                      const isCorrectOption = question.correctIndex === idx;
                      const letter = ARABIC_OPTION_LETTERS[idx];

                      let cardStyle =
                        'bg-white border-slate-200 hover:border-[#0F4C81] hover:bg-slate-50/70 text-slate-900';
                      let letterStyle =
                        'bg-slate-100 text-slate-700 border border-slate-200/80';
                      let stateTag: string | null = null;

                      if (isAnswered) {
                        if (isCorrectOption) {
                          cardStyle =
                            'bg-[#ECFDF5] border-[#047857] text-[#064E3B]';
                          letterStyle =
                            'bg-[#047857] text-white border border-[#047857]';
                          stateTag = isSelected ? 'إجابة صحيحة' : 'الإجابة الصحيحة';
                        } else if (isSelected && !isCorrectOption) {
                          cardStyle =
                            'bg-[#FEF2F2] border-[#B91C1C] text-[#7F1D1D]';
                          letterStyle =
                            'bg-[#B91C1C] text-white border border-[#B91C1C]';
                          stateTag = 'إجابتك';
                        } else {
                          cardStyle =
                            'bg-slate-50/60 border-slate-200/70 text-slate-400';
                          letterStyle =
                            'bg-slate-100 text-slate-400 border border-slate-200/60';
                        }
                      }

                      return (
                        <button
                          key={idx}
                          type="button"
                          disabled={isAnswered}
                          onClick={() => onAnswer(question, idx)}
                          className={`w-full min-h-[60px] px-4 py-3.5 sm:px-5 sm:py-4 rounded-2xl border-2 text-right flex items-center justify-between gap-3 transition-transform active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F4C81] focus-visible:ring-offset-2 ${cardStyle} ${
                            isAnswered ? 'cursor-default' : 'cursor-pointer'
                          }`}
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <span
                              className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${letterStyle}`}
                            >
                              {letter}
                            </span>
                            <span className="text-base sm:text-lg font-medium leading-snug break-words">
                              <MathText
                                text={optionText}
                                monoClassName="font-mono font-semibold text-inherit tabular-nums"
                              />
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {stateTag && (
                              <span
                                className={`text-xs font-semibold hidden sm:inline ${
                                  isCorrectOption
                                    ? 'text-[#047857]'
                                    : 'text-[#B91C1C]'
                                }`}
                              >
                                {stateTag}
                              </span>
                            )}
                            {isAnswered && isCorrectOption && (
                              <CheckCircle2
                                className="w-5 h-5 text-[#047857] shrink-0"
                                aria-hidden="true"
                              />
                            )}
                            {isAnswered && isSelected && !isCorrectOption && (
                              <XCircle
                                className="w-5 h-5 text-[#B91C1C] shrink-0"
                                aria-hidden="true"
                              />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Instant Feedback & Explanation Panel */}
                {isAnswered && record && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                    role="status"
                    aria-live="polite"
                    className={`mt-6 rounded-2xl border p-4 sm:p-5 ${
                      record.isCorrect
                        ? 'bg-[#ECFDF5] border-[#A7F3D0] text-[#064E3B]'
                        : 'bg-[#FEF2F2] border-[#FECACA] text-[#7F1D1D]'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {record.isCorrect ? (
                        <CheckCircle2
                          className="w-5 h-5 text-[#047857] shrink-0 mt-0.5"
                          aria-hidden="true"
                        />
                      ) : (
                        <XCircle
                          className="w-5 h-5 text-[#B91C1C] shrink-0 mt-0.5"
                          aria-hidden="true"
                        />
                      )}
                      <div className="space-y-1.5 min-w-0">
                        <p className="text-sm sm:text-base font-bold">
                          {record.isCorrect
                            ? 'أحسنت! إجابة صحيحة'
                            : `إجابة خاطئة — الإجابة الصحيحة هي: ${getCorrectAnswerDisplay(question)}`}
                        </p>
                        <p className="text-sm leading-relaxed opacity-90">
                          <MathText
                            text={question.explanation}
                            monoClassName="font-mono font-semibold text-inherit bg-black/[0.05] px-1 py-0.5 rounded mx-0.5 tabular-nums"
                          />
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Desktop Inline Navigation Bar */}
                <div className="hidden lg:flex items-center justify-between gap-4 mt-7 pt-5 border-t border-slate-100">
                  <button
                    type="button"
                    disabled={isFirst}
                    onClick={onPrev}
                    className={`inline-flex items-center justify-center gap-2 min-h-[46px] px-4 py-2.5 text-sm font-semibold rounded-xl border transition-colors ${
                      isFirst
                        ? 'border-slate-100 text-slate-300 cursor-not-allowed'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    <span>السؤال السابق</span>
                  </button>

                  <p className="text-xs text-slate-400">
                    تم حل{' '}
                    <span className="font-semibold text-slate-600 tabular-nums">
                      {answeredCount}
                    </span>{' '}
                    من{' '}
                    <span className="font-semibold text-slate-600 tabular-nums">
                      {questions.length}
                    </span>
                  </p>

                  {isLast ? (
                    <button
                      type="button"
                      onClick={onFinishExam}
                      className="inline-flex items-center justify-center gap-2 min-h-[46px] px-6 py-2.5 text-sm font-semibold text-white bg-[#0F4C81] hover:bg-[#0B3B66] active:scale-[0.98] rounded-xl transition-all"
                    >
                      <Flag className="w-4 h-4" aria-hidden="true" />
                      <span>عرض النتيجة النهائية</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={onNext}
                      className={`inline-flex items-center justify-center gap-2 min-h-[46px] px-6 py-2.5 text-sm font-semibold rounded-xl transition-transform active:scale-[0.98] ${
                        isAnswered
                          ? 'text-white bg-[#0F4C81] hover:bg-[#0B3B66]'
                          : 'text-slate-700 bg-slate-100 hover:bg-slate-200/80'
                      }`}
                    >
                      <span>{isAnswered ? 'السؤال التالي' : 'تخطي للسؤال التالي'}</span>
                      <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                    </button>
                  )}
                </div>
              </motion.article>
            </AnimatePresence>

            {/* Subtle Author Attribution visible on Mobile below the Question Card */}
            <p className="lg:hidden text-center text-xs text-slate-400 mt-4">
              إعداد الاختبار:{' '}
              <span className="font-semibold text-slate-600">{AUTHOR_NAME}</span>
            </p>
          </div>

          {/* Desktop Sidebar Navigator (Left 4 Cols in RTL) */}
          <div className="lg:col-span-4">
            <QuestionNavigator
              mode="sidebar"
              questions={questions}
              answers={answers}
              currentIndex={currentIndex}
              onSelectIndex={onGoToIndex}
              onFinishExam={onFinishExam}
            />
          </div>
        </div>
      </main>

      {/* Mobile Ergonomic Thumb-Zone Sticky Action Bar (64px height -> combined with 56px header = 120px <= 14.2% of 844px) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-4 pt-2 pb-safe">
        <div className="flex items-center gap-2.5 max-w-xl mx-auto">
          <button
            type="button"
            disabled={isFirst}
            onClick={onPrev}
            aria-label="السؤال السابق"
            className={`min-h-[48px] px-4 rounded-xl border text-sm font-semibold inline-flex items-center justify-center gap-1.5 shrink-0 transition-colors ${
              isFirst
                ? 'border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed'
                : 'border-slate-200 bg-white text-slate-700 active:bg-slate-100'
            }`}
          >
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
            <span>السابق</span>
          </button>

          {isLast ? (
            <button
              type="button"
              onClick={onFinishExam}
              className="flex-1 min-h-[48px] px-5 rounded-xl text-sm font-semibold text-white bg-[#0F4C81] active:bg-[#0B3B66] active:scale-[0.99] inline-flex items-center justify-center gap-2 transition-all"
            >
              <Flag className="w-4 h-4" aria-hidden="true" />
              <span>عرض النتيجة النهائية</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onNext}
              className={`flex-1 min-h-[48px] px-5 rounded-xl text-sm font-semibold inline-flex items-center justify-center gap-2 transition-transform active:scale-[0.99] ${
                isAnswered
                  ? 'text-white bg-[#0F4C81] active:bg-[#0B3B66]'
                  : 'text-slate-800 bg-slate-100 active:bg-slate-200'
              }`}
            >
              <span>{isAnswered ? 'السؤال التالي' : 'تخطي للسؤال التالي'}</span>
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {/* Mobile Bottom Sheet Navigator */}
      <QuestionNavigator
        mode="drawer"
        isOpen={isNavigatorOpen}
        onClose={onCloseNavigator}
        questions={questions}
        answers={answers}
        currentIndex={currentIndex}
        onSelectIndex={onGoToIndex}
        onFinishExam={onFinishExam}
      />
    </>
  );
}
