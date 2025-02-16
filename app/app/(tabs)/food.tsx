// app/(tabs)/food.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState } from "react";
import {
  View,
  Text,
  Button,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { MaterialIcons } from "@expo/vector-icons";
import { updateArduinoState } from "@/services/stateService";

const CATEGORIES = ["non_food", "food", "junk_food"];
const API_URL = process.env.EXPO_PUBLIC_API_URL;

const Food = () => {
  const [image, setImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [prediction, setPrediction] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Sorry, we need camera permissions to make this work!");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5, // Reduce quality to decrease file size
        maxWidth: 1000, // Limit maximum width
        maxHeight: 1000, // Limit maximum height
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
        await processImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert("Error", "Failed to take photo");
    }
  };

  // In food.tsx, modify the processImage function:

  const processImage = async (uri: string) => {
    try {
      setIsLoading(true);
      const endpoint = `${API_URL}ml/predict`;
      console.log("Sending request to:", endpoint);

      const formData = new FormData();
      formData.append("image", {
        uri: uri,
        type: "image/jpeg",
        name: "image.jpg",
      } as any);

      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("ML Prediction failed:", errorText);
        throw new Error(`ML Prediction failed: ${response.status}`);
      }

      const result = await response.json();
      setPrediction(result.category);
      setConfidence(result.confidence);

      const token = await AsyncStorage.getItem("token");
      if (!token) {
        throw new Error("No auth token found");
      }

      const updateEndpoint = `${API_URL}auth/me`;
      const updateResponse = await fetch(updateEndpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          foodCategory: result.category,
          update: {
            healthPoints:
              result.category === "food"
                ? 10
                : result.category === "junk_food"
                ? 5
                : 0,
            mood:
              result.category === "food"
                ? "happy"
                : result.category === "junk_food"
                ? "sad"
                : "neutral",
          },
        }),
      });

      if (!updateResponse.ok) {
        const updateErrorText = await updateResponse.text();
        console.error("Update user failed:", updateErrorText);
        throw new Error("Failed to update user state");
      }

      const updateResult = await updateResponse.json();
      console.log("User update result:", updateResult);

      await updateArduinoState();

      Alert.alert(
        "Food Detected!",
        result.category === "food"
          ? "Healthy food! Your pet's health increased by 10 points and they're happy!"
          : result.category === "junk_food"
          ? "Junk food! Your pet's health increased by 5 points but they're sad..."
          : "This isn't food! Your pet's state remains unchanged."
      );
    } catch (error) {
      console.error("Error processing image:", error);
      Alert.alert(
        "Error",
        error instanceof Error
          ? error.message
          : "Failed to process image. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Food Detector</Text>

      <Button title="Take a Photo" onPress={takePhoto} />

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text>Processing image...</Text>
        </View>
      )}

      {image && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: image }} style={styles.image} />
          {prediction && (
            <View style={styles.predictionContainer}>
              <MaterialIcons
                name={prediction === "food" ? "check-circle" : "error"}
                size={24}
                color={
                  prediction === "food"
                    ? "green"
                    : prediction === "junk_food"
                    ? "orange"
                    : "red"
                }
              />
              <Text style={styles.predictionText}>
                This appears to be {prediction.replace("_", " ")}
                {confidence &&
                  `\nConfidence: ${(confidence * 100).toFixed(2)}%`}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  imageContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  image: {
    width: 300,
    height: 300,
    borderRadius: 10,
    marginBottom: 20,
  },
  loadingContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  predictionContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  predictionText: {
    marginLeft: 10,
    fontSize: 16,
  },
});

export default Food;
