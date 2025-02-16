import React, {useEffect} from "react";
import {View, Image} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

const SadSprite = () => {
  const frame = useSharedValue(0);
  const frameWidth = 32;
  const totalWidth = 288;
  const totalFrames = totalWidth / frameWidth; // 9 frames

  useEffect(() => {
    frame.value = withRepeat(
      withTiming(totalFrames - 1, {duration: 1000}),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    left: -frameWidth * Math.round(frame.value),
  }));

  return (
    <View
      style={{
        width: frameWidth,
        height: 32,
        overflow: "hidden",
        transform: [{scale: 4}],
      }}
    >
      <Animated.Image
        source={require("@/assets/images/sad.png")}
        style={[
          {width: totalWidth, height: 32, position: "absolute", top: 0},
          animatedStyle,
        ]}
      />
    </View>
  );
};

export default SadSprite;
