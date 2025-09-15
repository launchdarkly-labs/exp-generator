import React, { useState, useEffect } from 'react';
import {
  withLDProvider,
  useFlags,
  useLDClient,
} from 'launchdarkly-react-client-sdk';
import ExperimentGenerator from './components/ExperimentGenerator';
import LaunchDarklyConfig from './components/LaunchDarklyConfig';
import {
  LAUNCH_CLUB_PLATINUM,
  PERSONA_TIER_STANDARD,
  PERSONA_ROLE_BETA,
  PERSONA_ROLE_DEVELOPER,
  PERSONA_TIER_PLATINUM,
  PERSONA_ROLE_USER,
  LAUNCH_CLUB_STANDARD,
  AIRPLANES,
} from './lib/constants';
import { STARTER_PERSONAS } from './lib/StarterUserPersonas';
import {
  isAndroid,
  isIOS,
  isBrowser,
  isMobile,
  isMacOs,
  isWindows,
} from 'react-device-detect';

import { v4 as uuidv4 } from 'uuid';

// Inner component that uses LaunchDarkly hooks
function AppContent() {
  const flags = useFlags();
  const client = useLDClient();

  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentUserContext, setCurrentUserContext] = useState<any>(null);
  const [updatedUserContext, setUpdatedUserContext] = useState<any>(null);

  // Load initial context on component mount
  useEffect(() => {
    const loadInitialContext = async () => {
      if (client) {
        try {
          const initialContext = await client.getContext();
          setCurrentUserContext(initialContext);
        } catch (error) {
          console.error('Failed to load initial context:', error);
        }
      }
    };

    loadInitialContext();
  }, [client]);

  const updateUserContext = async (): Promise<void> => {
    const context = await client?.getContext();
    setCurrentUserContext(context);

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
        ...(context as any)?.user,
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
        ...(context as any)?.device,
        key: uuidv4().slice(0, 10),
        name: newDevice,
        operating_system:
          osOptions[Math.floor(Math.random() * osOptions.length)],
        platform: newDevice,
      },
      location: {
        ...(context as any)?.location,
        key: newLocation,
        name: newLocation,
        timeZone: newLocation,
        country: 'US',
      },
      experience: {
        ...(context as any)?.experience,
        key: newAirplane,
        name: newAirplane,
        airplane: newAirplane,
      },
      audience: { ...(context as any)?.audience, key: uuidv4().slice(0, 10) },
    };

    console.log('updateUserContext', newContext);
    setUpdatedUserContext(newContext);
    await client?.identify(newContext as any);
  };

  return (
    <div className="p-5 min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          LaunchDarkly Experiment Generator
        </h1>

        <div className="mb-8 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Internal Use Only:</strong> This experiment generator is
                intended for internal use in staging environments only. Please
                do not use in production environments.
              </p>
            </div>
          </div>
        </div>

        <LaunchDarklyConfig />

        <ExperimentGenerator
          client={client}
          updateUserContext={updateUserContext}
          isRunning={isRunning}
          setIsRunning={setIsRunning}
          progress={progress}
          setProgress={setProgress}
        />

        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            All LaunchDarkly Flags
          </h2>
          <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-sm text-gray-800">
            {JSON.stringify(flags, null, 2)}
          </pre>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            User Context Information
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-600 mb-3">
                Current User Context
              </h3>
              <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-sm text-gray-800 max-h-96">
                {currentUserContext
                  ? JSON.stringify(currentUserContext, null, 2)
                  : 'No context loaded yet'}
              </pre>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-600 mb-3">
                Updated User Context
              </h3>
              <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-sm text-gray-800 max-h-96">
                {updatedUserContext
                  ? JSON.stringify(updatedUserContext, null, 2)
                  : 'No updates made yet'}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Get client ID from localStorage or environment variable
function getClientId() {
  const savedClientId = localStorage.getItem('launchdarkly-client-id');
  return (
    savedClientId ||
    process.env.REACT_APP_LD_CLIENT_ID ||
    'your-launchdarkly-client-id'
  );
}

// Wrap AppContent with LoginProvider
const AppWithLoginProvider = () => {
  return <AppContent />;
};

// Export the app wrapped with LaunchDarkly provider using dynamic client ID
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
const App = withLDProvider({
  clientSideID: getClientId(),
  context: {
    kind: 'multi',
    user: {
      anonymous: true,
      key: uuidv4().slice(0, 10),
      device: device,
      operating_system: operatingSystem,
      location: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  },
  reactOptions: {
    useCamelCaseFlagKeys: false,
  },
  options: {
    application: {
      id: 'exp-generator',
    },
    baseUrl: 'https://ld-stg.launchdarkly.com', // Add this line to specify the staging endpoint
    streamUrl: 'https://stream-stg.launchdarkly.com',
    eventsUrl: 'https://events-stg.launchdarkly.com',
    eventCapacity: 1000,
    privateAttributes: ['email', 'name'],
  },
})(AppWithLoginProvider);

export default App;
