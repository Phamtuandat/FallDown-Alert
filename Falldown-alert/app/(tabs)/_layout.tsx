import { useAuth } from '@/context/Authprovider';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router, Tabs, useNavigation } from 'expo-router';
import { useEffect, useState } from 'react';
import { TouchableOpacity, Text } from 'react-native';

export default function TabLayout() {
  const { user, logout } = useAuth();
  const navigation = useNavigation();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  useEffect(() => {
    if (isMounted && !user) {
      router.replace('/login');
    }
    navigation.setOptions({
      headerTitle: `Welcome, ${user?.email}`,
      headerRight: () => (
        <TouchableOpacity
          onPress={handleLogout}
          style={{
            marginRight: 10,
            paddingVertical: 5,
            paddingHorizontal: 10,
            backgroundColor: 'red',
            borderRadius: 5,
          }}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>Logout</Text>
        </TouchableOpacity>
      ),
    });
  }, [user]);

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  if (!user) return null;
  if (!user) {
    return null;
  }
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: 'blue' }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="cog" color={color} />,
        }}
      />
    </Tabs>
  );
}
