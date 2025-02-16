import httpService from "./httpService";

export const addTask = async (description: string) => {
  const res = await httpService.post("todoRoutes", {
    description,
  });
  return res.data;
};

export const getTasks = async () => {
  const res = await httpService.get("todoRoutes");
  return res.data;
};

export const completeTask = async (todoId: string) => {
  console.log(todoId);
  const res = await httpService.put(`todoRoutes/${todoId}`, {
    completed: true,
  });
  return;
};
