import { selectUserForMode } from './generatorUserSelection';
import { GENERATOR_MODES } from './generatorModes';
import { REALISM_USERS } from './realismUsers';
import { STARTER_PERSONAS } from './StarterUserPersonas';

describe('selectUserForMode', () => {
  it('contains a realism pool of 100 stable identities', () => {
    expect(REALISM_USERS).toHaveLength(100);

    const uniqueKeys = new Set(REALISM_USERS.map(user => user.key));
    const uniqueNames = new Set(REALISM_USERS.map(user => user.name));

    expect(uniqueKeys.size).toBe(100);
    expect(uniqueNames.size).toBe(100);
  });

  it('returns a fixed realism user and does not generate new keys', () => {
    const createRandomKey = jest.fn(() => 'generated-key');

    const selected = selectUserForMode({
      mode: GENERATOR_MODES.REALISM,
      createRandomKey,
      random: () => 0,
    });

    expect(selected).toEqual(REALISM_USERS[0]);
    expect(createRandomKey).not.toHaveBeenCalled();
  });

  it('returns persona identity and generates a fresh key for randomization', () => {
    const createRandomKey = jest.fn(() => 'random-key-123');

    const selected = selectUserForMode({
      mode: GENERATOR_MODES.RANDOMIZATION,
      createRandomKey,
      random: () => 0,
    });

    expect(selected).toEqual({
      key: 'random-key-123',
      name: STARTER_PERSONAS[0].personaname,
      email: STARTER_PERSONAS[0].personaemail,
    });
    expect(createRandomKey).toHaveBeenCalledTimes(1);
  });
});
