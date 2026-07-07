export interface VariationProbability {
  value: string;
  probability: number;
}

export const getProbabilityTotal = (
  variations: VariationProbability[]
): number =>
  variations.reduce(
    (total, variation) => total + Math.max(variation.probability, 0),
    0
  );

export const selectVariationByProbability = (
  variations: VariationProbability[],
  random: () => number = Math.random
): string => {
  if (variations.length === 0) {
    throw new Error('At least one variation is required');
  }

  const total = getProbabilityTotal(variations);
  if (total <= 0) {
    return variations[0].value;
  }

  let threshold = random() * total;
  for (const variation of variations) {
    threshold -= Math.max(variation.probability, 0);
    if (threshold < 0) {
      return variation.value;
    }
  }

  return variations[variations.length - 1].value;
};
