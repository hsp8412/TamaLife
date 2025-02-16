import { getMe, Userlogin, UserRegister } from "@/services/authService";
import toastService from "@/services/toastService";
import { updateArduinoState } from "@/services/stateService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, ReactNode, useEffect, useState } from "react";

type IAuthContext = {
  user: User | null;
  register: (registerInput: RegisterInput) => void;
  login: (email: string, password: string) => void;
  logout: () => void;
  loading: boolean;
};

export const AuthContext = createContext<IAuthContext>({
  user: null,
  register: () => {},
  login: () => {},
  logout: () => {},
  loading: false,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Update Arduino when user state changes
  useEffect(() => {
    if (user?.healthPoints) {
      updateArduinoState().catch(console.error);
    }
  }, [user?.healthPoints, user?.mood]); // Monitor both HP and mood changes

  useEffect(() => {
    const fetchUser = async () => {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        const data = await getMe();
        setUser(data.user);
        // Update Arduino with initial state
        try {
          await updateArduinoState();
        } catch (error) {
          console.error("Failed to update Arduino initial state:", error);
        }
      }
      setLoading(false);
      console.log("done");
    };
    fetchUser();
    // Fetch user every 1 minute
    const interval = setInterval(() => {
      fetchUser();
    }, 10000); // 60 seconds

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, []);

  const register = async (registerInput: RegisterInput) => {
    try {
      const data = await UserRegister(registerInput);
      const token = data.token;
      await AsyncStorage.setItem("token", token);
      setUser(data.user);
      // Update Arduino after registration
      await updateArduinoState();
    } catch (e: any) {
      toastService.success("Error", "Failed to register");
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const data = await Userlogin(email, password);
      console.log(email, password);
      const token = data.token;
      await AsyncStorage.setItem("token", token);
      setUser(data.user);
      // Update Arduino after login
      await updateArduinoState();
    } catch (e: any) {
      toastService.error("Error", "Invalid credentials");
    }
  };

  const logout = async () => {
    console.log("logout");
    await AsyncStorage.removeItem("token");
    setUser(null);
    // Update Arduino after logout (optional, depending on your requirements)
    try {
      await updateArduinoState();
    } catch (error) {
      console.error("Failed to update Arduino state after logout:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, register, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
