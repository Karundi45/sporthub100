import { withLayoutContext } from 'expo-router';
import { createMaterialTopTabNavigator } from 'expo-router/js-top-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const MaterialTopTabs = withLayoutContext(createMaterialTopTabNavigator().Navigator);

export default function SocialLayout() {
  const insets = useSafeAreaInsets();
  
  return (
    <MaterialTopTabs
      screenOptions={{
        tabBarActiveTintColor: '#FF9500',
        tabBarInactiveTintColor: '#888',
        tabBarIndicatorStyle: { backgroundColor: '#FF9500' },
        tabBarStyle: {
          backgroundColor: '#1E1E1E',
          paddingTop: insets.top,
        },
        tabBarLabelStyle: {
          fontWeight: 'bold',
          textTransform: 'capitalize',
        }
      }}
    >
      <MaterialTopTabs.Screen name="index" options={{ title: 'Community' }} />
      <MaterialTopTabs.Screen name="groups" options={{ title: 'Groups' }} />
      <MaterialTopTabs.Screen name="challenges" options={{ title: 'Challenges' }} />
    </MaterialTopTabs>
  );
}
