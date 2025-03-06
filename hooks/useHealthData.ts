import { useEffect, useState, useCallback } from 'react';
import { Platform } from 'react-native';
import AppleHealthKit, { HealthValue } from 'react-native-health';

const useHealthData = () => {
  const [steps, setSteps] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getSteps = useCallback(async () => {
    if (Platform.OS !== 'ios') {
      setError('HealthKit is only available on iOS');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const options = {
        date: new Date().toISOString(),
        includeManuallyAdded: true
      };

      // Wrap the callback-based API in a Promise
      const getStepsPromise = () => new Promise<HealthValue>((resolve, reject) => {
        AppleHealthKit.getStepCount(options, (err, results) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(results);
        });
      });

      const results = await getStepsPromise();
      setSteps(results.value || 0);
      setError(null);
    } catch (err) {
      console.log('[HealthKit] Error fetching steps:', err);
      setError('Failed to get steps. Please check Health app permissions.');
      setSteps(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get steps on mount
  useEffect(() => {
    getSteps();
  }, [getSteps]);

  return {
    steps,
    error,
    isLoading,
    refreshSteps: getSteps
  };
};

export default useHealthData; 