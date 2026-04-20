const {
  ALLERGY_MAP,
  SKIN_QUIZ_QUESTIONS,
  buildQuizQuestionsWithOverrides,
} = require('../../utils/skinQuizConfig');

describe('skinQuizConfig', () => {
  test('exports base quiz question set and allergy map', () => {
    expect(Array.isArray(SKIN_QUIZ_QUESTIONS)).toBe(true);
    expect(SKIN_QUIZ_QUESTIONS.length).toBeGreaterThan(0);
    expect(ALLERGY_MAP.fragrance).toContain('fragrance');
  });

  test('applies score overrides to the matching question option only', () => {
    const [firstQuestion] = SKIN_QUIZ_QUESTIONS;
    const [firstOption, secondOption] = firstQuestion.options;

    const overridden = buildQuizQuestionsWithOverrides(SKIN_QUIZ_QUESTIONS, [
      {
        questionId: firstQuestion.id,
        optionId: firstOption.id,
        scores: { oily: 5, dry: 1, sensitive: 0, acne: 2 },
      },
    ]);

    const overriddenOption = overridden[0].options.find((option) => option.id === firstOption.id);
    const untouchedOption = overridden[0].options.find((option) => option.id === secondOption.id);

    expect(overriddenOption.scores).toEqual({ oily: 5, dry: 1, sensitive: 0, acne: 2 });
    expect(untouchedOption.scores).toEqual(secondOption.scores);
  });

  test('normalizes missing override keys to zero', () => {
    const [firstQuestion] = SKIN_QUIZ_QUESTIONS;
    const [firstOption] = firstQuestion.options;

    const overridden = buildQuizQuestionsWithOverrides(SKIN_QUIZ_QUESTIONS, [
      {
        questionId: firstQuestion.id,
        optionId: firstOption.id,
        scores: { oily: 3 },
      },
    ]);

    const overriddenOption = overridden[0].options.find((option) => option.id === firstOption.id);

    expect(overriddenOption.scores).toEqual({ oily: 3, dry: 0, sensitive: 0, acne: 0 });
  });
});