import React, { useState, useEffect } from 'react';
import {
  //   generateSuggestedItemsFeatureExperimentResults,
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
  const [customNumRuns, setCustomNumRuns] = useState(100);
  const [customTrueProbability, setCustomTrueProbability] = useState(60);
  const [customFalseProbability, setCustomFalseProbability] = useState(30);
  const [metrics, setMetrics] = useState<
    Array<{
      id: string;
      key: string;
      trueValue: number | '';
      falseValue: number | '';
    }>
  >([{ id: '1', key: '', trueValue: '', falseValue: '' }]);
  const [experimentState, setExperimentState] = useState<ExperimentState>({
    currentRun: 0,
    totalRuns: 0,
    experimentType: '',
  });

  // Load custom experiment settings from localStorage on component mount
  useEffect(() => {
    const savedFlagKey = localStorage.getItem('custom-flag-key');
    const savedNumRuns = localStorage.getItem('custom-num-runs');
    const savedTrueProbability = localStorage.getItem(
      'custom-true-probability'
    );
    const savedFalseProbability = localStorage.getItem(
      'custom-false-probability'
    );
    const savedMetrics = localStorage.getItem('custom-metrics');

    if (savedFlagKey) {
      setCustomFlagKey(savedFlagKey);
    }
    if (savedNumRuns) {
      setCustomNumRuns(parseInt(savedNumRuns) || 100);
    }
    if (savedTrueProbability) {
      setCustomTrueProbability(parseInt(savedTrueProbability) || 60);
    }
    if (savedFalseProbability) {
      setCustomFalseProbability(parseInt(savedFalseProbability) || 30);
    }
    if (savedMetrics) {
      try {
        const parsedMetrics = JSON.parse(savedMetrics);
        if (Array.isArray(parsedMetrics) && parsedMetrics.length > 0) {
          setMetrics(parsedMetrics);
        }
      } catch (error) {
        console.error('Failed to parse saved metrics:', error);
      }
    }
  }, []);

  // Save to localStorage whenever values change
  const handleFlagKeyChange = (value: string) => {
    setCustomFlagKey(value);
    localStorage.setItem('custom-flag-key', value);
  };

  const handleNumRunsChange = (value: number) => {
    setCustomNumRuns(value);
    localStorage.setItem('custom-num-runs', value.toString());
  };

  const handleTrueProbabilityChange = (value: number) => {
    setCustomTrueProbability(value);
    localStorage.setItem('custom-true-probability', value.toString());
  };

  const handleFalseProbabilityChange = (value: number) => {
    setCustomFalseProbability(value);
    localStorage.setItem('custom-false-probability', value.toString());
  };

  const saveMetricsToStorage = (newMetrics: typeof metrics) => {
    localStorage.setItem('custom-metrics', JSON.stringify(newMetrics));
  };

  const updateMetric = (
    id: string,
    field: keyof (typeof metrics)[0],
    value: string | number
  ) => {
    const newMetrics = metrics.map(metric =>
      metric.id === id ? { ...metric, [field]: value } : metric
    );
    setMetrics(newMetrics);
    saveMetricsToStorage(newMetrics);
  };

  const addMetric = () => {
    const newMetric = {
      id: Date.now().toString(),
      key: '',
      trueValue: '' as number | '',
      falseValue: '' as number | '',
    };
    const newMetrics = [...metrics, newMetric];
    setMetrics(newMetrics);
    saveMetricsToStorage(newMetrics);
  };

  const removeMetric = (id: string) => {
    if (metrics.length > 1) {
      const newMetrics = metrics.filter(metric => metric.id !== id);
      setMetrics(newMetrics);
      saveMetricsToStorage(newMetrics);
    }
  };

  //   const runBayesianExperiment = async () => {
  //     if (!client || isRunning) return;

  //     setIsRunning(true);
  //     setProgress(0);
  //     setExperimentState({
  //       currentRun: 0,
  //       totalRuns: 500,
  //       experimentType: 'Bayesian',
  //     });

  //     await generateSuggestedItemsFeatureExperimentResults({
  //       client,
  //       updateContext: updateUserContext,
  //       setProgress,
  //       setExpGenerator: setIsRunning,
  //       experimentTypeObj: {
  //         experimentType: 'bayesian',
  //         numOfRuns: 500,
  //       },
  //     });
  //   };

  //   const runFrequentistExperiment = async () => {
  //     if (!client || isRunning) return;

  //     setIsRunning(true);
  //     setProgress(0);
  //     setExperimentState({
  //       currentRun: 0,
  //       totalRuns: 1000,
  //       experimentType: 'Frequentist',
  //     });

  //     await generateSuggestedItemsFeatureExperimentResults({
  //       client,
  //       updateContext: updateUserContext,
  //       setProgress,
  //       setExpGenerator: setIsRunning,
  //       experimentTypeObj: {
  //         experimentType: 'frequentist',
  //         numOfRuns: 1000,
  //       },
  //     });
  //   };

  const runCustomExperiment = async (
    experimentType: 'bayesian' | 'frequentist'
  ) => {
    const validMetrics = metrics.filter(metric => metric.key.trim());
    if (!client || isRunning || !customFlagKey || validMetrics.length === 0)
      return;

    setIsRunning(true);
    setProgress(0);
    setExperimentState({
      currentRun: 0,
      totalRuns: customNumRuns,
      experimentType: `Custom ${experimentType.charAt(0).toUpperCase() + experimentType.slice(1)}`,
    });

    // For now, we'll use the first metric's values as defaults and pass all metric keys
    // This maintains compatibility with the existing function structure
    const firstMetric = validMetrics[0];
    const metricKeys = validMetrics.map(m => m.key);

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
      metricKeys: metricKeys,
      defaultValue: false,
      customTrueProbability: customTrueProbability,
      customFalseProbability: customFalseProbability,
      customTrueMetricValue:
        firstMetric.trueValue === '' ? undefined : firstMetric.trueValue,
      customFalseMetricValue:
        firstMetric.falseValue === '' ? undefined : firstMetric.falseValue,
    });
  };

  return (
    <>
      {/* Predefined Experiments */}
      {/* <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
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
      </div> */}

      {/* Custom Experiment Generator */}
      <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Custom Experiment Generator
        </h2>
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-700">
            <strong>Note:</strong> This generator currently only works with
            feature experimentation and not funnel experimentation.
          </p>
        </div>
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
          <div className="flex justify-between items-center mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Metrics Configuration:
            </label>
            <button
              type="button"
              onClick={addMetric}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              + Add Metric
            </button>
          </div>
          {metrics.map((metric, index) => (
            <div
              key={metric.id}
              className="grid grid-cols-12 gap-2 mb-3 items-end"
            >
              <div className="col-span-4">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Metric Key
                </label>
                <input
                  type="text"
                  value={metric.key}
                  onChange={e => updateMetric(metric.id, 'key', e.target.value)}
                  placeholder="e.g., conversion-rate"
                  className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="col-span-3">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  True Value
                </label>
                <input
                  type="number"
                  value={metric.trueValue}
                  onChange={e =>
                    updateMetric(
                      metric.id,
                      'trueValue',
                      e.target.value === ''
                        ? ''
                        : parseInt(e.target.value) || ''
                    )
                  }
                  placeholder="Optional"
                  min="0"
                  className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="col-span-3">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  False Value
                </label>
                <input
                  type="number"
                  value={metric.falseValue}
                  onChange={e =>
                    updateMetric(
                      metric.id,
                      'falseValue',
                      e.target.value === ''
                        ? ''
                        : parseInt(e.target.value) || ''
                    )
                  }
                  placeholder="Optional"
                  min="0"
                  className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="col-span-2">
                {metrics.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeMetric(metric.id)}
                    className="w-full px-2 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
          <p className="text-xs text-gray-500 mt-2">
            Leave value fields blank to use random values. First metric's values
            will be used as defaults for all metrics.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label
              htmlFor="trueProbability"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              True Probability (%):
            </label>
            <input
              type="number"
              id="trueProbability"
              value={customTrueProbability}
              onChange={e =>
                handleTrueProbabilityChange(parseInt(e.target.value) || 60)
              }
              min="0"
              max="100"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Probability of tracking metrics when flag is true
            </p>
          </div>
          <div>
            <label
              htmlFor="falseProbability"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              False Probability (%):
            </label>
            <input
              type="number"
              id="falseProbability"
              value={customFalseProbability}
              onChange={e =>
                handleFalseProbabilityChange(parseInt(e.target.value) || 30)
              }
              min="0"
              max="100"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Probability of tracking metrics when flag is false
            </p>
          </div>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => runCustomExperiment('bayesian')}
            disabled={
              isRunning ||
              !customFlagKey ||
              metrics.filter(m => m.key.trim()).length === 0
            }
            className={`px-4 py-2 font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isRunning ||
              !customFlagKey ||
              metrics.filter(m => m.key.trim()).length === 0
                ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                : 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500'
            }`}
          >
            Run Experiment
          </button>
          {/* <button
            onClick={() => runCustomExperiment('frequentist')}
            disabled={isRunning || !customFlagKey || metrics.filter(m => m.key.trim()).length === 0}
            className={`px-4 py-2 font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isRunning || !customFlagKey || metrics.filter(m => m.key.trim()).length === 0
                ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                : 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500'
            }`}
          >
            Run Frequentist Experiment
          </button> */}
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
