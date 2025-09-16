import React, { useState, useEffect } from 'react';
import { generateCustomFeatureExperimentResults } from '../lib/featureExperimentGeneratorFunctions';
import ExperimentProgress from './ExperimentProgress';

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
      metricValues: validMetrics,
      defaultValue: false,
      customTrueProbability: customTrueProbability,
      customFalseProbability: customFalseProbability,
    });
  };

  return (
    <>
      {/* Custom Experiment Generator */}
      <section className="experiment-generator-container mb-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Custom Experiment Generator
        </h2>
        <div className="feature-experimentation-notice mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-700">
            <strong>Note:</strong> This generator currently only works with
            feature experimentation and not funnel experimentation.
          </p>
        </div>
        <section className="flag-and-runs-config grid md:grid-cols-2 gap-4 mb-4">
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
        </section>
        <section className="metrics-configuration mb-4">
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
              className="metric-row grid grid-cols-12 gap-2 mb-3 items-end"
            >
              <div className="metric-key-input col-span-4">
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
              <div className="metric-true-value-input col-span-3">
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
              <div className="metric-false-value-input col-span-3">
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
              <div className="metric-remove-action col-span-2">
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
        </section>
        <section className="probability-config grid md:grid-cols-2 gap-4 mb-4">
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
        </section>
        <section className="experiment-actions flex gap-4">
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
        </section>
      </section>

      {/* Progress Section */}
      <ExperimentProgress
        isRunning={isRunning}
        progress={progress}
        experimentState={experimentState}
      />
    </>
  );
};

export default ExperimentGenerator;
