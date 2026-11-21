import { useState } from 'react';
import { Check, X } from 'lucide-react';
import { AUTHOR_NAME } from '../data/questions';
import type { Question, UserAnswerMap } from '../types/quiz';

type NavFilter = 'all' | 'unanswered' | 'wrong' | 'true_false' | 'multiple_choice';

interface QuestionNavigatorProps {
  questions: readonly Question[];
  answers: UserAnswerMap;
  currentIndex: number;
  onSelectIndex: (index: number) => void;
  onFinishExam: () => void;
  mode: 'sidebar' | 'drawer';
  isOpen?: boolean;
  onClose?: () => void;
}

export function QuestionNavigator({
  questions,
  answers,
  currentIndex,
  onSelectIndex,
  onFinishExam,
  mode,
  isOpen = false,
  onClose,
}: QuestionNavigatorProps) {
  const [filter, setFilter] = useState<NavFilter>('all');

  const hasBothSections =
    questions.some((q) => q.section === 'true_false') &&
    questions.some((q) => q.section === 'multiple_choice');

  let correctCount = 0;
  let wrongCount = 0;
  for (const q of questions) {
    const rec = answers[q.id];
    if (rec) {
      if (rec.isCorrect) correctCount++;
      else wrongCount++;
    }
  }
  const remainingCount = questions.length - correctCount - wrongCount;

  const filteredEntries = questions
    .map((q, idx) => ({ question: q, index: idx, record: answers[q.id] }))
    .filter(({ question, record }) => {
      if (filter === 'unanswered') return !record;
      if (filter === 'wrong') return Boolean(record && !record.isCorrect);
      if (filter === 'true_false') return question.section === 'true_false';
      if (filter === 'multiple_choice') return question.section === 'multiple_choice';
      return true;
    });

  const handleJump = (index: number) => {
    onSelectIndex(index);
    if (mode === 'drawer' && onClose) {
      onClose();
    }
  };

  const content = (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      {/* Live Score Counters */}
      <div className="grid grid-cols-3 gap-2 pb-4 border-b border-slate-100 shrink-0">
        <div className="bg-[#ECFDF5] border border-[#A7F3D0]/70 rounded-xl p-2.5 text-center">
          <p className="text-lg font-bold text-[#047857] tabular-nums">{correctCount}</p>
          <p className="text-[11px] font-medium text-[#065F46]">صحيحة</p>
        </div>
        <div className="bg-[#FEF2F2] border border-[#FECACA]/80 rounded-xl p-2.5 text-center">
          <p className="text-lg font-bold text-[#B91C1C] tabular-nums">{wrongCount}</p>
          <p className="text-[11px] font-medium text-[#991B1B]">خاطئة</p>
        </div>
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 text-center">
          <p className="text-lg font-bold text-slate-800 tabular-nums">{remainingCount}</p>
          <p className="text-[11px] font-medium text-slate-500">متبقية</p>
        </div>
      </div>

      {/* Interactive Filter Segmented Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-3 border-b border-slate-100 shrink-0">
        {(
          [
            { id: 'all', label: 'الكل' },
            ...(hasBothSections
              ? [
                  { id: 'true_false' as const, label: 'صح وخطأ' },
                  { id: 'multiple_choice' as const, label: 'متعدد' },
                ]
              : []),
            { id: 'unanswered', label: 'متبقي' },
            { id: 'wrong', label: 'أخطاء' },
          ] as { id: NavFilter; label: string }[]
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilter(tab.id)}
            className={`min-h-[34px] px-2.5 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              filter === tab.id
                ? 'bg-[#0F4C81] text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Numbered Question Grid */}
      <div className="flex-1 min-h-0 overflow-y-auto py-3 pr-0.5">
        {filteredEntries.length === 0 ? (
          <p className="text-center text-sm text-slate-500 py-8">
            لا توجد أسئلة مطابقة لهذا التصنيف حالياً.
          </p>
        ) : (
          <div className="grid grid-cols-5 sm:grid-cols-6 lg:grid-cols-5 gap-2">
            {filteredEntries.map(({ question, index, record }) => {
              const isCurrent = index === currentIndex;
              let stateClasses =
                'bg-white border-slate-200 text-slate-700 hover:border-slate-400';
              let statusText = 'لم يُجب بعد';

              if (record?.isCorrect) {
                stateClasses =
                  'bg-[#ECFDF5] border-[#A7F3D0] text-[#047857] hover:border-[#047857]';
                statusText = 'إجابة صحيحة';
              } else if (record && !record.isCorrect) {
                stateClasses =
                  'bg-[#FEF2F2] border-[#FECACA] text-[#B91C1C] hover:border-[#B91C1C]';
                statusText = 'إجابة خاطئة';
              }

              return (
                <button
                  key={question.id}
                  type="button"
                  onClick={() => handleJump(index)}
                  aria-current={isCurrent ? 'step' : undefined}
                  aria-label={`السؤال ${index + 1} - ${statusText}`}
                  className={`relative min-h-[40px] rounded-xl border text-xs font-semibold tabular-nums flex items-center justify-center gap-0.5 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F4C81] ${stateClasses} ${
                    isCurrent
                      ? 'ring-2 ring-[#0F4C81] ring-offset-1 border-[#0F4C81] font-bold'
                      : ''
                  }`}
                >
                  <span>{index + 1}</span>
                  {record?.isCorrect && (
                    <Check className="w-3 h-3 shrink-0" aria-hidden="true" />
                  )}
                  {record && !record.isCorrect && (
                    <X className="w-3 h-3 shrink-0" aria-hidden="true" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Action + Author Credit */}
      <div className="pt-3 border-t border-slate-100 space-y-2.5 shrink-0">
        <button
          type="button"
          onClick={() => {
            if (mode === 'drawer' && onClose) onClose();
            onFinishExam();
          }}
          className="w-full min-h-[44px] px-4 py-2.5 text-sm font-semibold text-white bg-[#0F4C81] hover:bg-[#0B3B66] active:scale-[0.99] rounded-xl transition-transform"
        >
          إنهاء الاختبار وعرض التقرير
        </button>
        <p className="text-center text-xs text-slate-500">
          إعداد الاختبار: <strong className="text-slate-700">{AUTHOR_NAME}</strong>
        </p>
      </div>
    </div>
  );

  if (mode === 'sidebar') {
    return (
      <aside
        aria-label="خريطة أسئلة الاختبار"
        className="hidden lg:flex flex-col bg-white border border-slate-200/90 rounded-2xl p-5 sticky top-20 h-[calc(100vh-6.5rem)] overflow-hidden"
      >
        <div className="flex items-center justify-between mb-3 shrink-0">
          <h2 className="text-sm font-bold text-slate-900">خريطة الأسئلة</h2>
          <span className="text-xs text-slate-500 tabular-nums">
            {questions.length} سؤال
          </span>
        </div>
        {content}
      </aside>
    );
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="خريطة أسئلة الاختبار"
    >
      <button
        type="button"
        aria-label="إغلاق خريطة الأسئلة"
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/45 backdrop-blur-xs"
      />
      <div className="relative bg-white rounded-t-3xl px-5 pt-3 pb-safe max-h-[82vh] flex flex-col shadow-2xl">
        <div
          className="w-10 h-1.5 bg-slate-300 rounded-full mx-auto mb-3"
          aria-hidden="true"
        />
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-slate-900">
            خريطة الأسئلة ({questions.length})
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="min-h-[44px] min-w-[44px] -ml-2 flex items-center justify-center text-slate-500 hover:text-slate-900 rounded-xl"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
        {content}
      </div>
    </div>
  );
}
