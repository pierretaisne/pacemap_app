// Type definitions for our custom AppleHealthKit module

declare module './AppleHealthKit' {
  export interface HealthKitPermissions {
    permissions: {
      read: string[];
      write: string[];
    };
  }

  export interface HealthValue {
    value: number;
    startDate: string | Date;
    endDate: string | Date;
  }

  export interface AuthStatus {
    authorized: boolean;
  }

  const AppleHealthKit: {
    Constants: {
      Permissions: {
        Steps: string;
        StepCount: string;
        [key: string]: string;
      };
    };
    initHealthKit: (
      permissions: HealthKitPermissions, 
      callback: (error: string | null, result?: any) => void
    ) => void;
    getStepCount: (
      options: any, 
      callback: (error: string | null, result: HealthValue) => void
    ) => void;
    isAvailable: (
      callback: (error: string | null, available: boolean) => void
    ) => void;
    getAuthStatus: (
      permissions: HealthKitPermissions, 
      callback: (error: string | null, result: AuthStatus) => void
    ) => void;
  };

  export default AppleHealthKit;
} 