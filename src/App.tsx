import { useEffect, useMemo, useState } from 'react';
import { Header } from './components/Header';
import { HomeView } from './components/HomeView';
import { QuizView } from './components/QuizView';
import { ResultsView } from './components/ResultsView';
import type {
  AppView,
  Question,
  QuizScope,
  UserAnswerMap,
  UserAnswerValue,
} from './types/quiz';
import {
  evaluateAnswer,
  getScopeLabel,
  parsePersistedState,
  resolveQuestionsByIds,
  selectQuestionsForScope,
  STORAGE_KEY,
  type PersistedExamState,
} from './utils/quizEngine';

function loadInitialPersistedState(): PersistedExamState | null {
  try {
    return parsePersistedState(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

export default function App() {
  const initialPersisted = useMemo(() => loadInitialPersistedState(), []);

  const isAutostart = useMemo(() => {
    try {
      return new URLSearchParams(window.location.search).get('autostart') === '1';
    } catch {
      return false;
    }
  }, []);

  const [view, setView] = useState<AppView>(() => (isAutostart ? 'quiz' : 'home'));
  const [shuffleEnabled, setShuffleEnabled] = useState<boolean>(
    initialPersisted?.shuffle ?? false,
  );
  const [activeScope, setActiveScope] = useState<QuizScope>(
    initialPersisted?.scope ?? 'all',
  );
  const [activeQuestions, setActiveQuestions] = useState<Question[]>(() => {
    if (initialPersisted) {
      return resolveQuestionsByIds(initialPersisted.questionIds);
    }
    return selectQuestionsForScope('all');
  });
  const [currentIndex, setCurrentIndex] = useState<number>(
    initialPersisted?.currentIndex ?? 0,
  );
  const [answers, setAnswers] = useState<UserAnswerMap>(
    initialPersisted?.answers ?? {},
  );
  const [isNavigatorOpen, setIsNavigatorOpen] = useState(false);

  // Persist active session progress safely to localStorage
  useEffect(() => {
    try {
      const payload: PersistedExamState = {
        scope: activeScope,
        shuffle: shuffleEnabled,
        questionIds: activeQuestions.map((q) => q.id),
        currentIndex,
        answers,
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore storage quota / privacy mode errors gracefully
    }
  }, [activeScope, shuffleEnabled, activeQuestions, currentIndex, answers]);

  const savedSessionInfo = useMemo(() => {
    const answered = activeQuestions.reduce(
      (acc, q) => acc + (answers[q.id] ? 1 : 0),
      0,
    );
    if (answered === 0) return null;
    const correct = activeQuestions.reduce(
      (acc, q) => acc + (answers[q.id]?.isCorrect ? 1 : 0),
      0,
    );
    return {
      answered,
      total: activeQuestions.length,
      correct,
      scopeLabel: getScopeLabel(activeScope),
    };
  }, [activeQuestions, answers, activeScope]);

  const startScope = (scope: QuizScope) => {
    const selected = selectQuestionsForScope(scope, answers, {
      shuffle: shuffleEnabled,
      seed: Date.now(),
    });
    if (selected.length === 0) return;

    setActiveScope(scope);
    setActiveQuestions(selected);
    setCurrentIndex(0);
    setAnswers({});
    setIsNavigatorOpen(false);
    setView('quiz');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResumeSession = () => {
    setIsNavigatorOpen(false);
    setView('quiz');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDiscardSession = () => {
    const fresh = selectQuestionsForScope('all');
    setActiveScope('all');
    setActiveQuestions(fresh);
    setCurrentIndex(0);
    setAnswers({});
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
  };

  const handleAnswer = (question: Question, value: UserAnswerValue) => {
    if (answers[question.id]) return;
    const isCorrect = evaluateAnswer(question, value);
    setAnswers((prev) => ({
      ...prev,
      [question.id]: {
        questionId: question.id,
        value,
        isCorrect,
        answeredAt: Date.now(),
      },
    }));
  };

  const handleGoToIndex = (index: number) => {
    const bounded = Math.max(0, Math.min(index, activeQuestions.length - 1));
    setCurrentIndex(bounded);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNext = () => {
    if (currentIndex < activeQuestions.length - 1) {
      handleGoToIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      handleGoToIndex(currentIndex - 1);
    }
  };

  const handleOpenResults = () => {
    setIsNavigatorOpen(false);
    setView('results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoHome = () => {
    setIsNavigatorOpen(false);
    setView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRetryMistakes = () => {
    const wrongQuestions = selectQuestionsForScope('mistakes', answers);
    if (wrongQuestions.length === 0) return;
    setActiveScope('mistakes');
    setActiveQuestions(wrongQuestions);
    setCurrentIndex(0);
    setAnswers({});
    setView('quiz');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const answeredInActive = useMemo(
    () =>
      activeQuestions.reduce((acc, q) => acc + (answers[q.id] ? 1 : 0), 0),
    [activeQuestions, answers],
  );

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#0F172A]">
      <Header
        view={view}
        activeScope={activeScope}
        answeredCount={answeredInActive}
        totalCount={activeQuestions.length}
        hasSavedSession={Boolean(savedSessionInfo)}
        onGoHome={handleGoHome}
        onStartScope={startScope}
        onOpenResults={handleOpenResults}
        onOpenNavigator={() => setIsNavigatorOpen(true)}
      />

      {view === 'home' && (
        <HomeView
          shuffleEnabled={shuffleEnabled}
          onToggleShuffle={() => setShuffleEnabled((v) => !v)}
          onStartScope={startScope}
          savedSessionInfo={savedSessionInfo}
          onResumeSession={handleResumeSession}
          onDiscardSession={handleDiscardSession}
        />
      )}

      {view === 'quiz' && (
        <QuizView
          questions={activeQuestions}
          currentIndex={currentIndex}
          answers={answers}
          scopeLabel={getScopeLabel(activeScope)}
          isNavigatorOpen={isNavigatorOpen}
          onCloseNavigator={() => setIsNavigatorOpen(false)}
          onAnswer={handleAnswer}
          onGoToIndex={handleGoToIndex}
          onNext={handleNext}
          onPrev={handlePrev}
          onFinishExam={handleOpenResults}
        />
      )}

      {view === 'results' && (
        <ResultsView
          questions={activeQuestions}
          answers={answers}
          scopeLabel={getScopeLabel(activeScope)}
          onRetryAll={() => startScope(activeScope === 'mistakes' ? 'all' : activeScope)}
          onRetryMistakes={handleRetryMistakes}
          onReturnToQuiz={handleResumeSession}
          onGoHome={handleGoHome}
        />
      )}
    </div>
  );
}
