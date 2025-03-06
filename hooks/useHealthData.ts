import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import AppleHealthKit, {
  HealthInputOptions,
  HealthKitPermissions,
} from 'react-native-health';

const permissions: HealthKitPermissions = {
  permissions: {
    read: [AppleHealthKit.Constants.Permissions.Steps],
    write: [],
  },
};

const useHealthData = () => {
  const [steps, setSteps] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const getSteps = () => {
    if (Platform.OS !== 'ios') return;

    const options = {
      date: new Date().toISOString(),
      includeManuallyAdded: true
    };

    AppleHealthKit.getStepCount(options, (err, results) => {
      if (err) {
        console.log('Error getting steps:', err);
        setError('Failed to get steps');
        return;
      }
      setSteps(results.value);
    });
  };

  useEffect(() => {
    if (Platform.OS === 'ios') {
      getSteps();
    }
  }, []);

  return { steps, error, refreshSteps: getSteps };
};

export default useHealthData; 