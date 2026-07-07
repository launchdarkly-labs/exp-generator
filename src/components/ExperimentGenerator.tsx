import React, { useState, useEffect, useRef } from 'react';
import { generateCustomFeatureExperimentResults } from '../lib/featureExperimentGeneratorFunctions';
import ExperimentProgress from './ExperimentProgress';
import { GENERATOR_MODES, GeneratorMode } from '../lib/generatorModes';

interface ExperimentGeneratorProps {
  client: any;
  updateUserContext: (generatorMode: GeneratorMode) => Promise<void>;
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

interface MetricConfiguration {
  id: string;
  key: string;
  value: number | '';
}

interface VariationConfiguration {
  id: string;
  value: string;
  probability: number;
}

const createRowId = (): string =>
  `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;

const DEFAULT_METRICS: MetricConfiguration[] = [
  { id: 'metric-1', key: '', value: '' },
];

const DEFAULT_VARIATIONS: VariationConfiguration[] = [
  { id: 'variation-1', value: 'true', probability: 50 },
  { id: 'variation-2', value: 'false', probability: 50 },
];

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
  const [generatorMode, setGeneratorMode] = useState<GeneratorMode>(
    GENERATOR_MODES.RANDOMIZATION
  );
  const [metrics, setMetrics] = useState<MetricConfiguration[]>(DEFAULT_METRICS);
  const [variationConfigurations, setVariationConfigurations] = useState<
    VariationConfiguration[]
  >(DEFAULT_VARIATIONS);
  const [experimentState, setExperimentState] = useState<ExperimentState>({
    currentRun: 0,
    totalRuns: 0,
    experimentType: '',
  });
  const [isStopRequested, setIsStopRequested] = useState(false);
  const stopRequestedRef = useRef(false);

  // Load custom experiment settings from localStorage on component mount
  useEffect(() => {
    const savedFlagKey = localStorage.getItem('custom-flag-key');
    const savedNumRuns = localStorage.getItem('custom-num-runs');
    const savedGeneratorMode = localStorage.getItem('generator-mode');
    const savedMetrics = localStorage.getItem('custom-metrics');
    const savedVariations = localStorage.getItem('custom-variation-probabilities');

    if (savedFlagKey) {
      setCustomFlagKey(savedFlagKey);
    }
    if (savedNumRuns) {
      setCustomNumRuns(parseInt(savedNumRuns) || 100);
    }
    if (
      savedGeneratorMode === GENERATOR_MODES.RANDOMIZATION ||
      savedGeneratorMode === GENERATOR_MODES.REALISM
    ) {
      setGeneratorMode(savedGeneratorMode);
    }
    if (savedMetrics) {
      try {
        const parsedMetrics = JSON.parse(savedMetrics);
        if (Array.isArray(parsedMetrics) && parsedMetrics.length > 0) {
          const normalizedMetrics: MetricConfiguration[] = parsedMetrics.map(
            (metric: any, index: number) => {
              const numericValue =
                typeof metric?.value === 'number'
                  ? metric.value
                  : typeof metric?.trueValue === 'number'
                    ? metric.trueValue
                    : typeof metric?.falseValue === 'number'
                      ? metric.falseValue
                      : '';

              return {
                id: typeof metric?.id === 'string' ? metric.id : `metric-${index}`,
                key: typeof metric?.key === 'string' ? metric.key : '',
                value: numericValue,
              };
            }
          );

          setMetrics(
            normalizedMetrics.length > 0 ? normalizedMetrics : DEFAULT_METRICS
          );
        }
      } catch (error) {
        console.error('Failed to parse saved metrics:', error);
      }
    }

    if (savedVariations) {
      try {
        const parsedVariations = JSON.parse(savedVariations);
        if (Array.isArray(parsedVariations) && parsedVariations.length > 0) {
          const normalizedVariations: VariationConfiguration[] =
            parsedVariations.map((variation: any, index: number) => ({
              id:
                typeof variation?.id === 'string'
                  ? variation.id
                  : `variation-${index}`,
              value:
                typeof variation?.value === 'string' ? variation.value : '',
              probability:
                typeof variation?.probability === 'number'
                  ? variation.probability
                  : 0,
            }));

          setVariationConfigurations(
            normalizedVariations.length > 0
              ? normalizedVariations
              : DEFAULT_VARIATIONS
          );
        }
      } catch (error) {
        console.error('Failed to parse saved variations:', error);
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

  const handleGeneratorModeChange = (useRealismMode: boolean) => {
    const nextMode = useRealismMode
      ? GENERATOR_MODES.REALISM
      : GENERATOR_MODES.RANDOMIZATION;

    setGeneratorMode(nextMode);
    localStorage.setItem('generator-mode', nextMode);
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
      id: createRowId(),
      key: '',
      value: '' as number | '',
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

  const saveVariationsToStorage = (
    newVariations: VariationConfiguration[]
  ): void => {
    localStorage.setItem(
      'custom-variation-probabilities',
      JSON.stringify(newVariations)
    );
  };

  const updateVariationConfiguration = (
    id: string,
    field: keyof VariationConfiguration,
    value: string | number
  ) => {
    const newVariations = variationConfigurations.map(variation =>
      variation.id === id ? { ...variation, [field]: value } : variation
    );
    setVariationConfigurations(newVariations);
    saveVariationsToStorage(newVariations);
  };

  const addVariationConfiguration = () => {
    const newVariations = [
      ...variationConfigurations,
      {
        id: createRowId(),
        value: '',
        probability: 0,
      },
    ];
    setVariationConfigurations(newVariations);
    saveVariationsToStorage(newVariations);
  };

  const removeVariationConfiguration = (id: string) => {
    if (variationConfigurations.length <= 1) {
      return;
    }

    const newVariations = variationConfigurations.filter(
      variation => variation.id !== id
    );
    setVariationConfigurations(newVariations);
    saveVariationsToStorage(newVariations);
  };

  const validMetrics = metrics.filter(metric => metric.key.trim());
  const validVariations = variationConfigurations.filter(variation =>
    variation.value.trim()
  );
  const totalVariationProbability = validVariations.reduce(
    (total, variation) => total + variation.probability,
    0
  );
  const hasValidVariationProbability =
    validVariations.length > 0 &&
    Math.abs(totalVariationProbability - 100) < 0.001;
  const canStartExperiment =
    Boolean(client) &&
    customFlagKey.trim().length > 0 &&
    validMetrics.length > 0 &&
    hasValidVariationProbability;

  const runCustomExperiment = async () => {
    if (!client || isRunning || !canStartExperiment)
      return;

    stopRequestedRef.current = false;
    setIsStopRequested(false);
    setIsRunning(true);
    setProgress(0);
    setExperimentState({
      currentRun: 0,
      totalRuns: customNumRuns,
      experimentType: 'Custom Assignment',
    });

    try {
      await generateCustomFeatureExperimentResults({
        client,
        updateContext: updateUserContext,
        setProgress,
        setExpGenerator: setIsRunning,
        totalRuns: customNumRuns,
        flagKey: customFlagKey.trim(),
        metricValues: validMetrics.map(metric => ({
          key: metric.key.trim(),
          value: metric.value,
        })),
        variationProbabilities: validVariations.map(variation => ({
          value: variation.value.trim(),
          probability: variation.probability,
        })),
        generatorMode,
        shouldStop: () => stopRequestedRef.current,
      });
    } finally {
      stopRequestedRef.current = false;
      setIsStopRequested(false);
    }
  };

  const stopExperiment = () => {
    if (!isRunning) {
      return;
    }

    stopRequestedRef.current = true;
    setIsStopRequested(true);
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
        <section className="generator-mode-config mb-4 p-3 bg-slate-50 border border-slate-200 rounded-md">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={generatorMode === GENERATOR_MODES.REALISM}
              onChange={e => handleGeneratorModeChange(e.target.checked)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Use realism generator
            </span>
          </label>
          <p className="text-xs text-gray-500 mt-2">
            Randomization mode creates a new user key every run. Realism
            generator mode reuses a fixed pool of users with stable keys.
          </p>
        </section>
        <section className="variation-assignment-config mb-4 p-3 bg-slate-50 border border-slate-200 rounded-md">
          <div className="flex justify-between items-center mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Variation Assignment (manual)
            </label>
            <button
              type="button"
              onClick={addVariationConfiguration}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              + Add Variation
            </button>
          </div>
          {variationConfigurations.map(variation => (
            <div
              key={variation.id}
              className="grid grid-cols-12 gap-2 mb-3 items-end"
            >
              <div className="col-span-5">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Variation Value
                </label>
                <input
                  type="text"
                  value={variation.value}
                  onChange={e =>
                    updateVariationConfiguration(
                      variation.id,
                      'value',
                      e.target.value
                    )
                  }
                  placeholder="e.g., true, false, control-a"
                  className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="col-span-5">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Assignment Probability (%)
                </label>
                <input
                  type="number"
                  value={variation.probability}
                  onChange={e =>
                    updateVariationConfiguration(
                      variation.id,
                      'probability',
                      parseFloat(e.target.value) || 0
                    )
                  }
                  min="0"
                  max="100"
                  className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="col-span-2">
                {variationConfigurations.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeVariationConfiguration(variation.id)}
                    className="w-full px-2 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
          <p className="text-xs text-gray-500">
            This is a manual list because the app does not fetch flag metadata.
            Configure variations and keep total assignment probability at 100%.
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Configured variations: {validVariations.length} | Total probability:{' '}
            {totalVariationProbability.toFixed(2)}%
          </p>
          {!hasValidVariationProbability && (
            <p className="text-xs text-red-600 mt-1">
              Total assignment probability must equal 100% to run.
            </p>
          )}
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
          {metrics.map(metric => (
            <div
              key={metric.id}
              className="metric-row grid grid-cols-12 gap-2 mb-3 items-end"
            >
              <div className="metric-key-input col-span-8">
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
              <div className="metric-value-input col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Value Max
                </label>
                <input
                  type="number"
                  value={metric.value}
                  onChange={e =>
                    updateMetric(
                      metric.id,
                      'value',
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
            Leave value max blank to send events without a numeric metric value.
            When set, each run sends a random value between 0 and this max.
          </p>
        </section>
        <section className="experiment-actions flex gap-4">
          <button
            onClick={isRunning ? stopExperiment : runCustomExperiment}
            disabled={isRunning ? isStopRequested : !canStartExperiment}
            className={`px-4 py-2 font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isRunning
                ? isStopRequested
                  ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                  : 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500'
                : !canStartExperiment
                  ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                  : 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500'
            }`}
          >
            {isRunning
              ? isStopRequested
                ? 'Stopping...'
                : 'Stop Experiment'
              : 'Run Experiment'}
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
