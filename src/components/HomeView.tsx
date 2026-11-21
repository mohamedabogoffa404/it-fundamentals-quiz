import {
  ArrowLeft,
  BookOpen,
  CheckSquare,
  ListChecks,
  Play,
  RotateCcw,
  Shuffle,
  UserCheck,
} from 'lucide-react';
import {
  ALL_QUESTIONS,
  AUTHOR_NAME,
  EXAM_SUBTITLE,
  EXAM_TITLE,
  TOPIC_LABELS,
  TOPIC_ORDER,
} from '../data/questions';
import type { QuizScope } from '../types/quiz';
import { MathText } from './MathText';

interface HomeViewProps {
  shuffleEnabled: boolean;
  onToggleShuffle: () => void;
  onStartScope: (scope: QuizScope) => void;
  savedSessionInfo: {
    answered: number;
    total: number;
    correct: number;
    scopeLabel: string;
  } | null;
  onResumeSession: () => void;
  onDiscardSession: () => void;
}

export function HomeView({
  shuffleEnabled,
  onToggleShuffle,
  onStartScope,
  savedSessionInfo,
  onResumeSession,
  onDiscardSession,
}: HomeViewProps) {
  const topicCounts = TOPIC_ORDER.map((topic) => {
    const tfCount = ALL_QUESTIONS.filter(
      (q) => q.topic === topic && q.section === 'true_false',
    ).length;
    const mcqCount = ALL_QUESTIONS.filter(
      (q) => q.topic === topic && q.section === 'multiple_choice',
    ).length;
    return {
      topic,
      label: TOPIC_LABELS[topic],
      tfCount,
      mcqCount,
      total: tfCount + mcqCount,
    };
  });

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-12">
      {/* Resume Saved Session Strip (if active progress exists) */}
      {savedSessionInfo && savedSessionInfo.answered > 0 && (
        <section
          aria-label="استئناف الجلسة السابقة"
          className="mb-6 sm:mb-8 bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div className="space-y-1">
            <p className="text-sm font-semibold text-slate-900">
              لديك جلسة اختبار محفوظة قيد التقدم
            </p>
            <p className="text-xs sm:text-sm text-slate-600 tabular-nums">
              {savedSessionInfo.scopeLabel} · أجبت عن {savedSessionInfo.answered} من{' '}
              {savedSessionInfo.total} سؤالاً · إجابات صحيحة: {savedSessionInfo.correct}
            </p>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onResumeSession}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2.5 text-sm font-semibold text-white bg-[#0F4C81] hover:bg-[#0B3B66] active:scale-[0.98] rounded-xl transition-all whitespace-nowrap"
            >
              <Play className="w-4 h-4 fill-current" aria-hidden="true" />
              <span>استئناف الاختبار</span>
            </button>
            <button
              type="button"
              onClick={onDiscardSession}
              className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-3.5 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/70 rounded-xl transition-colors whitespace-nowrap"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              <span>تصفير</span>
            </button>
          </div>
        </section>
      )}

      {/* Primary Hero Split — 2 Columns on Desktop, Stacked Mobile-First */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
        {/* Right Column (Primary Editorial Hero + Prominent Author Attribution) */}
        <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 lg:p-10 flex flex-col justify-between gap-8">
          <div className="space-y-5">
            {/* Unboxed Metadata Kicker */}
            <p className="text-xs sm:text-sm font-medium text-slate-500 tabular-nums">
              100 سؤال تفاعلي · 50 صح وخطأ · 50 اختيار من متعدد · تصحيح فوري
            </p>

            <div className="space-y-3">
              <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-900 leading-tight [text-wrap:balance]">
                {EXAM_TITLE}
              </h1>
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                منصة تدريب واختبار تفاعلية في{' '}
                <span className="font-semibold text-slate-800">{EXAM_SUBTITLE}</span>،
                مصممة للتصحيح الفوري وتوضيح الإجابة الصحيحة وسببها عقب كل سؤال مباشرة.
              </p>
            </div>

            {/* Dignified, Prominent Author Attribution Plate */}
            <div className="bg-[#F8FAFC] border border-slate-200 rounded-xl p-4 sm:p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-[#0F4C81] text-white flex items-center justify-center shrink-0">
                <UserCheck className="w-5 h-5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-500">
                  إعداد وتأليف أسئلة الاختبار
                </p>
                <p className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
                  {AUTHOR_NAME}
                </p>
              </div>
            </div>
          </div>

          {/* Primary Action & Shuffle Setting */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                type="button"
                onClick={() => onStartScope('all')}
                className="flex-1 inline-flex items-center justify-center gap-2.5 min-h-[52px] px-6 py-3.5 text-base font-semibold text-white bg-[#0F4C81] hover:bg-[#0B3B66] active:scale-[0.99] rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F4C81] focus-visible:ring-offset-2"
              >
                <span>ابدأ الاختبار الشامل (100 سؤال)</span>
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              </button>

              <button
                type="button"
                role="switch"
                aria-checked={shuffleEnabled}
                onClick={onToggleShuffle}
                className={`inline-flex items-center justify-center gap-2 min-h-[52px] px-4 py-3 text-sm font-medium rounded-xl border transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F4C81] ${
                  shuffleEnabled
                    ? 'bg-[#0F4C81]/[0.08] border-[#0F4C81]/30 text-[#0F4C81]'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Shuffle className="w-4 h-4" aria-hidden="true" />
                <span>{shuffleEnabled ? 'الترتيب عشوائي: مفعل' : 'ترتيب عشوائي للأسئلة'}</span>
              </button>
            </div>

            <p className="text-xs text-slate-500">
              يُحفظ تقدمك تلقائياً على جهازك لتتمكن من المتابعة في أي وقت.
            </p>
          </div>
        </div>

        {/* Left Column (Two Exam Sections Direct Launcher) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <button
            type="button"
            onClick={() => onStartScope('true_false')}
            className="flex-1 text-right bg-white border border-slate-200/90 hover:border-[#0F4C81]/40 rounded-2xl p-6 transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F4C81] flex flex-col justify-between gap-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="w-11 h-11 rounded-xl bg-slate-100 group-hover:bg-[#0F4C81]/10 text-slate-700 group-hover:text-[#0F4C81] flex items-center justify-center transition-colors shrink-0">
                <CheckSquare className="w-5 h-5" aria-hidden="true" />
              </div>
              <span className="text-xs font-medium text-slate-500 tabular-nums">
                50 سؤالاً · 1–50
              </span>
            </div>
            <div className="space-y-1.5">
              <h2 className="text-lg font-bold text-slate-900 group-hover:text-[#0F4C81] transition-colors">
                القسم الأول: أسئلة صح وخطأ
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                اختبر دقة مفاهيمك في الجمع والطرح الثنائي والمتممات والضرب والقسمة والتحويلات العددية.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-sm font-semibold text-[#0F4C81]">
              <span>ابدأ قسم صح وخطأ</span>
              <ArrowLeft
                className="w-4 h-4 transition-transform group-hover:-translate-x-1"
                aria-hidden="true"
              />
            </div>
          </button>

          <button
            type="button"
            onClick={() => onStartScope('multiple_choice')}
            className="flex-1 text-right bg-white border border-slate-200/90 hover:border-[#0F4C81]/40 rounded-2xl p-6 transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F4C81] flex flex-col justify-between gap-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="w-11 h-11 rounded-xl bg-slate-100 group-hover:bg-[#0F4C81]/10 text-slate-700 group-hover:text-[#0F4C81] flex items-center justify-center transition-colors shrink-0">
                <ListChecks className="w-5 h-5" aria-hidden="true" />
              </div>
              <span className="text-xs font-medium text-slate-500 tabular-nums">
                50 سؤالاً · 51–100
              </span>
            </div>
            <div className="space-y-1.5">
              <h2 className="text-lg font-bold text-slate-900 group-hover:text-[#0F4C81] transition-colors">
                القسم الثاني: اختيار من متعدد
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                مسائل تطبيقية بأربعة خيارات مع عرض فوري للنتيجة وتوضيح خطوات الحل عند الخطأ.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-sm font-semibold text-[#0F4C81]">
              <span>ابدأ قسم الاختيار من متعدد</span>
              <ArrowLeft
                className="w-4 h-4 transition-transform group-hover:-translate-x-1"
                aria-hidden="true"
              />
            </div>
          </button>
        </div>
      </section>

      {/* 4-Unit Syllabus Topic Practice Strip */}
      <section className="mt-8 sm:mt-10" aria-labelledby="syllabus-heading">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-4">
          <div>
            <h2
              id="syllabus-heading"
              className="text-lg sm:text-xl font-bold text-slate-900"
            >
              التدرب حسب المحور الدراسي
            </h2>
            <p className="text-sm text-slate-600 mt-0.5">
              اختر محوراً محدداً للتركيز عليه ومراجعة مسائله بشكل مباشر.
            </p>
          </div>
          <p className="text-xs text-slate-500 tabular-nums">4 محاور · 100 سؤال</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {topicCounts.map((item, idx) => (
            <button
              key={item.topic}
              type="button"
              onClick={() => onStartScope(item.topic)}
              className="text-right bg-white border border-slate-200/90 hover:border-[#0F4C81]/40 rounded-2xl p-5 transition-all group flex flex-col justify-between gap-4 min-h-[132px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F4C81]"
            >
              <div className="flex items-center justify-between text-xs text-slate-500 tabular-nums">
                <span className="font-mono font-semibold text-slate-400">
                  0{idx + 1}
                </span>
                <span>{item.total} سؤالاً</span>
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-slate-900 group-hover:text-[#0F4C81] transition-colors leading-snug">
                  <MathText
                    text={item.label}
                    monoClassName="font-sans font-bold text-inherit"
                  />
                </h3>
                <p className="text-xs text-slate-500 tabular-nums">
                  {item.tfCount} صح وخطأ · {item.mcqCount} اختيار من متعدد
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Clean Academic Footer */}
      <footer className="mt-10 sm:mt-12 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm text-slate-500">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[#0F4C81] shrink-0" aria-hidden="true" />
          <span>
            {EXAM_TITLE} — إعداد{' '}
            <strong className="font-semibold text-slate-800">{AUTHOR_NAME}</strong>
          </span>
        </div>
        <p className="tabular-nums">100 سؤال تفاعلي · تصحيح فوري</p>
      </footer>
    </main>
  );
}
