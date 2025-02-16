import toastService from "@/services/toastService";
import {createContext, ReactNode, useEffect, useState} from "react";

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

export const ToDoProvider = ({children}: {children: ReactNode}) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTodos = async () => {
      setLoading(false);
    };
    fetchTodos();
  }, []);

  const [todos, setTodos] = useState([
    {
      _id: "1",
      userId: "123",
      description: "Brush my teeth",
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: "2",
      userId: "123",
      description: "Brush my teeth",
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: "3",
      userId: "123",
      description: "Brush my teeth",
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  const addTodo = async (todo: string) => {
    // api call
    setTodos((todos) => {
      return [
        ...todos,
        {
          _id: new Date().toString(),
          userId: "123",
          description: todo,
          completed: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
    });
    toastService.success(
      "To-do added!",
      "Complete it to improve your pet's mood"
    );
  };

  // Function to mark a todo as completed
  const completeTodo = async (todoId: string) => {
    setTodos((prevTodos) =>
      prevTodos.map((todo) =>
        todo._id === todoId
          ? {...todo, completed: true, updatedAt: new Date()}
          : todo
      )
    );
    toastService.success(
      "To-do completed!",
      "Your pet's mood has been improved"
    );
  };

  return (
    <ToDoContext.Provider value={{todos, addTodo, completeTodo, loading}}>
      {children}
    </ToDoContext.Provider>
  );
};
