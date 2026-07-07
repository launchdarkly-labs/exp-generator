import {
  getProbabilityTotal,
  selectVariationByProbability,
} from './variationProbability';

describe('variationProbability', () => {
  const variations = [
    { value: 'control', probability: 50 },
    { value: 'treatment-a', probability: 30 },
    { value: 'treatment-b', probability: 20 },
  ];

  it('calculates total probability', () => {
    expect(getProbabilityTotal(variations)).toBe(100);
  });

  it('selects the first matching weighted bucket', () => {
    expect(selectVariationByProbability(variations, () => 0.1)).toBe('control');
    expect(selectVariationByProbability(variations, () => 0.7)).toBe(
      'treatment-a'
    );
    expect(selectVariationByProbability(variations, () => 0.95)).toBe(
      'treatment-b'
    );
  });

  it('falls back to first variation when totals are zero', () => {
    expect(
      selectVariationByProbability(
        [
          { value: 'control', probability: 0 },
          { value: 'treatment', probability: 0 },
        ],
        () => 0.5
      )
    ).toBe('control');
  });
});
