import React, { useEffect } from "react";
import { View, Pressable } from "react-native";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withSpring,
} from "react-native-reanimated";

const NeutralSprite = () => {
  const frame = useSharedValue(0);
  const bounce = useSharedValue(0);
  const frameWidth = 32;
  const totalWidth = 320;
  const totalFrames = totalWidth / frameWidth;

  useEffect(() => {
    frame.value = withRepeat(
      withTiming(totalFrames - 1, { duration: 1200 }),
      -1,
      false
    );
  }, []);

  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    bounce.value = withSequence(
      // Quick bounce up
      withSpring(-10, {
        damping: 12, // Higher damping for quick up movement
        mass: 0.01, // Very light mass for speed
        stiffness: 300, // Higher stiffness for snappiness
      }),
      // Fast return down
      withSpring(0, {
        damping: 15, // High damping to prevent wobble
        mass: 0.4, // Light mass
        stiffness: 250, // High stiffness for quick return
      })
    );
  };

  const animatedStyle = useAnimatedStyle(() => ({
    left: -frameWidth * Math.round(frame.value),
    transform: [{ translateY: bounce.value }],
  }));

  return (
    <Pressable onPress={handlePress}>
      <View
        style={{
          width: frameWidth,
          height: 32,
          overflow: "hidden",
          transform: [{ scale: 4 }],
        }}
      >
        <Animated.Image
          source={require("@/assets/images/neutral.png")}
          style={[
            {
              width: totalWidth,
              height: 32,
              position: "absolute",
              top: 0,
            },
            animatedStyle,
          ]}
        />
      </View>
    </Pressable>
  );
};

export default NeutralSprite;
