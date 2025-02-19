import toastService from "@/services/toastService";
import { addTask, completeTask, getTasks } from "@/services/todoService";
import { createContext, ReactNode, useEffect, useState } from "react";

type IToDoContext = {
  todos: Todo[];
  loading: boolean;
  addTodo: (todo: string) => void;
  completeTodo: (todoId: string) => void;
};

export const ToDoContext = createContext<IToDoContext>({
  todos: [],
  loading: true,
  addTodo: () => {},
  completeTodo: () => {},
});

export const ToDoProvider = ({ children }: { children: ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const [todos, setTodos] = useState<Todo[]>([]);

  useEffect(() => {
    const fetchTodos = async () => {
      const data = await getTasks();
      const sortedData = data.sort(
        (a: Todo, b: Todo) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setTodos(sortedData);
      setLoading(false);
    };
    fetchTodos();
  }, []);

  const addTodo = async (todo: string) => {
    // api call
    try {
      const task = await addTask(todo);
      setTodos((todos) => {
        return [task, ...todos];
      });
      toastService.success(
        "To-do added!",
        "Complete it to improve your pet's mood"
      );
    } catch (e: any) {
      console.log(e);
      toastService.error("Error", "Failed to add a new to-do");
    }
  };

  // Function to mark a todo as completed
  const completeTodo = async (todoId: string) => {
    console.log(todoId);
    try {
      await completeTask(todoId);
      setTodos((prevTodos) =>
        prevTodos.map((todo) =>
          todo._id === todoId
            ? { ...todo, completed: true, updatedAt: new Date() }
            : todo
        )
      );
      toastService.success(
        "To-do completed!",
        "Your pet's mood has been improved"
      );
    } catch (e: any) {
      toastService.error("Error", "Failed to complete a to-do");
    }
  };

  return (
    <ToDoContext.Provider value={{ todos, addTodo, completeTodo, loading }}>
      {children}
    </ToDoContext.Provider>
  );
};
