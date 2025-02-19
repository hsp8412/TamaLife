import {Redirect, SplashScreen, Tabs} from "expo-router";
import React, {useContext, useEffect} from "react";
import {Platform} from "react-native";

import {HapticTab} from "@/components/HapticTab";
import {IconSymbol} from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import {Colors} from "@/constants/Colors";
import {useColorScheme} from "@/hooks/useColorScheme";
import {AuthContext} from "@/contexts/authContext";
import {ToDoContext} from "@/contexts/todoContext";

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const {user, loading} = useContext(AuthContext);
  const {todos, loading: todosLoading} = useContext(ToDoContext);
  const colorScheme = useColorScheme();

  useEffect(() => {
    if (!loading && !todosLoading) {
      setTimeout(() => SplashScreen.hideAsync(), 3000);
      // SplashScreen.hideAsync(); // Hide splash when both are loaded
    }
  }, [loading, todosLoading]);

  if (!user && !loading) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: "absolute",
          },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({color}) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="todos"
        options={{
          title: "To-dos",
          tabBarIcon: ({color}) => (
            <IconSymbol size={28} name="checklist" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="food"
        options={{
          title: "Food",
          tabBarIcon: ({color}) => (
            <IconSymbol size={28} name="paperplane.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
