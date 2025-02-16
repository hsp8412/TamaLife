import {DarkTheme, DefaultTheme, ThemeProvider} from "@react-navigation/native";
import {useFonts} from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import {StatusBar} from "expo-status-bar";
import {useContext, useEffect} from "react";
import "react-native-reanimated";

import {useColorScheme} from "@/hooks/useColorScheme";
import Toast from "react-native-toast-message";
import {AuthProvider} from "@/contexts/authContext";
import ProtectedRoutes from "./protectedRoutes";
import {ToDoProvider} from "@/contexts/todoContext";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <ToDoProvider>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <ProtectedRoutes />
          <StatusBar style="auto" />
          <Toast />
        </ThemeProvider>
      </ToDoProvider>
    </AuthProvider>
  );
}
