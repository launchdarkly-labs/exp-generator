import { STARTER_PERSONAS } from './StarterUserPersonas';
import { GeneratorMode, GENERATOR_MODES } from './generatorModes';
import { REALISM_USERS, RealismUser } from './realismUsers';

export interface GeneratorUserSelection {
  key: string;
  name: string;
  email: string;
}

interface SelectUserForModeParams {
  mode: GeneratorMode;
  createRandomKey: () => string;
  random?: () => number;
  realismIndex?: number;
}

const getRandomIndex = (max: number, random: () => number): number =>
  Math.floor(random() * max);

export const selectUserForMode = ({
  mode,
  createRandomKey,
  random = Math.random,
  realismIndex,
}: SelectUserForModeParams): GeneratorUserSelection => {
  if (mode === GENERATOR_MODES.REALISM) {
    const normalizedIndex =
      realismIndex !== undefined
        ? ((realismIndex % REALISM_USERS.length) + REALISM_USERS.length) %
          REALISM_USERS.length
        : getRandomIndex(REALISM_USERS.length, random);
    const realismUser: RealismUser = REALISM_USERS[normalizedIndex];
    return realismUser;
  }

  const persona = STARTER_PERSONAS[getRandomIndex(STARTER_PERSONAS.length, random)];
  return {
    key: createRandomKey(),
    name: persona.personaname,
    email: persona.personaemail,
  };
};
