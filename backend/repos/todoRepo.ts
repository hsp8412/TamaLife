import Todo from "../models/todo.js";
import { User } from "../models/user.js";

// ✅ Get all todos for a user
export const getTodos = async (userId: string) => {
  return await Todo.find({ userId }); // 🔥 Removed where
};

// ✅ Get a single todo by ID
export const getTodoById = async (id: string, userId: string) => {
  return await Todo.findOne({ _id: id, userId }); // 🔥 Replaced id with _id
};

// ✅ Create a new todo
export const createTodo = async (userId: string, description: string) => {
  if (!description) throw new Error("Description is required");
  return await Todo.create({ userId, description, completed: false }); // 🔥 Works in Mongoose
};

// ✅ Update a todo's completed status
// export const updateTodo = async (
//   id: string,
//   userId: string,
//   completed: boolean
// ) => {
//   const todo = await getTodoById(id, userId);
//   if (!todo) throw new Error("Todo not found");

//   await Todo.findOneAndUpdate(
//     { _id: id, userId },
//     { completed },
//     { new: true }
//   ); // 🔥 Corrected .update()

//   const user = await User.findOne({ _id: userId });
//   let nextmood = user.mood.toString();
//   if (nextmood == "sad") {
//     nextmood = "neutral";
//   } else if (nextmood == "neutral") {
//     nextmood = "happy";
//   }
//   console.log(nextmood);

//   await User.findOneAndUpdate({ _id: userId }, { mood: nextmood });

//   return { message: "Updated successfully" };
// };
export const updateTodo = async (
  id: string,
  userId: string,
  completed: boolean
) => {
  // 1. Find the Todo item
  const todo = await getTodoById(id, userId);
  if (!todo) throw new Error("Todo not found");

  // 2. Update the todo's completed status
  await Todo.findOneAndUpdate(
    { _id: id, userId },
    { completed },
    { new: true }
  );

  console.log(userId);

  // 3. Fetch the user
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  // 4. Determine the next mood
  const MOOD_ORDER = ["sad", "neutral", "happy"];
  const currentMoodIndex = MOOD_ORDER.indexOf(user.mood);
  const nextMood =
    currentMoodIndex < MOOD_ORDER.length - 1
      ? MOOD_ORDER[currentMoodIndex + 1]
      : user.mood; // Don't go beyond "happy"

  // 5. Update the user's mood
  if (nextMood !== user.mood) {
    await User.findByIdAndUpdate(userId, { mood: nextMood });
  }

  return { message: "Updated successfully", newMood: nextMood };
};

// ✅ Delete a todo
export const deleteTodo = async (id: string, userId: string) => {
  const todo = await getTodoById(id, userId);
  if (!todo) throw new Error("Todo not found");

  await Todo.findOneAndDelete({ _id: id, userId }); // 🔥 Corrected .destroy()
  return { message: "Deleted successfully" };
};
