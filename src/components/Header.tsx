import { LayoutGrid, Play, RotateCcw } from 'lucide-react';
import type { AppView, QuizScope } from '../types/quiz';

interface HeaderProps {
  view: AppView;
  activeScope: QuizScope;
  answeredCount: number;
  totalCount: number;
  hasSavedSession: boolean;
  onGoHome: () => void;
  onStartScope: (scope: QuizScope) => void;
  onOpenResults: () => void;
  onOpenNavigator: () => void;
}

export function Header({
  view,
  activeScope,
  answeredCount,
  totalCount,
  hasSavedSession,
  onGoHome,
  onStartScope,
  onOpenResults,
  onOpenNavigator,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 h-14 bg-white/95 backdrop-blur-md border-b border-slate-200/90">
      <div className="max-w-6xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 sm:gap-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <button
          type="button"
          onClick={onGoHome}
          className="text-base sm:text-lg font-bold tracking-tight text-slate-900 hover:text-[#0F4C81] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F4C81] focus-visible:ring-offset-2 rounded-md py-1"
        >
          أساسيات تقنية المعلومات
        </button>

        {/* Zone 2: Concise single-line desktop nav links */}
        <nav
          aria-label="التنقل الرئيسي"
          className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600"
        >
          <button
            type="button"
            onClick={onGoHome}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              view === 'home'
                ? 'text-[#0F4C81] border-[#0F4C81] font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            الرئيسية
          </button>
          <button
            type="button"
            onClick={() => onStartScope('true_false')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              view === 'quiz' && activeScope === 'true_false'
                ? 'text-[#0F4C81] border-[#0F4C81] font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            صح وخطأ
          </button>
          <button
            type="button"
            onClick={() => onStartScope('multiple_choice')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              view === 'quiz' && activeScope === 'multiple_choice'
                ? 'text-[#0F4C81] border-[#0F4C81] font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            اختيار من متعدد
          </button>
          <button
            type="button"
            onClick={onOpenResults}
            disabled={!hasSavedSession && view === 'home'}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              view === 'results'
                ? 'text-[#0F4C81] border-[#0F4C81] font-semibold'
                : !hasSavedSession && view === 'home'
                  ? 'border-transparent text-slate-300 cursor-not-allowed'
                  : 'border-transparent hover:text-slate-900'
            }`}
          >
            تقرير الأداء
          </button>
        </nav>

        {/* Zone 3: Single contextual primary action */}
        <div className="flex items-center shrink-0">
          {view === 'home' && (
            <button
              type="button"
              onClick={() => onStartScope('all')}
              className="inline-flex items-center justify-center gap-2 min-h-[40px] px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-[#0F4C81] hover:bg-[#0B3B66] active:scale-[0.98] rounded-xl transition-all whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F4C81] focus-visible:ring-offset-2"
            >
              <Play className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
              <span>ابدأ الاختبار</span>
            </button>
          )}

          {view === 'quiz' && (
            <button
              type="button"
              onClick={onOpenNavigator}
              aria-label={`فتح خريطة الأسئلة، تم حل ${answeredCount} من ${totalCount}`}
              className="lg:hidden inline-flex items-center justify-center gap-2 min-h-[40px] px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200/80 active:scale-[0.98] rounded-xl transition-all whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F4C81]"
            >
              <LayoutGrid className="w-4 h-4 text-[#0F4C81]" aria-hidden="true" />
              <span className="tabular-nums">
                {answeredCount}/{totalCount}
              </span>
            </button>
          )}

          {view === 'quiz' && (
            <button
              type="button"
              onClick={onOpenResults}
              className="hidden lg:inline-flex items-center justify-center min-h-[40px] px-4 py-2 text-sm font-semibold text-white bg-[#0F4C81] hover:bg-[#0B3B66] active:scale-[0.98] rounded-xl transition-all whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F4C81] focus-visible:ring-offset-2"
            >
              إنهاء وعرض النتيجة
            </button>
          )}

          {view === 'results' && (
            <button
              type="button"
              onClick={onGoHome}
              className="inline-flex items-center justify-center gap-2 min-h-[40px] px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-[#0F4C81] hover:bg-[#0B3B66] active:scale-[0.98] rounded-xl transition-all whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F4C81] focus-visible:ring-offset-2"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>اختبار جديد</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
