import httpService from "./httpService";

export const Userlogin = async (email: string, password: string) => {
  const res = await httpService.post("auth", {email, password});
  console.log(res);
  return res.data;
};

export const UserRegister = async (registerInput: RegisterInput) => {
  const res = await httpService.post("auth/register", registerInput);
  return res.data;
};

export const getMe = async () => {
  const res = await httpService.get("auth/me");
  return res.data;
};
