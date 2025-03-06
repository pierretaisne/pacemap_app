import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import AppleHealthKit from 'react-native-health';

const useHealthData = () => {
  const [steps, setSteps] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (Platform.OS !== 'ios') return;

    const permissions = {
      permissions: {
        read: [AppleHealthKit.Constants.Permissions.Steps],
        write: []
      }
    };

    AppleHealthKit.initHealthKit(permissions, (err) => {
      if (err) {
        setError('Cannot access HealthKit');
        return;
      }

      const options = {
        date: new Date().toISOString(),
        includeManuallyAdded: true
      };

      AppleHealthKit.getStepCount(options, (err, results) => {
        if (err) {
          setError('Failed to get steps');
          return;
        }
        setSteps(results.value);
      });
    });
  }, []);

  const refreshSteps = () => {
    if (Platform.OS !== 'ios') return;

    const options = {
      date: new Date().toISOString(),
      includeManuallyAdded: true
    };

    AppleHealthKit.getStepCount(options, (err, results) => {
      if (err) {
        setError('Failed to get steps');
        return;
      }
      setSteps(results.value);
    });
  };

  return { steps, error, refreshSteps };
};

export default useHealthData; 