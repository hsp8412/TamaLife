// app/(tabs)/food.tsx
import React, {useEffect, useState} from "react";
import {View, Text, Button, Image, StyleSheet, Alert} from "react-native";
import * as ImagePicker from "expo-image-picker";

export default function FoodScreen() {
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  useEffect(() => {
    openCamera();
  }, []);

  const openCamera = async () => {
    try {
      const {status} = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Camera Permission Required",
          "Please allow camera access."
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets[0].uri) {
        setPhotoUri(result.assets[0].uri);
      } else {
        // If user cancels the camera, they can tap the tab again or you decide the flow
        setPhotoUri(null);
      }
    } catch (error) {
      console.error("Camera error:", error);
    }
  };

  const handleRetake = () => {
    setPhotoUri(null);
    openCamera();
  };

  const handleDone = async () => {
    if (!photoUri) {
      Alert.alert("No photo taken", "Please take a picture first.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("photo", {
        uri: photoUri,
        name: "foodphoto.jpg",
        type: "image/jpeg",
      } as any);

      const response = await fetch("http://172.20.10.4:4000/api/food/", {
        method: "POST",
        headers: {"Content-Type": "multipart/form-data"},
        body: formData,
      });
      console.log(response);
      const data = await response.json();
      console.log("Server response:", data);

      Alert.alert("Success", "Photo uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      Alert.alert("Error", "Failed to upload image.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Food Camera</Text>
      {photoUri ? (
        <>
          <Image source={{uri: photoUri}} style={styles.preview} />
          <Button title="Retake" onPress={handleRetake} />
          <Button title="Done" onPress={handleDone} />
        </>
      ) : (
        <Text>No photo taken yet...</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  title: {
    fontSize: 20,
    marginBottom: 10,
  },
  preview: {
    width: 200,
    height: 200,
    borderWidth: 1,
    borderColor: "#ccc",
    marginVertical: 10,
  },
});
