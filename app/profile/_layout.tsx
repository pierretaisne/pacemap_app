import { Stack } from 'expo-router';
import { View } from 'react-native';

export default function ProfileLayout() {
  return (
    <View style={{ flex: 1, marginTop: 60 }}>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </View>
  );
} 