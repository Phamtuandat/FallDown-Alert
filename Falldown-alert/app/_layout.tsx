import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import "react-native-reanimated";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useRouter } from "expo-router";
import { AuthProvider } from "@/context/Authprovider";
import { Provider as PaperProvider } from "react-native-paper"; // ✅ added

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();

    (async () => {
      const userLoggedIn = false;
      setIsLoggedIn(userLoggedIn);
    })();

    router.replace("/login");
  }, [loaded]);

  return (
    <PaperProvider>
      {" "}
      {/* ✅ react-native-paper context */}
      <ThemeProvider value={DefaultTheme}>
        <AuthProvider>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
            <Stack.Screen name="login" />
            <Stack.Screen name="signin" />
          </Stack>
          <StatusBar style="auto" />
        </AuthProvider>
      </ThemeProvider>
    </PaperProvider>
  );
}
