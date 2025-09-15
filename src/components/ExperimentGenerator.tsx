import React, { useState, useEffect } from 'react';
import {
  generateSuggestedItemsFeatureExperimentResults,
  generateCustomFeatureExperimentResults,
} from '../lib/featureExperimentGeneratorFunctions';

interface ExperimentGeneratorProps {
  client: any;
  updateUserContext: () => Promise<void>;
  isRunning: boolean;
  setIsRunning: React.Dispatch<React.SetStateAction<boolean>>;
  progress: number;
  setProgress: React.Dispatch<React.SetStateAction<number>>;
}

interface ExperimentState {
  currentRun: number;
  totalRuns: number;
  experimentType: string;
}

const ExperimentGenerator: React.FC<ExperimentGeneratorProps> = ({
  client,
  updateUserContext,
  isRunning,
  setIsRunning,
  progress,
  setProgress,
}) => {
  const [customFlagKey, setCustomFlagKey] = useState('');
  const [customMetricKeys, setCustomMetricKeys] = useState('');
  const [customNumRuns, setCustomNumRuns] = useState(100);
  const [experimentState, setExperimentState] = useState<ExperimentState>({
    currentRun: 0,
    totalRuns: 0,
    experimentType: '',
  });

  // Load custom experiment settings from localStorage on component mount
  useEffect(() => {
    const savedFlagKey = localStorage.getItem('custom-flag-key');
    const savedMetricKeys = localStorage.getItem('custom-metric-keys');
    const savedNumRuns = localStorage.getItem('custom-num-runs');

    if (savedFlagKey) {
      setCustomFlagKey(savedFlagKey);
    }
    if (savedMetricKeys) {
      setCustomMetricKeys(savedMetricKeys);
    }
    if (savedNumRuns) {
      setCustomNumRuns(parseInt(savedNumRuns) || 100);
    }
  }, []);

  // Save to localStorage whenever values change
  const handleFlagKeyChange = (value: string) => {
    setCustomFlagKey(value);
    localStorage.setItem('custom-flag-key', value);
  };

  const handleMetricKeysChange = (value: string) => {
    setCustomMetricKeys(value);
    localStorage.setItem('custom-metric-keys', value);
  };

  const handleNumRunsChange = (value: number) => {
    setCustomNumRuns(value);
    localStorage.setItem('custom-num-runs', value.toString());
  };

  const runBayesianExperiment = async () => {
    if (!client || isRunning) return;

    setIsRunning(true);
    setProgress(0);
    setExperimentState({
      currentRun: 0,
      totalRuns: 500,
      experimentType: 'Bayesian',
    });

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
    setExperimentState({
      currentRun: 0,
      totalRuns: 1000,
      experimentType: 'Frequentist',
    });

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

  const runCustomExperiment = async (
    experimentType: 'bayesian' | 'frequentist'
  ) => {
    if (!client || isRunning || !customFlagKey || !customMetricKeys) return;

    setIsRunning(true);
    setProgress(0);
    setExperimentState({
      currentRun: 0,
      totalRuns: customNumRuns,
      experimentType: `Custom ${experimentType.charAt(0).toUpperCase() + experimentType.slice(1)}`,
    });

    // Parse comma-separated metric keys
    const metricKeysArray = customMetricKeys
      .split(',')
      .map(key => key.trim())
      .filter(key => key);

    await generateCustomFeatureExperimentResults({
      client,
      updateContext: updateUserContext,
      setProgress,
      setExpGenerator: setIsRunning,
      experimentTypeObj: {
        experimentType,
        numOfRuns: customNumRuns,
      },
      flagKey: customFlagKey,
      metricKeys: metricKeysArray,
      defaultValue: false,
    });
  };

  return (
    <>
      {/* Predefined Experiments */}
      <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Predefined Experiments
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
      </div>

      {/* Custom Experiment Generator */}
      <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Custom Experiment Generator
        </h2>
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label
              htmlFor="flagKey"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Flag Key:
            </label>
            <input
              type="text"
              id="flagKey"
              value={customFlagKey}
              onChange={e => handleFlagKeyChange(e.target.value)}
              placeholder="e.g., my-feature-flag"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label
              htmlFor="numRuns"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Number of Runs:
            </label>
            <input
              type="number"
              id="numRuns"
              value={customNumRuns}
              onChange={e =>
                handleNumRunsChange(parseInt(e.target.value) || 100)
              }
              min="1"
              max="10000"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="mb-4">
          <label
            htmlFor="metricKeys"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Metric Keys (comma-separated):
          </label>
          <input
            type="text"
            id="metricKeys"
            value={customMetricKeys}
            onChange={e => handleMetricKeysChange(e.target.value)}
            placeholder="e.g., conversion-rate, revenue, click-through-rate"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => runCustomExperiment('bayesian')}
            disabled={isRunning || !customFlagKey || !customMetricKeys}
            className={`px-4 py-2 font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isRunning || !customFlagKey || !customMetricKeys
                ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                : 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500'
            }`}
          >
            Run Bayesian Experiment
          </button>
          <button
            onClick={() => runCustomExperiment('frequentist')}
            disabled={isRunning || !customFlagKey || !customMetricKeys}
            className={`px-4 py-2 font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isRunning || !customFlagKey || !customMetricKeys
                ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                : 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500'
            }`}
          >
            Run Frequentist Experiment
          </button>
        </div>
      </div>

      {/* Progress Section */}
      {isRunning && (
        <div className="mb-8 bg-white p-6 rounded-lg shadow-md border-2 border-blue-200">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Experiment Progress
          </h2>
          <div className="mb-3">
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm text-gray-600">
                Progress: {Math.round(progress)}%
              </div>
              <div className="text-sm text-gray-600">
                Run {Math.ceil((progress / 100) * experimentState.totalRuns)} of{' '}
                {experimentState.totalRuns}
              </div>
            </div>
            <div className="w-full max-w-md h-6 bg-gray-200 rounded-lg overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300 ease-out rounded-lg"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <div className="text-xs text-gray-500">
            Running {experimentState.experimentType} experiment... Please wait
            for completion.
          </div>
        </div>
      )}
    </>
  );
};

export default ExperimentGenerator;
