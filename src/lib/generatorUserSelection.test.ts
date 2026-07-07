import { selectUserForMode } from './generatorUserSelection';
import { GENERATOR_MODES } from './generatorModes';
import { REALISM_USERS } from './realismUsers';
import { STARTER_PERSONAS } from './StarterUserPersonas';

describe('selectUserForMode', () => {
  it('contains a realism pool of 50 stable identities', () => {
    expect(REALISM_USERS).toHaveLength(50);

    const uniqueKeys = new Set(REALISM_USERS.map(user => user.key));
    const uniqueNames = new Set(REALISM_USERS.map(user => user.name));

    expect(uniqueKeys.size).toBe(50);
    expect(uniqueNames.size).toBe(50);
    expect(REALISM_USERS.every(user => user.key.length === 10)).toBe(true);
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

  it('cycles realism users when realism index is provided', () => {
    const firstUser = selectUserForMode({
      mode: GENERATOR_MODES.REALISM,
      createRandomKey: () => 'unused',
      realismIndex: 0,
    });
    const wrappedUser = selectUserForMode({
      mode: GENERATOR_MODES.REALISM,
      createRandomKey: () => 'unused',
      realismIndex: REALISM_USERS.length,
    });

    expect(firstUser).toEqual(REALISM_USERS[0]);
    expect(wrappedUser).toEqual(REALISM_USERS[0]);
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
