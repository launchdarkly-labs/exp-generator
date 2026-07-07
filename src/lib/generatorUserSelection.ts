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
}

const getRandomIndex = (max: number, random: () => number): number =>
  Math.floor(random() * max);

export const selectUserForMode = ({
  mode,
  createRandomKey,
  random = Math.random,
}: SelectUserForModeParams): GeneratorUserSelection => {
  if (mode === GENERATOR_MODES.REALISM) {
    const realismUser: RealismUser =
      REALISM_USERS[getRandomIndex(REALISM_USERS.length, random)];
    return realismUser;
  }

  const persona = STARTER_PERSONAS[getRandomIndex(STARTER_PERSONAS.length, random)];
  return {
    key: createRandomKey(),
    name: persona.personaname,
    email: persona.personaemail,
  };
};
