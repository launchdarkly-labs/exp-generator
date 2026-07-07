import { wait } from './utils';
import { GeneratorMode, GENERATOR_MODES } from './generatorModes';
import {
  selectVariationByProbability,
  VariationProbability,
} from './variationProbability';

const waitTime = 0.005;

// const probablityExperimentTypeSearchEngine = {
//   bayesian: { trueProbablity: 30, falseProbablity: 60 },
//   frequentist: { trueProbablity: 52, falseProbablity: 60 },
// };

export const generateCustomFeatureExperimentResults = async ({
  client,
  updateContext,
  setProgress,
  setExpGenerator,
  totalRuns,
  flagKey,
  metricValues,
  variationProbabilities,
  generatorMode,
  realismUniqueUserPercentage = 0,
  shouldStop,
}: {
  client: any;
  updateContext: (params: {
    generatorMode: GeneratorMode;
    realismTrafficType?: 'returning' | 'unique';
  }) => Promise<void>;
  setProgress: React.Dispatch<React.SetStateAction<number>>;
  setExpGenerator: React.Dispatch<React.SetStateAction<boolean>>;
  totalRuns: number;
  flagKey: string;
  metricValues: {
    key: string;
    value: number | '';
  }[];
  variationProbabilities: VariationProbability[];
  generatorMode: GeneratorMode;
  realismUniqueUserPercentage?: number;
  shouldStop?: () => boolean;
}): Promise<void> => {
  setProgress(0);

  const normalizedUniqueUserPercentage = Math.max(
    0,
    Math.min(100, realismUniqueUserPercentage)
  );
  const targetUniqueRuns =
    generatorMode === GENERATOR_MODES.REALISM
      ? Math.round((totalRuns * normalizedUniqueUserPercentage) / 100)
      : 0;
  let assignedUniqueRuns = 0;

  try {
    for (let i = 0; i < totalRuns; i++) {
      if (shouldStop?.()) {
        break;
      }

      let realismTrafficType: 'returning' | 'unique' = 'returning';
      if (generatorMode === GENERATOR_MODES.REALISM && targetUniqueRuns > 0) {
        const remainingRuns = totalRuns - i;
        const remainingUniqueRuns = targetUniqueRuns - assignedUniqueRuns;

        if (remainingUniqueRuns > 0) {
          if (remainingUniqueRuns >= remainingRuns) {
            realismTrafficType = 'unique';
          } else if (Math.random() < remainingUniqueRuns / remainingRuns) {
            realismTrafficType = 'unique';
          }
        }
      }

      if (realismTrafficType === 'unique') {
        assignedUniqueRuns += 1;
      }

      await updateContext({
        generatorMode,
        realismTrafficType,
      });

      if (shouldStop?.()) {
        break;
      }

      const assignedVariation =
        selectVariationByProbability(variationProbabilities);

      // Keep requesting the flag so LaunchDarkly receives evaluation events.
      client?.variation(flagKey, assignedVariation);

      for (const metricValue of metricValues) {
        if (shouldStop?.()) {
          break;
        }

        if (metricValue.value !== '') {
          client?.track(
            metricValue.key,
            { assignedVariation },
            Math.floor(Number(metricValue.value) * Math.random())
          );
        } else {
          client?.track(metricValue.key, { assignedVariation });
        }

        await client?.flush();
      }

      if (shouldStop?.()) {
        break;
      }

      setProgress(
        (prevProgress: number) =>
          prevProgress + (1 / totalRuns) * 100
      );
      await wait(waitTime);
    }
  } finally {
    setExpGenerator(false);
  }
};

// export const generateSuggestedItemsFeatureExperimentResults = async ({
//   client,
//   updateContext,
//   setProgress,
//   setExpGenerator,
//   experimentTypeObj,
// }: {
//   client: any;
//   updateContext: () => void;
//   setProgress: React.Dispatch<React.SetStateAction<number>>;
//   setExpGenerator: React.Dispatch<React.SetStateAction<boolean>>;
//   experimentTypeObj: { experimentType: string; numOfRuns: number };
// }): Promise<void> => {
//   setProgress(0);
//   let totalPrice = 0;
//   let totalItems = 0;

//   for (let i = 0; i < experimentTypeObj.numOfRuns; i++) {
//     const cartSuggestedItems: boolean = client?.variation(
//       'cartSuggestedItems',
//       false
//     );

//     if (cartSuggestedItems) {
//       //winner
//       totalPrice = Math.floor(Math.random() * (500 - 300 + 1)) + 700;
//       totalItems = Math.floor(Math.random() * (7 - 3 + 1)) + 4;
//       await client?.track('in-cart-total-items', undefined, totalItems);
//       await client?.flush();
//       await client?.track('in-cart-total-price', undefined, totalPrice);
//       await client?.flush();
//     } else {
//       totalPrice = Math.floor(Math.random() * (300 - 200 + 1)) + 200;
//       totalItems = Math.floor(Math.random() * (3 - 1 + 1)) + 1;
//       await client?.track('in-cart-total-items', undefined, totalItems);
//       await client?.flush();
//       await client?.track('in-cart-total-price', undefined, totalPrice);
//       await client?.flush();
//     }
//     await client?.flush();
//     setProgress(
//       (prevProgress: number) =>
//         prevProgress + (1 / experimentTypeObj.numOfRuns) * 100
//     );
//     await wait(waitTime);
//     await updateContext();
//   }
//   setExpGenerator(false);
// };

// export const generateNewSearchEngineFeatureExperimentResults = async ({
//   client,
//   updateContext,
//   setProgress,
//   setExpGenerator,
//   experimentTypeObj,
// }: {
//   client: any;
//   updateContext: () => void;
//   setProgress: React.Dispatch<React.SetStateAction<number>>;
//   setExpGenerator: React.Dispatch<React.SetStateAction<boolean>>;
//   experimentTypeObj: { experimentType: string; numOfRuns: number };
// }): Promise<void> => {
//   setProgress(0);
//   let totalPrice = 0;

//   const experimentType: string = experimentTypeObj.experimentType;

//   for (let i = 0; i < experimentTypeObj.numOfRuns; i++) {
//     const newSearchEngineFeatureFlag: string = client?.variation(
//       'release-new-search-engine',
//       false
//     );
//     if (newSearchEngineFeatureFlag) {
//       totalPrice = Math.floor(Math.random() * (300 - 200 + 1)) + 200;
//       let probablity = Math.random() * 100;
//       if (
//         probablity <
//         probablityExperimentTypeSearchEngine[
//           experimentType as keyof typeof probablityExperimentTypeSearchEngine
//         ]['trueProbablity']
//       ) {
//         await client?.track('search-engine-add-to-cart');
//         await client?.flush();
//       }
//       await client?.track('in-cart-total-price', undefined, totalPrice);
//       await client?.flush();
//     } else {
//       //winner is old search engine
//       totalPrice = Math.floor(Math.random() * (500 - 300 + 1)) + 300;
//       let probablity = Math.random() * 100;
//       if (
//         probablity <
//         probablityExperimentTypeSearchEngine[
//           experimentType as keyof typeof probablityExperimentTypeSearchEngine
//         ]['falseProbablity']
//       ) {
//         await client?.track('search-engine-add-to-cart');
//         await client?.flush();
//       }
//       await client?.track('in-cart-total-price', undefined, totalPrice);
//       await client?.flush();
//     }
//     setProgress(
//       (prevProgress: number) =>
//         prevProgress + (1 / experimentTypeObj.numOfRuns) * 100
//     );
//     await client?.flush();
//     await wait(waitTime);
//     await updateContext();
//   }
//   setExpGenerator(false);
// };
