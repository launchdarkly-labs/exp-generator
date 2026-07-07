export const GENERATOR_MODES = {
  RANDOMIZATION: 'randomization',
  REALISM: 'realism',
} as const;

export type GeneratorMode =
  (typeof GENERATOR_MODES)[keyof typeof GENERATOR_MODES];
