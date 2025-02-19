import {AuthContext} from "@/contexts/authContext";
import {Stack} from "expo-router";
import React from "react";
import {useContext} from "react";

export default function ProtectedRoutes() {
  const {loading, user} = useContext(AuthContext);
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitle: "Tama Life",
      }}
    >
      {false ? (
        <>
          <Stack.Screen name="(tabs)" options={{headerShown: false}} />
          <Stack.Screen name="+not-found" />
        </>
      ) : (
        <Stack.Screen name="login" options={{headerShown: false}} />
      )}
    </Stack>
  );
}
