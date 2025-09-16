import React from 'react';

interface ExperimentProgressProps {
  isRunning: boolean;
  progress: number;
  experimentState: {
    currentRun: number;
    totalRuns: number;
    experimentType: string;
  };
}

const ExperimentProgress: React.FC<ExperimentProgressProps> = ({
  isRunning,
  progress,
  experimentState,
}) => {
  if (!isRunning) {
    return null;
  }

  return (
    <section className="experiment-progress-container mb-8 bg-white p-6 rounded-lg shadow-md border-2 border-blue-200">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">
        Experiment Progress
      </h2>
      <div className="progress-details mb-3">
        <div className="progress-stats flex justify-between items-center mb-2">
          <div className="text-sm text-gray-600">
            Progress: {Math.round(progress)}%
          </div>
          <div className="text-sm text-gray-600">
            Run {Math.ceil((progress / 100) * experimentState.totalRuns)} of{' '}
            {experimentState.totalRuns}
          </div>
        </div>
        <div className="progress-bar-container w-full max-w-md h-6 bg-gray-200 rounded-lg overflow-hidden">
          <div
            className="progress-bar-fill h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300 ease-out rounded-lg"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      <div className="experiment-status text-xs text-gray-500">
        Running {experimentState.experimentType} experiment... Please wait for
        completion.
      </div>
    </section>
  );
};

export default ExperimentProgress;
