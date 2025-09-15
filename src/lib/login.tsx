import { useLDClient } from 'launchdarkly-react-client-sdk';
import { createContext, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import CryptoJS from 'crypto-js';
import {
  isAndroid,
  isIOS,
  isBrowser,
  isMobile,
  isMacOs,
  isWindows,
} from 'react-device-detect';
import { setCookie, getCookie } from 'cookies-next';
import {
  LD_CONTEXT_COOKIE_KEY,
  LAUNCH_CLUB_PLATINUM,
  PERSONA_TIER_STANDARD,
  PERSONA_ROLE_BETA,
  PERSONA_ROLE_DEVELOPER,
  PERSONA_TIER_PLATINUM,
  PERSONA_ROLE_USER,
  LAUNCH_CLUB_STANDARD,
  AIRPLANES,
} from './constants';
import { STARTER_PERSONAS } from './StarterUserPersonas';
import { Persona } from './typescriptTypesInterfaceLogin';
import type { LoginContextType } from './typescriptTypesInterfaceLogin';

const startingUserObject = {
  personaname: '',
  personatier: '',
  personaimage: '',
  personaemail: '',
  personarole: '',
  personalaunchclubstatus: '',
  personaEnrolledInLaunchClub: false,
};

const LoginContext = createContext<LoginContextType>({
  userObject: startingUserObject,
  isLoggedIn: false,
  async updateAudienceContext() {},
  async updateUserContext() {},
  async loginUser() {},
  async logoutUser() {},
  allUsers: [],
});

export default LoginContext;

const operatingSystem = isAndroid
  ? 'Android'
  : isIOS
    ? 'iOS'
    : isWindows
      ? 'Windows'
      : isMacOs
        ? 'macOS'
        : '';
const device = isMobile ? 'Mobile' : isBrowser ? 'Desktop' : '';

export const LoginProvider = ({ children }: { children: any }) => {
  const client = useLDClient();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userObject, setUserObject] = useState<Persona | {}>({});
  const [appMultiContext, setAppMultiContext] = useState({
    ...client?.getContext(),
  });
  const [allUsers, setAllUsers] = useState<Persona[]>(STARTER_PERSONAS);

  const hashEmail = async (email: string): Promise<string> => {
    return CryptoJS.SHA256(email).toString();
  };

  const getLocation = async (): Promise<{
    key: string;
    name: string;
    timeZone: string;
    country: string;
  }> => {
    const options = Intl.DateTimeFormat().resolvedOptions();
    const country = options.locale.split('-')[1] || 'US'; // Default to "US" if country code is not available
    return {
      key: options.timeZone,
      name: options.timeZone,
      timeZone: options.timeZone,
      country: country,
    };
  };

  const updateUserContext = async (): Promise<void> => {
    const context = await client?.getContext();

    const newLocation = `America/${
      ['New_York', 'Chicago', 'Los_Angeles', 'Denver'][
        Math.floor(Math.random() * 4)
      ]
    }`;

    const newDevice = Math.random() < 0.5 ? 'Mobile' : 'Desktop';

    const osOptions =
      newDevice === 'Mobile' ? ['iOS', 'Android'] : ['macOS', 'Windows'];
    const newAirplane = AIRPLANES[Math.floor(Math.random() * AIRPLANES.length)];

    const newContext = {
      ...context,
      user: {
        ...context.user,
        anonymous: false,
        key: uuidv4().slice(0, 10),
        name: STARTER_PERSONAS[
          Math.floor(Math.random() * STARTER_PERSONAS.length)
        ].personaname,
        email:
          STARTER_PERSONAS[Math.floor(Math.random() * STARTER_PERSONAS.length)]
            .personaemail,
        role: [PERSONA_ROLE_USER, PERSONA_ROLE_BETA, PERSONA_ROLE_DEVELOPER][
          Math.floor(Math.random() * 3)
        ],
        tier: [PERSONA_TIER_STANDARD, PERSONA_TIER_PLATINUM][
          Math.floor(Math.random() * 2)
        ],
        launchclub:
          Math.random() < 0.5 ? LAUNCH_CLUB_STANDARD : LAUNCH_CLUB_PLATINUM,
      },
      device: {
        ...context.device,
        key: uuidv4().slice(0, 10),
        name: newDevice,
        operating_system:
          osOptions[Math.floor(Math.random() * osOptions.length)],
        platform: newDevice,
      },
      location: {
        ...context.location,
        key: newLocation,
        name: newLocation,
        timeZone: newLocation,
        country: 'US',
      },
      experience: {
        ...context.experience,
        key: newAirplane,
        name: newAirplane,
        airplane: newAirplane,
      },
      audience: { ...context.audience, key: uuidv4().slice(0, 10) },
    };

    setAppMultiContext(newContext);
    setCookie(LD_CONTEXT_COOKIE_KEY, newContext);
    console.log('updateUserContext', newContext);
    await client?.identify(newContext);
  };

  return (
    <LoginContext.Provider
      value={{
        userObject,
        isLoggedIn,
        updateAudienceContext,
        updateUserContext,
        loginUser,
        logoutUser,
        allUsers,
        appMultiContext,
      }}
    >
      {children}
    </LoginContext.Provider>
  );
};
