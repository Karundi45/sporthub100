import { withLayoutContext } from 'expo-router';
import { createMaterialTopTabNavigator } from 'expo-router/js-top-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const MaterialTopTabs = withLayoutContext(createMaterialTopTabNavigator().Navigator);

export default function MeLayout() {
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
        },
        tabBarScrollEnabled: true, // Enables horizontal scrolling for 5 tabs
        tabBarItemStyle: { width: 'auto', minWidth: 100 },
      }}
    >
      <MaterialTopTabs.Screen name="index" options={{ title: 'Activities' }} />
      <MaterialTopTabs.Screen name="analytics" options={{ title: 'Analytics' }} />
      <MaterialTopTabs.Screen name="saved" options={{ title: 'Saved' }} />
      <MaterialTopTabs.Screen name="plans" options={{ title: 'Training Plans' }} />
      <MaterialTopTabs.Screen name="settings" options={{ title: 'Settings' }} />
    </MaterialTopTabs>
  );
}
