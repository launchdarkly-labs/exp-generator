import React, { useState, useEffect } from 'react';

interface LaunchDarklyConfigProps {
  onClientIdChange?: (clientId: string) => void;
}

const CLIENT_ID_STORAGE_KEY = 'launchdarkly-client-id';
const USE_STAGING_ENDPOINTS_STORAGE_KEY = 'launchdarkly-use-staging-endpoints';

const LaunchDarklyConfig: React.FC<LaunchDarklyConfigProps> = ({
  onClientIdChange,
}) => {
  const [clientId, setClientId] = useState('');
  const [useStagingEndpoints, setUseStagingEndpoints] = useState(true);

  // Load client ID from localStorage on component mount
  useEffect(() => {
    const savedClientId = localStorage.getItem(CLIENT_ID_STORAGE_KEY);
    const savedUseStagingEndpoints = localStorage.getItem(
      USE_STAGING_ENDPOINTS_STORAGE_KEY
    );

    if (savedClientId) {
      setClientId(savedClientId);
    }
    if (savedUseStagingEndpoints === 'false') {
      setUseStagingEndpoints(false);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Client ID submitted:', clientId);

    // Save to localStorage
    localStorage.setItem(CLIENT_ID_STORAGE_KEY, clientId);
    localStorage.setItem(
      USE_STAGING_ENDPOINTS_STORAGE_KEY,
      useStagingEndpoints ? 'true' : 'false'
    );
    console.log('Client ID saved to localStorage');

    // Call parent callback if provided
    if (onClientIdChange) {
      onClientIdChange(clientId);
    }

    // Reload the page to reinitialize LaunchDarkly with new client ID
    window.location.reload();
  };

  return (
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
      <div className="mb-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={useStagingEndpoints}
            onChange={e => setUseStagingEndpoints(e.target.checked)}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">
            Use staging endpoints
          </span>
        </label>
        <p className="text-xs text-gray-500 mt-1">
          Checked = staging URLs. Unchecked = production LaunchDarkly URLs.
        </p>
      </div>
      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Apply LaunchDarkly Settings
      </button>
    </form>
  );
};

export default LaunchDarklyConfig;
