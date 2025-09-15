import React, { useState, useEffect } from 'react';
import {
  withLDProvider,
  useFlags,
  useLDClient,
} from 'launchdarkly-react-client-sdk';
import { generateSuggestedItemsFeatureExperimentResults } from './lib/featureExperimentGeneratorFunctions';
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

  const [clientId, setClientId] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);

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

    console.log('updateUserContext', newContext);
    await client?.identify(newContext);
  };

  // Load client ID from localStorage on component mount
  useEffect(() => {
    const savedClientId = localStorage.getItem('launchdarkly-client-id');
    if (savedClientId) {
      setClientId(savedClientId);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Client ID submitted:', clientId);

    // Save to localStorage
    localStorage.setItem('launchdarkly-client-id', clientId);
    console.log('Client ID saved to localStorage');

    // Reload the page to reinitialize LaunchDarkly with new client ID
    window.location.reload();
  };

  const runBayesianExperiment = async () => {
    if (!client || isRunning) return;

    setIsRunning(true);
    setProgress(0);

    await generateSuggestedItemsFeatureExperimentResults({
      client,
      updateContext: updateUserContext,
      setProgress,
      setExpGenerator: setIsRunning,
      experimentTypeObj: {
        experimentType: 'bayesian',
        numOfRuns: 500,
      },
    });
  };

  const runFrequentistExperiment = async () => {
    if (!client || isRunning) return;

    setIsRunning(true);
    setProgress(0);

    await generateSuggestedItemsFeatureExperimentResults({
      client,
      updateContext: updateUserContext,
      setProgress,
      setExpGenerator: setIsRunning,
      experimentTypeObj: {
        experimentType: 'frequentist',
        numOfRuns: 1000,
      },
    });
  };

  return (
    <div className="p-5 min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          LaunchDarkly Experiment Generator
        </h1>

        <form
          onSubmit={handleSubmit}
          className="mb-8 bg-white p-6 rounded-lg shadow-md"
        >
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            LaunchDarkly Configuration
          </h2>
          <div className="mb-4">
            <label
              htmlFor="clientId"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Client ID:
            </label>
            <input
              type="text"
              id="clientId"
              value={clientId}
              onChange={e => setClientId(e.target.value)}
              placeholder="Enter your LaunchDarkly client-side ID"
              className="w-80 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Update Client ID
          </button>
        </form>

        <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Experiment Generator
          </h2>
          <div className="flex gap-4 mb-4">
            <button
              onClick={runBayesianExperiment}
              disabled={isRunning}
              className={`px-4 py-2 font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                isRunning
                  ? 'bg-gray-500 cursor-not-allowed text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500'
              }`}
            >
              {isRunning ? 'Running...' : 'Bayesian (500 runs)'}
            </button>
            <button
              onClick={runFrequentistExperiment}
              disabled={isRunning}
              className={`px-4 py-2 font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                isRunning
                  ? 'bg-gray-500 cursor-not-allowed text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500'
              }`}
            >
              {isRunning ? 'Running...' : 'Frequentist (1000 runs)'}
            </button>
          </div>
          {isRunning && (
            <div className="mt-4">
              <div className="text-sm text-gray-600 mb-2">
                Progress: {Math.round(progress)}%
              </div>
              <div className="w-80 h-5 bg-gray-200 rounded-md overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            All LaunchDarkly Flags
          </h2>
          <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-sm text-gray-800">
            {JSON.stringify(flags, null, 2)}
          </pre>
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
