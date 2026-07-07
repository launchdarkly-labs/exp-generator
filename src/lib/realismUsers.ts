export interface RealismUser {
  key: string;
  name: string;
  email: string;
}

const REALISM_FULL_NAMES = [
  'Avery Nguyen',
  'Jordan Patel',
  'Taylor Chen',
  'Riley Rivera',
  'Morgan Garcia',
  'Parker Smith',
  'Casey Kim',
  'Quinn Johnson',
  'Jamie Lopez',
  'Drew Brown',
  'Alex Davis',
  'Cameron Martinez',
  'Dakota Wilson',
  'Emerson Anderson',
  'Finley Thomas',
  'Hayden Jackson',
  'Kendall White',
  'Logan Harris',
  'Marley Martin',
  'Nico Thompson',
  'Peyton Moore',
  'Reese Lee',
  'Rowan Perez',
  'Sawyer Clark',
  'Skyler Lewis',
  'Addison Young',
  'Bailey Allen',
  'Charlie Sanchez',
  'Devin Wright',
  'Elliot King',
  'Frankie Scott',
  'Harper Green',
  'Indigo Baker',
  'Jules Adams',
  'Kai Nelson',
  'Lennon Hill',
  'Micah Ramirez',
  'Noel Campbell',
  'Oakley Mitchell',
  'Phoenix Roberts',
  'Remy Carter',
  'River Phillips',
  'Sage Evans',
  'Spencer Turner',
  'Tatum Torres',
  'Wren Parker',
  'Zion Collins',
  'Blake Edwards',
  'Cody Stewart',
  'Shiloh Morris',
] as const;

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
