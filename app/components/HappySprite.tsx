import React, {useEffect} from "react";
import {View, Image} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

const HappySprite = () => {
  const frame = useSharedValue(0);

  //   // Change frames instantly (no easing needed)
  //   frame.value = withRepeat(
  //     withTiming(3, {duration: 1000}), // Instantly switch frames
  //     -1, // Infinite loop
  //     false
  //   );

  useEffect(() => {
    frame.value = withRepeat(withTiming(3, {duration: 1200}), -1, false);
  }, []);

  // Update `left` directly to switch frames without sliding
  const animatedStyle = useAnimatedStyle(() => {
    return {
      left: -32 * Math.round(frame.value), // Instantly move to the next frame
    };
  });

  return (
    <View
      style={{
        width: 32, // Frame width
        height: 32, // Frame height
        overflow: "hidden", // Ensures only one frame is visible
        transform: [{scale: 4}], // 🔥 Makes the sprite 3x bigger
      }}
    >
      <Animated.Image
        source={require("@/assets/images/happy.png")}
        style={[
          {
            width: 128, // Full sprite sheet width
            height: 32, // Height remains the same
            position: "absolute",
            top: 0,
          },
          animatedStyle, // Apply instant frame switching
        ]}
      />
    </View>
  );
};

export default HappySprite;
