import {getMe, Userlogin, UserRegister} from "@/services/authService";
import toastService from "@/services/toastService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {createContext, ReactNode, useEffect, useState} from "react";

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

export const AuthProvider = ({children}: {children: ReactNode}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        const user = await getMe();
        setUser(user);
      }
      setLoading(false);
    };
    fetchUser();
  });

  const register = async (registerInput: RegisterInput) => {
    try {
      const data = await UserRegister(registerInput);
      const token = data.token;
      await AsyncStorage.setItem("token", token);
      setUser(data.user);
    } catch (e: any) {
      toastService.success("Error", e.message);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const data = await Userlogin(email, password);
      const token = data.token;
      await AsyncStorage.setItem("token", token);
      setUser(data.user);
    } catch (e: any) {
      toastService.success("Error", e.message);
    }
  };

  const logout = () => {
    AsyncStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{user, register, login, logout, loading}}>
      {children}
    </AuthContext.Provider>
  );
};
