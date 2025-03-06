import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import AppleHealthKit from 'react-native-health';

const useHealthData = () => {
  const [steps, setSteps] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const getSteps = () => {
    if (Platform.OS !== 'ios') return;

    const options = {
      date: new Date().toISOString(), // Get today's steps
      includeManuallyAdded: true
    };

    AppleHealthKit.getStepCount(options, (err, results) => {
      if (err) {
        console.log('Error getting steps:', err);
        setError('Failed to get steps');
        return;
      }
      setSteps(results.value || 0);
      setError(null);
    });
  };

  // Get steps on mount and when refreshing
  useEffect(() => {
    getSteps();
  }, []);

  return { 
    steps,
    error,
    refreshSteps: getSteps
  };
};

export default useHealthData; 