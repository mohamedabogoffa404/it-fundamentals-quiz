import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ALL_QUESTIONS,
  AUTHOR_NAME,
  MULTIPLE_CHOICE_QUESTIONS,
} from '../data/questions';
import {
  computeQuizSummary,
  deterministicShuffle,
  evaluateAnswer,
  getCorrectAnswerDisplay,
  parsePersistedState,
  selectQuestionsForScope,
  tokenizeMathSegments,
} from './quizEngine';
import type { UserAnswerMap } from '../types/quiz';

test('dataset contains exactly 100 unique questions split 50/50', () => {
  assert.equal(ALL_QUESTIONS.length, 100);
  const tf = ALL_QUESTIONS.filter((q) => q.section === 'true_false');
  const mcq = ALL_QUESTIONS.filter((q) => q.section === 'multiple_choice');
  assert.equal(tf.length, 50);
  assert.equal(mcq.length, 50);

  const ids = new Set(ALL_QUESTIONS.map((q) => q.id));
  assert.equal(ids.size, 100);
  for (let i = 1; i <= 100; i++) {
    assert.ok(ids.has(i), `Missing question id ${i}`);
  }
  assert.ok(AUTHOR_NAME.includes('محمد أبوغفة'));
});

test('all questions have non-empty prompts and explanations and valid MCQ options', () => {
  const indexCounts = [0, 0, 0, 0];
  for (const q of ALL_QUESTIONS) {
    assert.ok(q.prompt.trim().length > 5, `Empty prompt on Q${q.id}`);
    assert.ok(q.explanation.trim().length > 5, `Empty explanation on Q${q.id}`);
    if (q.section === 'multiple_choice') {
      assert.equal(q.options.length, 4);
      assert.equal(new Set(q.options).size, 4, `Duplicate options on Q${q.id}`);
      assert.ok(q.correctIndex >= 0 && q.correctIndex <= 3);
      indexCounts[q.correctIndex]++;
    }
  }
  // Ensure deterministic option shuffling distributes correct answers across all 4 positions
  for (let idx = 0; idx < 4; idx++) {
    assert.ok(
      indexCounts[idx] >= 6,
      `Expected balanced MCQ correctIndex distribution, got ${indexCounts.join(',')}`,
    );
  }
});

test('mathematical spot checks on critical questions (Q1, Q9, Q15, Q27, Q56, Q79)', () => {
  const byId = new Map(ALL_QUESTIONS.map((q) => [q.id, q]));

  // Q1: 1 + 1 = 1 without carry -> false
  assert.equal(evaluateAnswer(byId.get(1)!, false), true);
  assert.equal(evaluateAnswer(byId.get(1)!, true), false);

  // Q9: 2's complement of 10010 is 01110, NOT 01101 -> false
  assert.equal(evaluateAnswer(byId.get(9)!, false), true);

  // Q15: 2's complement of 110111 is 001001 -> true
  assert.equal(evaluateAnswer(byId.get(15)!, true), true);

  // Q27: Binary to octal grouping from left to right -> false
  assert.equal(evaluateAnswer(byId.get(27)!, false), true);

  // Q56: Borrow value in binary 0 - 1 is 2
  const q56 = byId.get(56)!;
  assert.equal(q56.section, 'multiple_choice');
  assert.equal(q56.options[q56.correctIndex], '2');

  // Q79: Hex A15 to Decimal = 2581
  const q79 = byId.get(79)!;
  assert.equal(q79.section, 'multiple_choice');
  assert.equal(q79.options[q79.correctIndex], '2581');
});

test('scope selection, deterministic shuffle, and mistakes filtering work accurately', () => {
  assert.equal(selectQuestionsForScope('all').length, 100);
  assert.equal(selectQuestionsForScope('true_false').length, 50);
  assert.equal(selectQuestionsForScope('multiple_choice').length, 50);

  const a = deterministicShuffle([1, 2, 3, 4, 5, 6, 7, 8], 42);
  const b = deterministicShuffle([1, 2, 3, 4, 5, 6, 7, 8], 42);
  assert.deepEqual(a, b);
  assert.notDeepEqual(a, [1, 2, 3, 4, 5, 6, 7, 8]);

  const answers: UserAnswerMap = {
    1: { questionId: 1, value: true, isCorrect: false, answeredAt: 1000 },
    2: { questionId: 2, value: true, isCorrect: true, answeredAt: 1001 },
    51: { questionId: 51, value: 0, isCorrect: false, answeredAt: 1002 },
  };
  const mistakes = selectQuestionsForScope('mistakes', answers);
  assert.deepEqual(
    mistakes.map((q) => q.id),
    [1, 51],
  );
});

test('computeQuizSummary calculates accurate scores, grades, and topic breakdowns', () => {
  const subset = ALL_QUESTIONS.slice(0, 10);
  const answers: UserAnswerMap = {};
  subset.forEach((q, idx) => {
    const isCorrect = idx < 8;
    answers[q.id] = {
      questionId: q.id,
      value: isCorrect
        ? q.section === 'true_false'
          ? q.correctAnswer
          : q.correctIndex
        : q.section === 'true_false'
          ? !q.correctAnswer
          : (q.correctIndex + 1) % 4,
      isCorrect,
      answeredAt: 1000 + idx,
    };
  });

  const summary = computeQuizSummary(subset, answers);
  assert.equal(summary.total, 10);
  assert.equal(summary.answered, 10);
  assert.equal(summary.correct, 8);
  assert.equal(summary.wrong, 2);
  assert.equal(summary.scorePercentage, 80);
  assert.equal(summary.gradeLabel, 'جيد جداً');
  assert.equal(summary.bySection.length, 1);
  assert.equal(summary.byTopic.length, 2);
});

test('tokenizeMathSegments isolates binary/hex expressions for LTR rendering', () => {
  const segments = tokenizeMathSegments('ناتج الطرح للعملية 11000 - 111 هو 10001.');
  const mathTokens = segments.filter((s) => s.isMath).map((s) => s.text);
  assert.deepEqual(mathTokens, ['11000 - 111', '10001']);

  const hexSegments = tokenizeMathSegments('العدد السادس عشري (8D9) يساوي (100011011001).');
  const hexTokens = hexSegments.filter((s) => s.isMath).map((s) => s.text);
  assert.deepEqual(hexTokens, ['(8D9)', '(100011011001)']);

  const eqSegments = tokenizeMathSegments('في النظام الثنائي، 1 + 1 = 10، أي أن الناتج.');
  const eqTokens = eqSegments.filter((s) => s.isMath).map((s) => s.text);
  assert.deepEqual(eqTokens, ['1 + 1 = 10']);

  const compSegments = tokenizeMathSegments("المتممات (1's و 2's Complement)");
  const compTokens = compSegments.filter((s) => s.isMath).map((s) => s.text);
  assert.deepEqual(compTokens, ["1's", "2's Complement"]);
});

test('parsePersistedState rejects invalid payloads and preserves valid sessions', () => {
  assert.equal(parsePersistedState(null), null);
  assert.equal(parsePersistedState('not-json'), null);
  assert.equal(parsePersistedState(JSON.stringify({ questionIds: [] })), null);

  const valid = parsePersistedState(
    JSON.stringify({
      scope: 'all',
      shuffle: false,
      questionIds: [1, 2, 3],
      currentIndex: 99,
      answers: {},
    }),
  );
  assert.ok(valid);
  assert.equal(valid.currentIndex, 2);
  assert.equal(getCorrectAnswerDisplay(MULTIPLE_CHOICE_QUESTIONS[0]).includes(')'), true);
});
