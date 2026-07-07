export interface RealismUser {
  key: string;
  name: string;
  email: string;
}

const FIRST_NAMES = [
  'Avery',
  'Jordan',
  'Taylor',
  'Riley',
  'Morgan',
  'Parker',
  'Casey',
  'Quinn',
  'Jamie',
  'Drew',
  'Alex',
  'Cameron',
  'Dakota',
  'Emerson',
  'Finley',
  'Hayden',
  'Kendall',
  'Logan',
  'Marley',
  'Nico',
  'Peyton',
  'Reese',
  'Rowan',
  'Sawyer',
  'Skyler',
  'Addison',
  'Bailey',
  'Charlie',
  'Devin',
  'Elliot',
  'Frankie',
  'Harper',
  'Indigo',
  'Jules',
  'Kai',
] as const;

const LAST_NAMES = [
  'Nguyen',
  'Patel',
  'Chen',
  'Rivera',
  'Garcia',
  'Smith',
  'Kim',
  'Johnson',
  'Lopez',
  'Brown',
  'Davis',
  'Martinez',
  'Wilson',
  'Anderson',
  'Thomas',
  'Jackson',
  'White',
  'Harris',
  'Martin',
  'Thompson',
] as const;

const REALISM_FULL_NAMES = FIRST_NAMES.flatMap(firstName =>
  LAST_NAMES.map(lastName => `${firstName} ${lastName}`)
);

export const REALISM_USERS: RealismUser[] = REALISM_FULL_NAMES.map(
  (fullName, index) => {
    const key = `u${String(index + 1).padStart(9, '0')}`;
    const emailLocalPart = fullName.toLowerCase().replace(/\s+/g, '.');

    return {
      key,
      name: fullName,
      email: `${emailLocalPart}@launchmail.io`,
    };
  }
);
