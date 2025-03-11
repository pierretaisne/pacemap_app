import { useEffect, useState, useCallback } from 'react';
import { Platform, NativeModules } from 'react-native';
// Import from our local file
import AppleHealthKit from './AppleHealthKit';
import type { HealthValue, HealthKitPermissions } from 'react-native-health';

// Check if running on a real device (not simulator)
const isSimulator = () => {
  if (Platform.OS === 'ios') {
    // Check for simulator using a more compatible approach
    return process.env.NODE_ENV !== 'production';
  }
  return false;
};

const useHealthData = () => {
  const [steps, setSteps] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Initialize HealthKit
  useEffect(() => {
    // Only run on iOS and preferably on real devices
    if (Platform.OS !== 'ios') {
      setError('HealthKit is only available on iOS');
      return;
    }

    if (isSimulator()) {
      console.log('[HealthKit] Running on simulator. HealthKit may not work properly.');
    }

    console.log('AppleHealthKit object:', AppleHealthKit);

    const permissions = {
      permissions: {
        read: [AppleHealthKit.Constants.Permissions.Steps],
        write: [],
      },
    };

    try {
      AppleHealthKit.initHealthKit(permissions, (err: any) => {
        if (err) {
          console.log('[HealthKit] Error initializing HealthKit:', err);
          setError('Failed to initialize HealthKit. Please check Health app permissions.');
          return;
        }
        
        console.log('[HealthKit] HealthKit initialized successfully');
        setIsAuthorized(true);
        getSteps();
      });
    } catch (err) {
      console.error('[HealthKit] Exception during initialization:', err);
      setError('Exception during HealthKit initialization');
    }
  }, []);

  const getSteps = useCallback(async () => {
    if (Platform.OS !== 'ios') {
      return;
    }

    if (!isAuthorized) {
      setError('Health permissions not granted. Please authorize in the Health app.');
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
        AppleHealthKit.getStepCount(options, (err: any, results: any) => {
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
  }, [isAuthorized]);

  return {
    steps,
    error,
    isLoading,
    isAuthorized,
    refreshSteps: getSteps
  };
};

export default useHealthData; 