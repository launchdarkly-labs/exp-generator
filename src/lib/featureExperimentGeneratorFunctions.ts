import { wait } from './utils';

const waitTime = 0.0005;

const probablityExperimentType = {
  bayesian: { trueProbablity: 60, falseProbablity: 30 },
  frequentist: { trueProbablity: 60, falseProbablity: 52 },
};

const probablityExperimentTypeSearchEngine = {
  bayesian: { trueProbablity: 30, falseProbablity: 60 },
  frequentist: { trueProbablity: 52, falseProbablity: 60 },
};

export const generateCustomFeatureExperimentResults = async ({
  client,
  updateContext,
  setProgress,
  setExpGenerator,
  experimentTypeObj,
  flagKey,
  metricKeys,
  defaultValue = false,
  customTrueProbability,
  customFalseProbability,
}: {
  client: any;
  updateContext: () => void;
  setProgress: React.Dispatch<React.SetStateAction<number>>;
  setExpGenerator: React.Dispatch<React.SetStateAction<boolean>>;
  experimentTypeObj: { experimentType: string; numOfRuns: number };
  flagKey: string;
  metricKeys: string[];
  defaultValue?: boolean | string | number;
  customTrueProbability?: number;
  customFalseProbability?: number;
}): Promise<void> => {
  setProgress(0);

  const experimentType: string = experimentTypeObj.experimentType;

  for (let i = 0; i < experimentTypeObj.numOfRuns; i++) {
    const flagVariation = client?.variation(flagKey, defaultValue);
    console.log(`${flagKey}:`, flagVariation);

    // Generate different metrics based on flag variation with probability
    if (flagVariation) {
      // Winner variation - better metrics with probability
      let probability = Math.random() * 100;
      const trueProbThreshold =
        customTrueProbability !== undefined
          ? customTrueProbability
          : probablityExperimentType[
              experimentType as keyof typeof probablityExperimentType
            ]['trueProbablity'];

      if (probability < trueProbThreshold) {
        for (const metricKey of metricKeys) {
          const metricValue = Math.floor(Math.random() * (500 - 300 + 1)) + 700;
          await client?.track(metricKey, undefined, metricValue);
          await client?.flush();
        }
      }
    } else {
      // Control variation - baseline metrics with probability
      let probability = Math.random() * 100;
      const falseProbThreshold =
        customFalseProbability !== undefined
          ? customFalseProbability
          : probablityExperimentType[
              experimentType as keyof typeof probablityExperimentType
            ]['falseProbablity'];

      if (probability < falseProbThreshold) {
        for (const metricKey of metricKeys) {
          const metricValue = Math.floor(Math.random() * (300 - 200 + 1)) + 200;
          await client?.track(metricKey, undefined, metricValue);
          await client?.flush();
        }
      }
    }

    setProgress(
      (prevProgress: number) =>
        prevProgress + (1 / experimentTypeObj.numOfRuns) * 100
    );
    await wait(waitTime);
    await updateContext();
  }
  setExpGenerator(false);
};

export const generateSuggestedItemsFeatureExperimentResults = async ({
  client,
  updateContext,
  setProgress,
  setExpGenerator,
  experimentTypeObj,
}: {
  client: any;
  updateContext: () => void;
  setProgress: React.Dispatch<React.SetStateAction<number>>;
  setExpGenerator: React.Dispatch<React.SetStateAction<boolean>>;
  experimentTypeObj: { experimentType: string; numOfRuns: number };
}): Promise<void> => {
  setProgress(0);
  let totalPrice = 0;
  let totalItems = 0;

  for (let i = 0; i < experimentTypeObj.numOfRuns; i++) {
    const cartSuggestedItems: boolean = client?.variation(
      'cartSuggestedItems',
      false
    );
    console.log('cartSuggestedItems', cartSuggestedItems);
    console.log('client', client);
    console.log('updateContext', updateContext);
    if (cartSuggestedItems) {
      //winner
      totalPrice = Math.floor(Math.random() * (500 - 300 + 1)) + 700;
      totalItems = Math.floor(Math.random() * (7 - 3 + 1)) + 4;
      await client?.track('in-cart-total-items', undefined, totalItems);
      await client?.flush();
      await client?.track('in-cart-total-price', undefined, totalPrice);
      await client?.flush();
    } else {
      totalPrice = Math.floor(Math.random() * (300 - 200 + 1)) + 200;
      totalItems = Math.floor(Math.random() * (3 - 1 + 1)) + 1;
      await client?.track('in-cart-total-items', undefined, totalItems);
      await client?.flush();
      await client?.track('in-cart-total-price', undefined, totalPrice);
      await client?.flush();
    }
    await client?.flush();
    setProgress(
      (prevProgress: number) =>
        prevProgress + (1 / experimentTypeObj.numOfRuns) * 100
    );
    await wait(waitTime);
    await updateContext();
  }
  setExpGenerator(false);
};

export const generateNewSearchEngineFeatureExperimentResults = async ({
  client,
  updateContext,
  setProgress,
  setExpGenerator,
  experimentTypeObj,
}: {
  client: any;
  updateContext: () => void;
  setProgress: React.Dispatch<React.SetStateAction<number>>;
  setExpGenerator: React.Dispatch<React.SetStateAction<boolean>>;
  experimentTypeObj: { experimentType: string; numOfRuns: number };
}): Promise<void> => {
  setProgress(0);
  let totalPrice = 0;

  const experimentType: string = experimentTypeObj.experimentType;

  for (let i = 0; i < experimentTypeObj.numOfRuns; i++) {
    const newSearchEngineFeatureFlag: string = client?.variation(
      'release-new-search-engine',
      false
    );
    if (newSearchEngineFeatureFlag) {
      totalPrice = Math.floor(Math.random() * (300 - 200 + 1)) + 200;
      let probablity = Math.random() * 100;
      if (
        probablity <
        probablityExperimentTypeSearchEngine[
          experimentType as keyof typeof probablityExperimentTypeSearchEngine
        ]['trueProbablity']
      ) {
        await client?.track('search-engine-add-to-cart');
        await client?.flush();
      }
      await client?.track('in-cart-total-price', undefined, totalPrice);
      await client?.flush();
    } else {
      //winner is old search engine
      totalPrice = Math.floor(Math.random() * (500 - 300 + 1)) + 300;
      let probablity = Math.random() * 100;
      if (
        probablity <
        probablityExperimentTypeSearchEngine[
          experimentType as keyof typeof probablityExperimentTypeSearchEngine
        ]['falseProbablity']
      ) {
        await client?.track('search-engine-add-to-cart');
        await client?.flush();
      }
      await client?.track('in-cart-total-price', undefined, totalPrice);
      await client?.flush();
    }
    setProgress(
      (prevProgress: number) =>
        prevProgress + (1 / experimentTypeObj.numOfRuns) * 100
    );
    await client?.flush();
    await wait(waitTime);
    await updateContext();
  }
  setExpGenerator(false);
};
