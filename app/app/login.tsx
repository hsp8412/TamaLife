import {View, Text, TextInput, Button, StyleSheet} from "react-native";

import {useContext, useState} from "react";
import {useRouter} from "expo-router";
import {AuthContext} from "@/contexts/authContext";
import PrimaryButton from "@/components/PrimaryButton";

export default function LoginScreen() {
  const {login} = useContext(AuthContext);
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    await login(email, password);
    router.replace("/");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        autoCapitalize="none"
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        autoCapitalize="none"
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <View>
        <Button title="register" onPress={() => {}} color={"black"} />
      </View>

      <PrimaryButton onPress={handleLogin}>Login</PrimaryButton>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, justifyContent: "center", alignItems: "center"},
  title: {fontSize: 28, fontWeight: "bold", marginBottom: 20},
  input: {width: "80%", padding: 10, borderWidth: 1, marginBottom: 10},
  loginButton: {
    width: "80%",
    padding: 10,
    backgroundColor: "blue",
    borderRadius: 5,
  },
});
