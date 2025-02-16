import Toast from "react-native-toast-message";

const showToast = (
  type: string,
  text1: string,
  text2: string,
  position = "top",
  visibilityTime = 3000
) => {
  Toast.show({
    type,
    text1,
    text2,
    position: position as any,
    visibilityTime,
  });
};

const toastService = {
  success: (text1: string, text2: string) => showToast("success", text1, text2),
  error: (text1: string, text2: string) => showToast("error", text1, text2),
  info: (text1: string, text2: string) => showToast("info", text1, text2),
};

export default toastService;
