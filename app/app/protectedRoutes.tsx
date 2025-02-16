import {AuthContext} from "@/contexts/authContext";
import {Stack} from "expo-router";
import React from "react";
import {useContext} from "react";

function ProtectedRoutes() {
  const {loading, user} = useContext(AuthContext);

  return (
    <Stack>
      {user ? (
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
