import { useAuth } from "@/context/Authprovider";
import { ThemeContext } from "@/context/ThemeContext";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { router, Tabs, useNavigation } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { TouchableOpacity, Text } from "react-native";

export default function TabLayout() {
  const { user, logout } = useAuth();
  const navigation = useNavigation();
  const [isMounted, setIsMounted] = useState(false);
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !user) {
      router.replace("/login");
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
            backgroundColor: theme.colors.notification,
            borderRadius: 5,
          }}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>Logout</Text>
        </TouchableOpacity>
      ),
    });
  }, [user]);

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  if (!user) return null;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.border,
        tabBarStyle: {
          backgroundColor: theme.colors.card,
          borderTopColor: theme.colors.border,
        },
        headerStyle: {
          backgroundColor: theme.colors.card,
        },
        headerTintColor: theme.colors.text,
        tabBarLabelStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="home" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="cog" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
