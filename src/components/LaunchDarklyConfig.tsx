import React, { useState, useEffect } from 'react';

interface LaunchDarklyConfigProps {
  onClientIdChange?: (clientId: string) => void;
}

const LaunchDarklyConfig: React.FC<LaunchDarklyConfigProps> = ({
  onClientIdChange,
}) => {
  const [clientId, setClientId] = useState('');

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
      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Update Client ID
      </button>
    </form>
  );
};

export default LaunchDarklyConfig;
