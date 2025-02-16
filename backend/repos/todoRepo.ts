import Todo from "../models/todo";

// ✅ Get all todos for a user
export const getTodos = async (userId: string) => {
  return await Todo.find({ userId }); // 🔥 Removed `where`
};

// ✅ Get a single todo by ID
export const getTodoById = async (id: string, userId: string) => {
  return await Todo.findOne({ _id: id, userId }); // 🔥 Replaced `id` with `_id`
};

// ✅ Create a new todo
export const createTodo = async (userId: string, description: string) => {
  if (!description) throw new Error("Description is required");
  return await Todo.create({ userId, description, completed: false }); // 🔥 Works in Mongoose
};

// ✅ Update a todo's completed status
export const updateTodo = async (id: string, userId: string, completed: boolean) => {
  const todo = await getTodoById(id, userId);
  if (!todo) throw new Error("Todo not found");

  await Todo.findOneAndUpdate({ _id: id, userId }, { completed }, { new: true }); // 🔥 Corrected `.update()`
  return { message: "Updated successfully" };
};

// ✅ Delete a todo
export const deleteTodo = async (id: string, userId: string) => {
  const todo = await getTodoById(id, userId);
  if (!todo) throw new Error("Todo not found");

  await Todo.findOneAndDelete({ _id: id, userId }); // 🔥 Corrected `.destroy()`
  return { message: "Deleted successfully" };
};
