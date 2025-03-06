import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import AppleHealthKit, {
  HealthInputOptions,
  HealthKitPermissions,
  HealthUnit,
} from 'react-native-health';

const { Permissions } = AppleHealthKit.Constants;

const permissions: HealthKitPermissions = {
  permissions: {
    read: [
      Permissions.Steps,
      Permissions.FlightsClimbed,
      Permissions.DistanceWalkingRunning,
    ],
    write: [],
  },
};

const useHealthData = (date: Date = new Date()) => {
  const [steps, setSteps] = useState(0);
  const [flightsClimbed, setFlightsClimbed] = useState(0);
  const [distance, setDistance] = useState(0);
  const [hasPermissions, setHasPermissions] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize HealthKit
  useEffect(() => {
    if (Platform.OS !== 'ios') return;

    AppleHealthKit.initHealthKit(permissions, (err) => {
      if (err) {
        console.log('Error getting permissions');
        setError('Cannot access HealthKit');
        return;
      }
      setHasPermissions(true);
    });
  }, []);

  // Query health data when permissions are granted
  useEffect(() => {
    if (!hasPermissions || Platform.OS !== 'ios') return;

    const options: HealthInputOptions = {
      date: date.toISOString(),
      includeManuallyAdded: true
    };

    // Get steps
    AppleHealthKit.getStepCount(options, (err, results) => {
      if (err) {
        console.log('Error getting steps');
        setError('Failed to get steps');
        return;
      }
      setSteps(results.value);
    });

    // Get flights climbed
    AppleHealthKit.getFlightsClimbed(options, (err, results) => {
      if (err) {
        console.log('Error getting flights climbed');
        return;
      }
      setFlightsClimbed(results.value);
    });

    // Get distance walking/running
    AppleHealthKit.getDistanceWalkingRunning(options, (err, results) => {
      if (err) {
        console.log('Error getting distance');
        return;
      }
      setDistance(results.value);
    });
  }, [hasPermissions, date]);

  const refreshData = () => {
    if (!hasPermissions || Platform.OS !== 'ios') return;

    const options = {
      date: date.toISOString(),
      includeManuallyAdded: true
    };

    AppleHealthKit.getStepCount(options, (err, results) => {
      if (err) {
        setError('Failed to get steps');
        return;
      }
      setSteps(results.value);
    });

    AppleHealthKit.getFlightsClimbed(options, (err, results) => {
      if (err) return;
      setFlightsClimbed(results.value);
    });

    AppleHealthKit.getDistanceWalkingRunning(options, (err, results) => {
      if (err) return;
      setDistance(results.value);
    });
  };

  return { 
    steps, 
    flightsClimbed, 
    distance,
    hasPermissions,
    error, 
    refreshData 
  };
};

export default useHealthData; 