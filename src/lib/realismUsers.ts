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
] as const;

export const REALISM_USERS: RealismUser[] = FIRST_NAMES.flatMap(firstName =>
  LAST_NAMES.map((lastName, index) => {
    const fullName = `${firstName} ${lastName}`;
    const key = `${firstName.toLowerCase()}-${lastName.toLowerCase()}-${String(index + 1).padStart(3, '0')}`;

    return {
      key,
      name: fullName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index + 1}@launchmail.io`,
    };
  })
);
