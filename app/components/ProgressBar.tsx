import {AuthContext} from "@/contexts/authContext";
import {useContext, useEffect, useState} from "react";
import {Button, Text, View} from "react-native";
import * as Progress from "react-native-progress";

const ProgressBar = () => {
  const {user, loading} = useContext(AuthContext);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (user) {
      console.log(user.healthPoints / 100);
      setProgress(user.healthPoints / 100);
    }
  }, [user, loading]);

  if (loading) {
    return <Text>Loading...</Text>;
  }

  console.log(user);
  return (
    <View
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: 50,
      }}
    >
      <Text style={{fontSize: 20, fontWeight: "bold"}}>
        HP:{user?.healthPoints}
      </Text>
      <Progress.Bar progress={progress} width={200} height={20} />
    </View>
  );
};

export default ProgressBar;
