import {StyleSheet, Button, View, Text} from "react-native";
import {useContext, useState} from "react";
import {AuthContext} from "@/contexts/authContext";
import ProgressBar from "@/components/ProgressBar";
import HappySprite from "@/components/HappySprite";
import SadSprite from "@/components/SadSprite";
import NeutralSprite from "@/components/NeutralSprite";

export default function HomeScreen() {
  const {loading, user, logout} = useContext(AuthContext);
  const [testMood, setTestMood] = useState("neutral");

  if (loading) {
    return <Text style={styles.loadingText}>Loading...</Text>;
  }

  return (
    <View style={styles.container}>
      {/* Image Section */}
      <View style={styles.imageContainer}>
        {(user?.mood === "happy" && <HappySprite />) ||
          (user?.mood === "neutral" && <NeutralSprite />) ||
          (user?.mood === "sad" && <SadSprite />)}
        {/* {
          {
            happy: <HappySprite />,
            neutral: <NeutralSprite />,
            sad: <SadSprite />,
          }[testMood]
        } */}
      </View>
      {/* User Info Section */}
      <View style={styles.infoContainer}>
        <Text style={styles.moodText}>Mood: {user?.mood ?? "Unknown"}</Text>
        <ProgressBar />
      </View>

      {/* Logout Button (Optional) */}
      <Button title="Logout" onPress={logout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    gap: 20,
  },
  imageContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: 200,
    height: 200,
  },
  infoContainer: {
    alignItems: "center",
    gap: 10,
  },
  moodText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
});
