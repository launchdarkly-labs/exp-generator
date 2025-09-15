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
    <div style={{ padding: '20px' }}>
      <h1>Hello</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <h2>LaunchDarkly Configuration</h2>
        <div style={{ marginBottom: '10px' }}>
          <label
            htmlFor="clientId"
            style={{ display: 'block', marginBottom: '5px' }}
          >
            Client ID:
          </label>
          <input
            type="text"
            id="clientId"
            value={clientId}
            onChange={e => setClientId(e.target.value)}
            placeholder="Enter your LaunchDarkly client-side ID"
            style={{
              width: '300px',
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          />
        </div>
        <button
          type="submit"
          style={{
            padding: '8px 16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Update Client ID
        </button>
      </form>

      <div style={{ marginBottom: '20px' }}>
        <h2>Experiment Generator</h2>
        <div style={{ marginBottom: '10px' }}>
          <button
            onClick={runBayesianExperiment}
            disabled={isRunning}
            style={{
              padding: '8px 16px',
              backgroundColor: isRunning ? '#6c757d' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isRunning ? 'not-allowed' : 'pointer',
              marginRight: '10px',
            }}
          >
            {isRunning ? 'Running...' : 'Bayesian (500 runs)'}
          </button>
          <button
            onClick={runFrequentistExperiment}
            disabled={isRunning}
            style={{
              padding: '8px 16px',
              backgroundColor: isRunning ? '#6c757d' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isRunning ? 'not-allowed' : 'pointer',
            }}
          >
            {isRunning ? 'Running...' : 'Frequentist (1000 runs)'}
          </button>
        </div>
        {isRunning && (
          <div style={{ marginTop: '10px' }}>
            <div style={{ fontSize: '14px', marginBottom: '5px' }}>
              Progress: {Math.round(progress)}%
            </div>
            <div
              style={{
                width: '300px',
                height: '20px',
                backgroundColor: '#e9ecef',
                borderRadius: '4px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${progress}%`,
                  height: '100%',
                  backgroundColor: '#007bff',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>
        )}
      </div>

      <h2>All LaunchDarkly Flags:</h2>
      <pre>{JSON.stringify(flags, null, 2)}</pre>
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
